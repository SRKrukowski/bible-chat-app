/**
 * Chat Message Service
 * 
 * This module provides functionality for managing chat messages
 * including creating, retrieving, and deleting messages.
 */

const { D1 } = require('@cloudflare/workers-types');
const crypto = require('crypto');

/**
 * Chat Message Service
 */
class MessageService {
  /**
   * Initialize the message service
   * @param {D1Database} db - Cloudflare D1 database instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new message
   * @param {string} userId - ID of the user sending the message
   * @param {string} content - Message content
   * @param {string} date - Date string in YYYY-MM-DD format
   * @returns {Promise<Object>} Newly created message
   */
  async createMessage(userId, content, date) {
    // Generate a unique ID
    const messageId = crypto.randomUUID();
    
    // Create the message
    await this.db.prepare(
      `INSERT INTO messages (id, user_id, content, date) 
       VALUES (?, ?, ?, ?)`
    )
    .bind(messageId, userId, content, date)
    .run();
    
    // Get the created message with user info
    return this.getMessageById(messageId);
  }

  /**
   * Get a message by ID
   * @param {string} id - Message ID
   * @returns {Promise<Object|null>} Message object or null
   */
  async getMessageById(id) {
    const result = await this.db.prepare(
      `SELECT m.id, m.content, m.date, m.created_at, 
              u.id as user_id, u.name as user_name
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = ?`
    )
    .bind(id)
    .first();
    
    return result || null;
  }

  /**
   * Get messages for a specific date
   * @param {string} date - Date string in YYYY-MM-DD format
   * @param {number} limit - Maximum number of messages to return
   * @param {number} offset - Number of messages to skip
   * @returns {Promise<Array>} List of messages
   */
  async getMessagesByDate(date, limit = 100, offset = 0) {
    const results = await this.db.prepare(
      `SELECT m.id, m.content, m.date, m.created_at, 
              u.id as user_id, u.name as user_name
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.date = ?
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`
    )
    .bind(date, limit, offset)
    .all();
    
    return results.results;
  }

  /**
   * Get today's messages
   * @param {number} limit - Maximum number of messages to return
   * @param {number} offset - Number of messages to skip
   * @returns {Promise<Array>} List of today's messages
   */
  async getTodaysMessages(limit = 100, offset = 0) {
    const today = new Date().toISOString().split('T')[0];
    return this.getMessagesByDate(today, limit, offset);
  }

  /**
   * Delete a message
   * @param {string} id - Message ID
   * @param {string} userId - ID of the user attempting to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteMessage(id, userId) {
    // Check if the message exists and belongs to the user
    const message = await this.db.prepare(
      'SELECT user_id FROM messages WHERE id = ?'
    )
    .bind(id)
    .first();
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.user_id !== userId) {
      throw new Error('Not authorized to delete this message');
    }
    
    // Delete the message
    await this.db.prepare('DELETE FROM messages WHERE id = ?')
      .bind(id)
      .run();
    
    return true;
  }

  /**
   * Get message count for a specific date
   * @param {string} date - Date string in YYYY-MM-DD format
   * @returns {Promise<number>} Message count
   */
  async getMessageCountByDate(date) {
    const result = await this.db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE date = ?'
    )
    .bind(date)
    .first();
    
    return result ? result.count : 0;
  }
}

module.exports = MessageService;
