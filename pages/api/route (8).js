/**
 * API Routes for User Logout
 * 
 * This file defines the API routes for user logout
 * by clearing the authentication token.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Logs out a user by clearing the auth token
 */
export async function POST() {
  try {
    // Clear the auth token cookie
    cookies().delete('auth_token');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Error logging out user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log out' },
      { status: 500 }
    );
  }
}
