import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { CONFIG } from "../config.js";
import AuthorityUser from "../models/AuthorityUser.js";
import { verifyJwt } from "../auth/verifyJwt.js";
import { requireAnyRole } from "../auth/rbac.js";
import Complaint from "../models/Complaint.js";
import { mergeComplaints } from "../services/complaintService.js";

const r = Router();

// --- AUTH ---
r.post("/login", async (req, res) => {
        const { email, password } = req.body;
        const user = await AuthorityUser.findOne({ email });
        if (!user)
                return res.status(401).json({ error: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });
        const token = jwt.sign(
                {
                        sub: user._id.toString(),
                        role: "authority_admin",
                        scope: { state: user.state, city: user.city },
                },
                CONFIG.JWT_SECRET,
                { expiresIn: "12h" }
        );
        res.json({
                token,
                user: {
                        email: user.email,
                        name: user.name,
                        role: "authority_admin",
                },
        });
});

r.use(verifyJwt);

// --- QUEUES ---
r.get(
        "/complaints",
        requireAnyRole(["authority_admin"]),
        async (req: any, res) => {
                const {
                        status,
                        state,
                        city,
                        category,
                        page = "1",
                } = req.query as any;
                const q: any = {};
                if (status) q.status = status;
                if (state) q.state = state;
                else if (req.user.scope?.state) q.state = req.user.scope.state;
                if (city) q.city = city;
                else if (req.user.scope?.city) q.city = req.user.scope.city;
                if (category) q.category = category;
                const pageNum = Math.max(1, parseInt(page, 10) || 1);
                const pageSize = 20;
                const [items, total] = await Promise.all([
                        Complaint.find(q)
                                .sort({ created_at: 1 })
                                .skip((pageNum - 1) * pageSize)
                                .limit(pageSize),
                        Complaint.countDocuments(q),
                ]);
                res.json({ items, total, page: pageNum, pageSize });
        }
);

// --- ACTIONS ---
r.post(
        "/complaints/:id/start-progress",
        requireAnyRole(["authority_admin"]),
        async (req: any, res) => {
                const c = await Complaint.findById(req.params.id);
                if (!c) return res.status(404).json({ error: "Not found" });
                if (!c.first_progress_at) c.first_progress_at = new Date();
                c.status = c.status === "stalled" ? "revived" : "in_progress";
                c.revived_since =
                        c.status === "revived" ? new Date() : c.revived_since;
                c.timeline.push({
                        ts: new Date(),
                        type: "progress_started",
                        actor: "official",
                        note: req.body?.note,
                } as any);
                c.last_activity_at = new Date();
                await c.save();
                res.json(c);
        }
);

r.post(
        "/complaints/:id/progress",
        requireAnyRole(["authority_admin"]),
        async (req, res) => {
                const c = await Complaint.findById(req.params.id);
                if (!c) return res.status(404).json({ error: "Not found" });
                if (!c.first_progress_at) c.first_progress_at = new Date();
                if (c.status === "stalled") {
                        c.status = "revived";
                        c.revived_since = new Date();
                }
                c.timeline.push({
                        ts: new Date(),
                        type: "work_update",
                        actor: "official",
                        note: req.body?.note,
                } as any);
                c.last_activity_at = new Date();
                await c.save();
                res.json(c);
        }
);

r.post(
        "/complaints/:id/hold",
        requireAnyRole(["authority_admin"]),
        async (req, res) => {
                const c = await Complaint.findById(req.params.id);
                if (!c) return res.status(404).json({ error: "Not found" });
                const { reason, expected_resume_at } = req.body;
                if (!reason || !expected_resume_at)
                        return res.status(400).json({
                                error: "reason and expected_resume_at required",
                        });
                c.hold_periods.push({
                        start: new Date(),
                        expected_resume_at: new Date(expected_resume_at),
                        reason,
                });
                c.timeline.push({
                        ts: new Date(),
                        type: "work_on_hold",
                        actor: "official",
                        reason,
                        note: `until ${expected_resume_at}`,
                } as any);
                c.last_activity_at = new Date();
                await c.save();
                res.json(c);
        }
);

r.post(
        "/complaints/:id/resolve",
        requireAnyRole(["authority_admin"]),
        async (req, res) => {
                const c = await Complaint.findById(req.params.id);
                if (!c) return res.status(404).json({ error: "Not found" });
                // TODO: validate after-photos EXIF
                c.status = "resolved";
                c.timeline.push({
                        ts: new Date(),
                        type: "resolved",
                        actor: "official",
                        note: req.body?.note,
                } as any);
                c.last_activity_at = new Date();
                await c.save();
                res.json(c);
        }
);

// MERGE complaints
r.post(
        "/complaints/:id/merge",
        requireAnyRole(["authority_admin"]),
        async (req, res) => {
                const { target_id, note } = req.body;
                try {
                        const merged = await mergeComplaints(
                                req.params.id,
                                target_id,
                                note
                        );
                        res.json(merged);
                } catch (e: any) {
                        res.status(400).json({ error: e.message });
                }
        }
);

export default r;
