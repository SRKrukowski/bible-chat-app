/**
 * API Routes for Bible Readings by Date
 * 
 * This file defines the API routes for fetching Bible readings
 * for a specific date using the readings service.
 */

import { NextResponse } from 'next/server';
const readingsService = require('@/lib/bible/readings-service');

/**
 * GET /api/readings/date/[date]
 * Returns readings for a specific date
 */
export async function GET(request, { params }) {
  try {
    const { date } = params;
    
    // Validate date format (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }
    
    const readings = await readingsService.getReadingsForDate(date);
    return NextResponse.json({ success: true, data: readings });
  } catch (error) {
    console.error('Error fetching readings for date:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}
