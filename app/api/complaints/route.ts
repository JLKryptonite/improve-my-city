import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/models/Complaint';
import {
  extractMinimalExif,
  stripAndCompress,
  calculateHaversineDistance,
} from '@/lib/imageProcessing';
import { storeImage } from '@/lib/storage';
import { findNearbySimilarComplaints } from '@/lib/complaintService';
import type { ComplaintFilters, Status } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const validStatuses: Status[] = ['pending', 'in_progress', 'resolved', 'stalled', 'revived'];
    const filters: ComplaintFilters = {
      status: statusParam && validStatuses.includes(statusParam as Status) ? statusParam as Status : undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      ward: searchParams.get('ward') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getComplaintsWithFilters({ ...filters, page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

async function getComplaintsWithFilters(filters: ComplaintFilters & { page?: number; limit?: number }) {
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
    items: complaints.map(complaint => complaint.toObject()),
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const accuracyM = parseInt(formData.get('accuracyM') as string || '10', 10);
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!category || !description || !latitude || !longitude) {
      return NextResponse.json(
        {
          error: 'Category, description, latitude, and longitude are required'
        },
        { status: 400 }
      );
    }

    if (!images || images.length < 1) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    const imageUrls: string[] = [];

    // Process each uploaded image
    for (const file of images) {
      if (!file || !(file instanceof File)) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const exif = await extractMinimalExif(buffer);

      // Validate photo location if available
      if (exif.gps) {
        const distance = calculateHaversineDistance(
          exif.gps.lat,
          exif.gps.lng,
          parseFloat(latitude),
          parseFloat(longitude)
        );

        if (distance > 1000) {
          return NextResponse.json(
            { error: 'Photo location too far from selected spot' },
            { status: 400 }
          );
        }

        // Adaptive radius based on accuracy
        const maxRadius = Math.min(Math.max(accuracyM * 2, 25), 150);
        if (distance > maxRadius) {
          return NextResponse.json(
            { error: 'Photo location outside allowed radius' },
            { status: 400 }
          );
        }
      }

      // Validate photo age
      if (exif.takenAt) {
        const ageDays = (Date.now() - exif.takenAt.getTime()) / 86400000;
        if (ageDays > 14) {
          return NextResponse.json(
            { error: 'Photo must be taken within last 14 days' },
            { status: 400 }
          );
        }
      }

      const cleaned = await stripAndCompress(buffer);
      const url = await storeImage(cleaned);
      imageUrls.push(url);
    }

    // Check for similar complaints nearby
    const searchRadius = accuracyM <= 25 ? 25 : accuracyM <= 50 ? 50 : 100;
    const similar = await findNearbySimilarComplaints(
      category,
      parseFloat(latitude),
      parseFloat(longitude),
      searchRadius
    );

    if (similar && similar.length > 0) {
      return NextResponse.json({
        status: 'duplicate_suspected',
        suggested: similar.map(s => ({
          id: s._id,
          status: s.status,
          created_at: s.created_at,
          city: s.city,
          state: s.state
        })),
        message: 'A similar complaint exists nearby. You can add your photos as an update (No progress yet) instead of creating a new one.'
      });
    }

    // Create new complaint
    const doc = await Complaint.create({
      category,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      status: 'pending',
      photos_before: imageUrls,
      created_at: new Date(),
      last_activity_at: new Date(),
      timeline: [{
        ts: new Date(),
        type: 'submitted',
        actor: 'public'
      }]
    });

    return NextResponse.json({
      status: 'created',
      complaint_id: doc._id,
      message: 'Complaint created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create complaint' },
      { status: 400 }
    );
  }
}
