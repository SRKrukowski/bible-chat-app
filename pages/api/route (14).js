/**
 * API Routes for Bible Readings
 * 
 * This file defines the API routes for fetching Bible readings
 * using the readings service.
 */

import { NextResponse } from 'next/server';
const readingsService = require('@/lib/bible/readings-service');

/**
 * GET /api/readings/today
 * Returns today's readings
 */
export async function GET(request) {
  try {
    const readings = await readingsService.getTodaysReadings();
    return NextResponse.json({ success: true, data: readings });
  } catch (error) {
    console.error('Error fetching today\'s readings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}
