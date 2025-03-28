/**
 * API Routes for User Login
 * 
 * This file defines the API routes for user login
 * using the authentication service.
 */

import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { env } from 'process';

// Import the auth service
const AuthService = require('@/lib/auth/auth-service');

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bible-chat-app-secret-key-for-development'
);

// JWT expiration time (24 hours)
const JWT_EXPIRATION = '24h';

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize auth service
    const authService = new AuthService(db);
    
    // Authenticate the user
    const user = await authService.loginUser(email, password);
    
    // If authentication failed
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      name: user.name,
      email: user.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(JWT_SECRET);
    
    // Set cookie with token
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'strict'
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { user }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log in' },
      { status: 500 }
    );
  }
}
