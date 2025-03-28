/**
 * Authentication Service
 * 
 * This module provides authentication functionality for the Bible Chat App,
 * including user registration, login, and session management.
 */

const { D1 } = require('@cloudflare/workers-types');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * User Authentication Service
 */
class AuthService {
  /**
   * Initialize the authentication service
   * @param {D1Database} db - Cloudflare D1 database instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Register a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Newly created user (without password)
   */
  async registerUser(name, email, password) {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique ID
    const userId = crypto.randomUUID();

    // Create the user
    await this.db.prepare(
      `INSERT INTO users (id, name, email, password_hash) 
       VALUES (?, ?, ?, ?)`
    )
    .bind(userId, name, email, hashedPassword)
    .run();

    // Return the user without password
    return {
      id: userId,
      name,
      email
    };
  }

  /**
   * Authenticate a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object|null>} Authenticated user or null
   */
  async loginUser(email, password) {
    // Get the user
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return null;
    }

    // Return user without password
    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  /**
   * Get a user by email
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByEmail(email) {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
    .bind(email)
    .first();

    return result || null;
  }

  /**
   * Get a user by ID
   * @param {string} id - User's ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(id) {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    )
    .bind(id)
    .first();

    if (!result) {
      return null;
    }

    // Return user without password
    return {
      id: result.id,
      name: result.name,
      email: result.email
    };
  }

  /**
   * Get all users (for admin purposes)
   * @returns {Promise<Array>} List of all users (without passwords)
   */
  async getAllUsers() {
    const results = await this.db.prepare(
      'SELECT id, name, email, created_at FROM users'
    )
    .all();

    return results.results;
  }

  /**
   * Update a user's information
   * @param {string} id - User's ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updates) {
    const { name, email } = updates;
    
    // Check if user exists
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update the user
    await this.db.prepare(
      `UPDATE users 
       SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    )
    .bind(name || user.name, email || user.email, id)
    .run();

    // Return updated user
    return {
      id,
      name: name || user.name,
      email: email || user.email
    };
  }

  /**
   * Change a user's password
   * @param {string} id - User's ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  async changePassword(id, currentPassword, newPassword) {
    // Get the user with password hash
    const user = await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    )
    .bind(id)
    .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    await this.db.prepare(
      `UPDATE users 
       SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`
    )
    .bind(hashedPassword, id)
    .run();

    return true;
  }
}

module.exports = AuthService;
