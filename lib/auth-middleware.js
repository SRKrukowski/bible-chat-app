/**
 * Authentication Middleware
 * 
 * This module provides middleware functions for protecting routes
 * and verifying user authentication.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bible-chat-app-secret-key-for-development'
);

/**
 * Middleware to protect routes that require authentication
 * @param {Request} request - The incoming request
 * @returns {Promise<Response>} The response or redirect
 */
export async function authMiddleware(request) {
  // Get the token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Add user info to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-name', payload.name);
    
    // Continue with the modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Clear the invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    
    return response;
  }
}

/**
 * Get the authenticated user from the request
 * @param {Request} request - The incoming request
 * @returns {Object|null} User object or null if not authenticated
 */
export function getAuthUser(request) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userName = request.headers.get('x-user-name');
  
  if (!userId) {
    return null;
  }
  
  return {
    id: userId,
    email: userEmail,
    name: userName
  };
}

/**
 * Check if a request is authenticated
 * @param {Request} request - The incoming request
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated(request) {
  return !!getAuthUser(request);
}
