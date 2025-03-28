/**
 * API Routes for Messages by Date
 * 
 * This file defines the API routes for retrieving chat messages for a specific date.
 */

import { NextResponse } from 'next/server';
import { env } from 'process';
import { getAuthUser } from '@/lib/auth/auth-middleware';

// Import the message service
const MessageService = require('@/lib/chat/message-service');

/**
 * GET /api/messages/date/[date]
 * Gets chat messages for a specific date
 */
export async function GET(request, { params }) {
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
    
    const { date } = params;
    
    // Validate date format (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize message service
    const messageService = new MessageService(db);
    
    // Get messages for the specified date
    const messages = await messageService.getMessagesByDate(date, limit, offset);
    
    return NextResponse.json({ 
      success: true, 
      data: { messages }
    });
  } catch (error) {
    console.error('Error getting messages for date:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}
