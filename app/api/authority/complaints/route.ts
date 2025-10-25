import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/models/Complaint';
import { authenticateRequest } from '@/lib/auth';
import type { ComplaintFilters, Status } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has authority role
    if (token.role !== 'authority_admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const validStatuses: Status[] = ['pending', 'in_progress', 'resolved', 'stalled', 'revived'];
    
    // Validate status parameter (can be single or comma-separated)
    let validatedStatus: string | undefined = undefined;
    if (statusParam) {
      const statusArray = statusParam.split(',').map(s => s.trim());
      const allValid = statusArray.every(s => validStatuses.includes(s as Status));
      if (allValid) {
        validatedStatus = statusParam;
      }
    }
    
    const filters: ComplaintFilters = {
      status: validatedStatus,
      state: searchParams.get('state') || token.scope.state || undefined,
      city: searchParams.get('city') || token.scope.city || undefined,
      category: searchParams.get('category') || undefined,
      ward: searchParams.get('ward') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getComplaintsWithFilters({ ...filters, page, limit });

    return NextResponse.json(result);

  } catch (error: any) {
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

  if (status) {
    // Support comma-separated status values for multiple statuses
    const statusArray = status.split(',').map(s => s.trim());
    if (statusArray.length > 1) {
      query.status = { $in: statusArray };
    } else {
      query.status = status;
    }
  }
  if (state) query.state = state;
  if (city) query.city = city;
  if (category) query.category = new RegExp(`^${category}$`, 'i');
  if (ward) query.ward = ward;

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .sort({ created_at: 1 }) // Oldest first for authority view
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
