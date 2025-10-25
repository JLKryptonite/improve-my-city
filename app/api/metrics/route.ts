import { NextRequest, NextResponse } from 'next/server';
import { getComplaintMetrics } from '@/lib/complaintService';

export async function GET() {
  try {
    const metrics = await getComplaintMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
