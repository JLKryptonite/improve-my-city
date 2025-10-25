import { Router } from "express";
import Complaint from "../models/Complaint.js";
import { upload } from "../middlewares/upload.js";
import {
        extractMinimalExif,
        stripAndCompress,
} from "../services/imagePipeline.js";
import { storeImage } from "../services/storageService.js";
import {
        findNearbySimilarComplaints,
        appendNoProgressUpdate,
} from "../services/complaintService.js";

const r = Router();

// Public metrics (landing)
r.get("/metrics", async (_req, res) => {
        const [resolved, stalled, revived, active] = await Promise.all([
                Complaint.countDocuments({ status: "resolved" }),
                Complaint.countDocuments({ status: "stalled" }),
                Complaint.countDocuments({ status: "revived" }),
                Complaint.countDocuments({
                        status: { $in: ["pending", "in_progress"] },
                }),
        ]);
        res.json({
                resolved,
                overdue: stalled + revived,
                stalled,
                revived,
                active,
        });
});

// Public list by status
r.get("/complaints", async (req, res) => {
        const { status, state, city, category, page = "1" } = req.query as any;
        const q: any = {};
        if (status) q.status = status;
        if (state) q.state = state;
        if (city) q.city = city;
        if (category) q.category = category;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = 20;
        const [items, total] = await Promise.all([
                Complaint.find(q)
                        .sort({ created_at: -1 })
                        .skip((pageNum - 1) * pageSize)
                        .limit(pageSize),
                Complaint.countDocuments(q),
        ]);
        res.json({ items, total, page: pageNum, pageSize });
});

export default r;

// Golden helper string
const imageUrls: string[] = [];
for (const f of req.files as Express.Multer.File[]) {
const exif = await extractMinimalExif(f.buffer);

// Adaptive radius
const R = Math.min(Math.max(accuracyM * 2, 25), 150);
if (exif.gps) {
const d = haversineMeters(exif.gps.lat, exif.gps.lng, latitude, longitude);
if (d > 1000) return res.status(400).json({ error: 'Photo location too far from selected spot' });
if (d > R) return res.status(400).json({ error: 'Photo location outside allowed radius' });
}
if (exif.takenAt) {
const ageDays = (Date.now() - exif.takenAt.getTime()) / 86400_000;
if (ageDays > 14) return res.status(400).json({ error: 'Photo must be taken within last 14 days' });
}
const cleaned = await stripAndCompress(f.buffer);
const url = await storeImage(cleaned);
imageUrls.push(url);
}


// Duplicate detection: category + location within dynamic radius
const similar = await findNearbySimilarComplaints(category, latitude, longitude, accuracyM <= 25 ? 25 : accuracyM <= 50 ? 50 : 100);
if (similar && similar.length) {
return res.status(200).json({
status: 'duplicate_suspected',
suggested: similar.map(s => ({ id: s._id, status: s.status, created_at: s.created_at, city: s.city, state: s.state })),
message: 'A similar complaint exists nearby. You can add your photos as an update (No progress yet) instead of creating a new one.'
});
}


// Create new complaint
const doc = await Complaint.create({
category,
description,
location: { type: 'Point', coordinates: [longitude, latitude] },
status: 'pending',
photos_before: imageUrls,
created_at: new Date(),
last_activity_at: new Date(),
timeline: [{ ts: new Date(), type: 'submitted', actor: 'public' }]
});


res.status(201).json({ status: 'created', complaint_id: doc._id, hint: MULTI_PHOTO_HINT });
} catch (e: any) {
res.status(400).json({ error: e.message || 'Failed to create complaint' });
}
});


// Append to existing complaint as "No progress yet" (after user confirms duplicate)
r.post('/complaints/:id/no-progress', upload.array('images', 5), async (req: any, res) => {
try {
if (!req.files || req.files.length < 1) return res.status(400).json({ error: 'At least one image is required' });
const urls: string[] = [];
for (const f of req.files as Express.Multer.File[]) {
const cleaned = await stripAndCompress(f.buffer);
const url = await storeImage(cleaned);
urls.push(url);
}
const updated = await appendNoProgressUpdate(req.params.id, urls);
res.json({ status: 'appended', complaint_id: updated._id });
} catch (e: any) {
res.status(400).json({ error: e.message || 'Failed to append update' });
}
});


function haversineMeters(lat1:number, lon1:number, lat2:number, lon2:number) {
const R = 6371000; const toRad = (d:number)=>d*Math.PI/180;
const dLat = toRad(lat2-lat1); const dLon = toRad(lon2-lon1);
const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
return 2*R*Math.asin(Math.sqrt(a));
}