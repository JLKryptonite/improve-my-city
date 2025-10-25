import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/models/Complaint';
import { stripAndCompress } from '@/lib/imageProcessing';
import { storeImage } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length < 1) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    const urls: string[] = [];

    // Process each uploaded image
    for (const file of images) {
      if (!file || !(file instanceof File)) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const cleaned = await stripAndCompress(buffer);
      const url = await storeImage(cleaned);
      urls.push(url);
    }

    // Add images to progress photos
    complaint.photos_progress.push(...urls);

    // Add timeline entry
    complaint.timeline.push({
      ts: new Date(),
      type: 'no_progress_update',
      actor: 'public',
      images: urls,
    });

    complaint.last_activity_at = new Date();
    await complaint.save();

    return NextResponse.json({
      status: 'appended',
      complaint_id: complaint._id
    });

  } catch (error: any) {
    console.error('Error appending update:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to append update' },
      { status: 400 }
    );
  }
}
