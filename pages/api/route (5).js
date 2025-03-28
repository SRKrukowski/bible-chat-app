/**
 * API Routes for Today's Chat Messages
 * 
 * This file defines the API routes for retrieving today's chat messages.
 */

import { NextResponse } from 'next/server';
import { env } from 'process';
import { getAuthUser } from '@/lib/auth/auth-middleware';

// Import the message service
const MessageService = require('@/lib/chat/message-service');

/**
 * GET /api/messages/today
 * Gets today's chat messages
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize message service
    const messageService = new MessageService(db);
    
    // Get today's messages
    const messages = await messageService.getTodaysMessages(limit, offset);
    
    return NextResponse.json({ 
      success: true, 
      data: { messages }
    });
  } catch (error) {
    console.error('Error getting today\'s messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}
