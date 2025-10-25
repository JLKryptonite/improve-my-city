import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/models/Complaint';
import { authenticateRequest } from '@/lib/auth';
import { mergeComplaints } from '@/lib/complaintService';

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

    const { target_id, note } = await request.json();

    if (!target_id) {
      return NextResponse.json(
        { error: 'Target ID is required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const merged = await mergeComplaints(id, target_id, note);

    return NextResponse.json(merged);

  } catch (error: any) {
    console.error('Error merging complaints:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to merge complaints' },
      { status: 400 }
    );
  }
}
