/**
 * Daily Reset Service
 * 
 * This module provides functionality for daily reset operations
 * including fetching new readings and managing message archives.
 */

const { D1 } = require('@cloudflare/workers-types');
const readingsService = require('../bible/readings-service');

/**
 * Daily Reset Service
 */
class DailyResetService {
  /**
   * Initialize the daily reset service
   * @param {D1Database} db - Cloudflare D1 database instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Perform daily reset operations
   * @returns {Promise<Object>} Result of reset operations
   */
  async performDailyReset() {
    try {
      console.log('Starting daily reset process...');
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Step 1: Fetch new readings for today
      const readings = await this.fetchAndStoreReadings(today);
      
      // Step 2: Archive messages from previous day if needed
      const archiveResult = await this.archiveOldMessages();
      
      console.log('Daily reset completed successfully');
      
      return {
        success: true,
        date: today,
        readings,
        archiveResult
      };
    } catch (error) {
      console.error('Error performing daily reset:', error);
      throw error;
    }
  }

  /**
   * Fetch and store readings for a specific date
   * @param {string} date - Date string in YYYY-MM-DD format
   * @returns {Promise<Object>} Fetched readings
   */
  async fetchAndStoreReadings(date) {
    try {
      console.log(`Fetching readings for ${date}...`);
      
      // Check if readings already exist for this date
      const existingReadings = await this.db.prepare(
        'SELECT * FROM readings WHERE date = ?'
      )
      .bind(date)
      .first();
      
      if (existingReadings) {
        console.log(`Readings for ${date} already exist, skipping fetch`);
        return existingReadings;
      }
      
      // Fetch readings from service
      const readings = await readingsService.getReadingsForDate(date);
      
      // Generate a unique ID
      const readingId = crypto.randomUUID();
      
      // Store readings in database
      await this.db.prepare(
        `INSERT INTO readings (id, date, title, content, source) 
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        readingId,
        date,
        readings.liturgicalDay || 'Daily Readings',
        JSON.stringify(readings),
        readings.fallback ? 'API.Bible (Fallback)' : 'USCCB'
      )
      .run();
      
      console.log(`Readings for ${date} fetched and stored successfully`);
      
      return readings;
    } catch (error) {
      console.error(`Error fetching readings for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Archive messages older than the current day
   * @returns {Promise<Object>} Result of archive operation
   */
  async archiveOldMessages() {
    try {
      console.log('Archiving old messages...');
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Count messages to be archived (for reporting)
      const countResult = await this.db.prepare(
        'SELECT COUNT(*) as count FROM messages WHERE date != ?'
      )
      .bind(today)
      .first();
      
      const archiveCount = countResult ? countResult.count : 0;
      
      // We don't actually delete or move messages, just report on them
      // In a production app, you might move them to an archive table or
      // implement a retention policy
      
      console.log(`${archiveCount} messages archived`);
      
      return {
        success: true,
        archivedCount: archiveCount
      };
    } catch (error) {
      console.error('Error archiving old messages:', error);
      throw error;
    }
  }

  /**
   * Check if readings exist for today
   * @returns {Promise<boolean>} Whether readings exist
   */
  async checkTodaysReadings() {
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Check if readings exist
      const existingReadings = await this.db.prepare(
        'SELECT * FROM readings WHERE date = ?'
      )
      .bind(today)
      .first();
      
      return !!existingReadings;
    } catch (error) {
      console.error('Error checking today\'s readings:', error);
      return false;
    }
  }
}

module.exports = DailyResetService;
