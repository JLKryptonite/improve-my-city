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

    const { reason, expected_resume_at } = await request.json();

    if (!reason || !expected_resume_at) {
      return NextResponse.json(
        {
          error: 'Reason and expected_resume_at are required'
        },
        { status: 400 }
      );
    }

    // Add hold period
    complaint.hold_periods.push({
      start: new Date(),
      expected_resume_at: new Date(expected_resume_at),
      reason,
    });

    // Add timeline entry
    complaint.timeline.push({
      ts: new Date(),
      type: 'work_on_hold',
      actor: 'official',
      reason,
      note: `until ${expected_resume_at}`,
    });

    complaint.last_activity_at = new Date();
    await complaint.save();

    return NextResponse.json(complaint.toObject());

  } catch (error: any) {
    console.error('Error putting complaint on hold:', error);
    return NextResponse.json(
      { error: 'Failed to put complaint on hold' },
      { status: 500 }
    );
  }
}
