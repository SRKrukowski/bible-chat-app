/**
 * API.Bible Integration
 * 
 * This module provides integration with the API.Bible service
 * to enhance the Bible reading experience with additional translations,
 * search functionality, and as a fallback for USCCB readings.
 */

const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache with standard TTL of 7 days (in seconds) for Bible content
// which doesn't change frequently
const cache = new NodeCache({ stdTTL: 604800 });

// API.Bible base URL and endpoints
const API_BIBLE_BASE_URL = 'https://api.scripture.api.bible/v1';

// This would be replaced with an actual API key in production
// For development, we'll use a placeholder
const API_KEY = process.env.API_BIBLE_KEY || 'your-api-key-here';

// Default headers for API requests
const headers = {
  'api-key': API_KEY,
  'Content-Type': 'application/json'
};

/**
 * Fetches available Bible versions from API.Bible
 * @returns {Promise<Array>} List of available Bible versions
 */
const getBibleVersions = async () => {
  const cacheKey = 'bible_versions';
  
  // Check if versions are in cache
  const cachedVersions = cache.get(cacheKey);
  if (cachedVersions) {
    console.log('Using cached Bible versions');
    return cachedVersions;
  }
  
  try {
    console.log('Fetching Bible versions from API.Bible');
    const response = await axios.get(`${API_BIBLE_BASE_URL}/bibles`, { headers });
    const versions = response.data.data;
    
    // Store in cache
    cache.set(cacheKey, versions);
    
    return versions;
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    throw new Error(`Failed to fetch Bible versions: ${error.message}`);
  }
};

/**
 * Fetches a specific passage from a Bible version
 * @param {string} bibleId - The ID of the Bible version
 * @param {string} passageId - The passage reference (e.g., 'JHN.3.16')
 * @returns {Promise<Object>} Passage data
 */
const getPassage = async (bibleId, passageId) => {
  const cacheKey = `passage_${bibleId}_${passageId}`;
  
  // Check if passage is in cache
  const cachedPassage = cache.get(cacheKey);
  if (cachedPassage) {
    console.log(`Using cached passage ${passageId} from Bible ${bibleId}`);
    return cachedPassage;
  }
  
  try {
    console.log(`Fetching passage ${passageId} from Bible ${bibleId}`);
    const response = await axios.get(
      `${API_BIBLE_BASE_URL}/bibles/${bibleId}/passages/${passageId}`,
      { 
        headers,
        params: {
          'content-type': 'text',
          'include-notes': false,
          'include-titles': true,
          'include-chapter-numbers': true,
          'include-verse-numbers': true
        }
      }
    );
    
    const passage = response.data.data;
    
    // Store in cache
    cache.set(cacheKey, passage);
    
    return passage;
  } catch (error) {
    console.error(`Error fetching passage ${passageId}:`, error);
    throw new Error(`Failed to fetch passage: ${error.message}`);
  }
};

/**
 * Searches for a term in a specific Bible version
 * @param {string} bibleId - The ID of the Bible version
 * @param {string} query - The search term
 * @returns {Promise<Object>} Search results
 */
const searchBible = async (bibleId, query) => {
  const cacheKey = `search_${bibleId}_${query}`;
  
  // Check if search results are in cache
  const cachedResults = cache.get(cacheKey);
  if (cachedResults) {
    console.log(`Using cached search results for "${query}" in Bible ${bibleId}`);
    return cachedResults;
  }
  
  try {
    console.log(`Searching for "${query}" in Bible ${bibleId}`);
    const response = await axios.get(
      `${API_BIBLE_BASE_URL}/bibles/${bibleId}/search`,
      {
        headers,
        params: {
          query,
          limit: 20,
          sort: 'relevance'
        }
      }
    );
    
    const results = response.data.data;
    
    // Store in cache
    cache.set(cacheKey, results);
    
    return results;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    throw new Error(`Failed to search Bible: ${error.message}`);
  }
};

/**
 * Gets a list of books for a specific Bible version
 * @param {string} bibleId - The ID of the Bible version
 * @returns {Promise<Array>} List of books
 */
const getBooks = async (bibleId) => {
  const cacheKey = `books_${bibleId}`;
  
  // Check if books are in cache
  const cachedBooks = cache.get(cacheKey);
  if (cachedBooks) {
    console.log(`Using cached books for Bible ${bibleId}`);
    return cachedBooks;
  }
  
  try {
    console.log(`Fetching books for Bible ${bibleId}`);
    const response = await axios.get(
      `${API_BIBLE_BASE_URL}/bibles/${bibleId}/books`,
      { headers }
    );
    
    const books = response.data.data;
    
    // Store in cache
    cache.set(cacheKey, books);
    
    return books;
  } catch (error) {
    console.error(`Error fetching books for Bible ${bibleId}:`, error);
    throw new Error(`Failed to fetch books: ${error.message}`);
  }
};

/**
 * Gets a specific chapter from a Bible version
 * @param {string} bibleId - The ID of the Bible version
 * @param {string} chapterId - The chapter ID (e.g., 'JHN.3')
 * @returns {Promise<Object>} Chapter data
 */
const getChapter = async (bibleId, chapterId) => {
  const cacheKey = `chapter_${bibleId}_${chapterId}`;
  
  // Check if chapter is in cache
  const cachedChapter = cache.get(cacheKey);
  if (cachedChapter) {
    console.log(`Using cached chapter ${chapterId} from Bible ${bibleId}`);
    return cachedChapter;
  }
  
  try {
    console.log(`Fetching chapter ${chapterId} from Bible ${bibleId}`);
    const response = await axios.get(
      `${API_BIBLE_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`,
      {
        headers,
        params: {
          'content-type': 'text',
          'include-notes': false,
          'include-titles': true,
          'include-chapter-numbers': true,
          'include-verse-numbers': true
        }
      }
    );
    
    const chapter = response.data.data;
    
    // Store in cache
    cache.set(cacheKey, chapter);
    
    return chapter;
  } catch (error) {
    console.error(`Error fetching chapter ${chapterId}:`, error);
    throw new Error(`Failed to fetch chapter: ${error.message}`);
  }
};

/**
 * Clears the cache for a specific key or all keys
 * @param {string} key - Optional specific cache key to clear
 * @returns {boolean} True if cache was cleared
 */
const clearCache = (key = null) => {
  if (key) {
    return cache.del(key);
  }
  
  // Clear all cache
  cache.flushAll();
  return true;
};

module.exports = {
  getBibleVersions,
  getPassage,
  searchBible,
  getBooks,
  getChapter,
  clearCache
};
