/**
 * API Routes for Bible Search
 * 
 * This file defines the API routes for searching Bible passages
 * using the readings service.
 */

import { NextResponse } from 'next/server';
const readingsService = require('@/lib/bible/readings-service');

/**
 * GET /api/readings/search
 * Searches for Bible passages matching a query
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const bibleId = searchParams.get('bibleId');
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    const results = await readingsService.searchBiblePassages(query, bibleId);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching Bible passages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search Bible passages' },
      { status: 500 }
    );
  }
}
