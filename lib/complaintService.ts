import dbConnect from './db';
import Complaint from '@/models/Complaint';
import type { Complaint as ComplaintType } from '@/types';

export async function findNearbySimilarComplaints(
  category: string,
  latitude: number,
  longitude: number,
  radiusMeters: number
): Promise<ComplaintType[]> {
  await dbConnect();

  const complaints = await Complaint.find({
    category: new RegExp(`^${category}$`, 'i'),
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusMeters,
      },
    },
    status: { $in: ['pending', 'in_progress', 'stalled', 'revived'] },
  }).limit(10);

  return complaints.map(complaint => complaint.toObject());
}

export async function appendNoProgressUpdate(
  complaintId: string,
  imageUrls: string[]
): Promise<ComplaintType> {
  await dbConnect();

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new Error('Complaint not found');
  }

  // Add images to progress photos
  complaint.photos_progress.push(...imageUrls);

  // Add timeline entry
  complaint.timeline.push({
    ts: new Date(),
    type: 'no_progress_update',
    actor: 'public',
    images: imageUrls,
  });

  complaint.last_activity_at = new Date();
  await complaint.save();

  return complaint.toObject();
}

export async function mergeComplaints(
  sourceId: string,
  targetId: string,
  note?: string
): Promise<ComplaintType> {
  await dbConnect();

  const [source, target] = await Promise.all([
    Complaint.findById(sourceId),
    Complaint.findById(targetId),
  ]);

  if (!source || !target) {
    throw new Error('One or both complaints not found');
  }

  // Merge photos
  target.photos_before.push(...source.photos_before);
  target.photos_progress.push(...source.photos_progress);
  target.photos_after.push(...source.photos_after);

  // Add related ID
  if (!target.related_ids.includes(sourceId)) {
    target.related_ids.push(sourceId);
  }

  // Add timeline entry for merge
  target.timeline.push({
    ts: new Date(),
    type: 'assign', // Using assign as closest match for merge
    actor: 'official',
    note: note || `Merged from complaint ${sourceId}`,
  });

  target.last_activity_at = new Date();

  // Delete source complaint
  await source.deleteOne();

  await target.save();
  return target.toObject();
}

export async function getComplaintsWithFilters(filters: {
  status?: string;
  state?: string;
  city?: string;
  category?: string;
  ward?: string;
  page?: number;
  limit?: number;
}): Promise<{
  complaints: ComplaintType[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await dbConnect();

  const {
    status,
    state,
    city,
    category,
    ward,
    page = 1,
    limit = 20,
  } = filters;

  const query: any = {};

  if (status) query.status = status;
  if (state) query.state = state;
  if (city) query.city = city;
  if (category) query.category = new RegExp(`^${category}$`, 'i');
  if (ward) query.ward = ward;

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(query),
  ]);

  return {
    complaints: complaints.map(complaint => complaint.toObject()),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getComplaintMetrics(): Promise<{
  resolved: number;
  stalled: number;
  revived: number;
  active: number;
  overdue: number;
}> {
  await dbConnect();

  const [resolved, stalled, revived, active] = await Promise.all([
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.countDocuments({ status: 'stalled' }),
    Complaint.countDocuments({ status: 'revived' }),
    Complaint.countDocuments({
      status: { $in: ['pending', 'in_progress'] },
    }),
  ]);

  const overdue = stalled + revived;

  return {
    resolved,
    stalled,
    revived,
    active,
    overdue,
  };
}
