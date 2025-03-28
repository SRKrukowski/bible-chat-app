/**
 * API Routes for Chat Messages
 * 
 * This file defines the API routes for creating and retrieving chat messages.
 */

import { NextResponse } from 'next/server';
import { env } from 'process';
import { getAuthUser } from '@/lib/auth/auth-middleware';

// Import the message service
const MessageService = require('@/lib/chat/message-service');

/**
 * POST /api/messages
 * Creates a new chat message
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
    
    // Get message data
    const { content, date } = await request.json();
    
    // Validate input
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Use today's date if not provided
    const messageDate = date || new Date().toISOString().split('T')[0];
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize message service
    const messageService = new MessageService(db);
    
    // Create the message
    const message = await messageService.createMessage(
      authUser.id,
      content,
      messageDate
    );
    
    return NextResponse.json({ 
      success: true, 
      data: { message }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
