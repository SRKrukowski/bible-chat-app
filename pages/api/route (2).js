/**
 * Scheduled Cron Trigger for Daily Reset
 * 
 * This file defines a scheduled job that runs daily to fetch new readings
 * and reset the chat interface for the new day's discussion.
 */

import { env } from 'process';

// Import the daily reset service
const DailyResetService = require('@/lib/reset/daily-reset-service');

/**
 * Scheduled function that runs daily at midnight
 * @param {ScheduledEvent} event - The scheduled event
 * @param {ExecutionContext} context - The execution context
 */
export async function scheduled(event, context) {
  console.log('Daily reset cron job triggered at:', new Date().toISOString());
  
  try {
    // Get D1 database from environment
    const db = env.DB;
    
    // Initialize daily reset service
    const resetService = new DailyResetService(db);
    
    // Perform daily reset
    const result = await resetService.performDailyReset();
    
    console.log('Daily reset completed successfully:', result);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Daily reset completed successfully',
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in daily reset cron job:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to perform daily reset',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
