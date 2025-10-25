import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/models/Complaint';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Authenticate the request
    const token = await authenticateRequest(request);
    if (!token || token.role !== 'authority_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const { note } = await request.json();

    // Update complaint status
    if (!complaint.first_progress_at) {
      complaint.first_progress_at = new Date();
    }

    complaint.status = complaint.status === 'stalled' ? 'revived' : 'in_progress';
    complaint.revived_since = complaint.status === 'revived' ? new Date() : complaint.revived_since;

    // Add timeline entry
    complaint.timeline.push({
      ts: new Date(),
      type: 'progress_started',
      actor: 'official',
      note,
    });

    complaint.last_activity_at = new Date();
    await complaint.save();

    return NextResponse.json(complaint.toObject());

  } catch (error: any) {
    console.error('Error starting progress:', error);
    return NextResponse.json(
      { error: 'Failed to start progress' },
      { status: 500 }
    );
  }
}
