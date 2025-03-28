/**
 * API Routes for Bible Versions
 * 
 * This file defines the API routes for fetching available Bible versions
 * using the readings service.
 */

import { NextResponse } from 'next/server';
const readingsService = require('@/lib/bible/readings-service');

/**
 * GET /api/readings/versions
 * Returns a list of available Bible versions
 */
export async function GET(request) {
  try {
    const versions = await readingsService.getBibleVersions();
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Bible versions' },
      { status: 500 }
    );
  }
}
