/**
 * API Routes for User Profile
 * 
 * This file defines the API routes for getting and updating
 * the current user's profile information.
 */

import { NextResponse } from 'next/server';
import { env } from 'process';
import { getAuthUser } from '@/lib/auth/auth-middleware';

// Import the auth service
const AuthService = require('@/lib/auth/auth-service');

/**
 * GET /api/auth/user
 * Gets the current authenticated user's profile
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
    
    // Initialize auth service
    const authService = new AuthService(db);
    
    // Get full user details
    const user = await authService.getUserById(authUser.id);
    
    // If user not found
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { user }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/user
 * Updates the current authenticated user's profile
 */
export async function PUT(request) {
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
    
    // Get update data
    const updates = await request.json();
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize auth service
    const authService = new AuthService(db);
    
    // Update the user
    const updatedUser = await authService.updateUser(authUser.id, updates);
    
    return NextResponse.json({ 
      success: true, 
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
