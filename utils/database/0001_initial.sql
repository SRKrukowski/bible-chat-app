/**
 * Database Migration for Bible Chat App
 * 
 * This file contains the initial SQL schema for the Bible Chat App database.
 * It creates tables for users, readings, and messages.
 */

-- Drop tables if they exist
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create readings table
CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_messages_date ON messages(date);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_readings_date ON readings(date);
