/**
 * API Routes for User Registration
 * 
 * This file defines the API routes for user registration
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
 * POST /api/auth/register
 * Registers a new user
 */
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize auth service
    const authService = new AuthService(db);
    
    // Register the user
    const user = await authService.registerUser(name, email, password);
    
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
    console.error('Error registering user:', error);
    
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
