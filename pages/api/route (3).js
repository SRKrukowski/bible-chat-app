/**
 * API Routes for Daily Reset
 * 
 * This file defines the API routes for triggering the daily reset process
 * and checking the status of today's readings.
 */

import { NextResponse } from 'next/server';
import { env } from 'process';
import { getAuthUser } from '@/lib/auth/auth-middleware';

// Import the daily reset service
const DailyResetService = require('@/lib/reset/daily-reset-service');

/**
 * POST /api/reset/daily
 * Triggers the daily reset process
 */
export async function POST(request) {
  try {
    // Get authenticated user from request
    const authUser = getAuthUser(request);
    
    // If not authenticated
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize daily reset service
    const resetService = new DailyResetService(db);
    
    // Perform daily reset
    const result = await resetService.performDailyReset();
    
    return NextResponse.json({ 
      success: true, 
      data: result
    });
  } catch (error) {
    console.error('Error performing daily reset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform daily reset' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reset/status
 * Checks if readings exist for today
 */
export async function GET(request) {
  try {
    // Get authenticated user from request
    const authUser = getAuthUser(request);
    
    // If not authenticated
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize daily reset service
    const resetService = new DailyResetService(db);
    
    // Check if readings exist for today
    const hasReadings = await resetService.checkTodaysReadings();
    
    return NextResponse.json({ 
      success: true, 
      data: { hasReadings }
    });
  } catch (error) {
    console.error('Error checking reset status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check reset status' },
      { status: 500 }
    );
  }
}
