/**
 * Bible Readings Service
 * 
 * This module combines the USCCB scraper and API.Bible integration
 * to provide a unified interface for fetching Bible readings.
 * It prioritizes USCCB for Catholic Daily readings and uses API.Bible
 * for enhancements and as a fallback.
 */

const usccbScraper = require('../scraper/usccb-scraper');
const apiBible = require('./api-bible');
const NodeCache = require('node-cache');

// Initialize cache with standard TTL of 24 hours (in seconds)
const cache = new NodeCache({ stdTTL: 86400 });

// Default Bible version ID for API.Bible (New American Bible Revised Edition)
// This is the Catholic translation used by USCCB
const DEFAULT_BIBLE_ID = '9879dbb7cfe39e4d-01'; // NABRE

/**
 * Gets today's readings from USCCB with API.Bible enhancements
 * @returns {Promise<Object>} Enhanced daily readings
 */
const getTodaysReadings = async () => {
  const today = usccbScraper.getTodayFormatted();
  const cacheKey = `enhanced_readings_${today}`;
  
  // Check if enhanced readings are in cache
  const cachedReadings = cache.get(cacheKey);
  if (cachedReadings) {
    console.log(`Using cached enhanced readings for ${today}`);
    return cachedReadings;
  }
  
  try {
    // First, get readings from USCCB
    const usccbReadings = await usccbScraper.fetchDailyReadings();
    
    // Then enhance with API.Bible content
    const enhancedReadings = await enhanceReadingsWithApiBible(usccbReadings);
    
    // Store in cache
    cache.set(cacheKey, enhancedReadings);
    
    return enhancedReadings;
  } catch (error) {
    console.error('Error getting today\'s readings:', error);
    
    // If USCCB fails, try to get something from API.Bible as fallback
    return getFallbackReadings(today);
  }
};

/**
 * Gets readings for a specific date from USCCB with API.Bible enhancements
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Enhanced daily readings
 */
const getReadingsForDate = async (dateStr) => {
  const cacheKey = `enhanced_readings_${dateStr}`;
  
  // Check if enhanced readings are in cache
  const cachedReadings = cache.get(cacheKey);
  if (cachedReadings) {
    console.log(`Using cached enhanced readings for ${dateStr}`);
    return cachedReadings;
  }
  
  try {
    // First, get readings from USCCB
    const usccbReadings = await usccbScraper.fetchDailyReadings(dateStr);
    
    // Then enhance with API.Bible content
    const enhancedReadings = await enhanceReadingsWithApiBible(usccbReadings);
    
    // Store in cache
    cache.set(cacheKey, enhancedReadings);
    
    return enhancedReadings;
  } catch (error) {
    console.error(`Error getting readings for ${dateStr}:`, error);
    
    // If USCCB fails, try to get something from API.Bible as fallback
    return getFallbackReadings(dateStr);
  }
};

/**
 * Enhances USCCB readings with additional content from API.Bible
 * @param {Object} usccbReadings - Readings from USCCB
 * @returns {Promise<Object>} Enhanced readings
 */
const enhanceReadingsWithApiBible = async (usccbReadings) => {
  // Create a deep copy of the USCCB readings
  const enhancedReadings = JSON.parse(JSON.stringify(usccbReadings));
  
  // Add API.Bible enhancements to each reading
  for (const reading of enhancedReadings.readings) {
    try {
      // Extract the Bible reference from the reading
      const reference = reading.reference;
      
      // Skip if no reference is available
      if (!reference) continue;
      
      // Convert the reference to a format API.Bible can understand
      const passageId = convertReferenceToPassageId(reference);
      
      // Skip if conversion failed
      if (!passageId) continue;
      
      // Get the passage from API.Bible
      const passage = await apiBible.getPassage(DEFAULT_BIBLE_ID, passageId);
      
      // Add additional information to the reading
      reading.alternativeTranslations = [
        {
          source: 'API.Bible',
          bibleId: DEFAULT_BIBLE_ID,
          content: passage.content,
          copyright: passage.copyright
        }
      ];
      
      // Add cross-references if available
      if (passage.crossReferences) {
        reading.crossReferences = passage.crossReferences;
      }
    } catch (error) {
      console.warn(`Could not enhance reading ${reading.reference}:`, error);
      // Continue with other readings even if one fails
    }
  }
  
  return enhancedReadings;
};

/**
 * Converts a human-readable Bible reference to an API.Bible passage ID
 * @param {string} reference - Human-readable reference (e.g., "John 3:16")
 * @returns {string|null} API.Bible passage ID or null if conversion failed
 */
const convertReferenceToPassageId = (reference) => {
  // This is a simplified conversion that would need to be expanded
  // for a production application with a more comprehensive mapping
  
  // Example mapping for common books
  const bookMap = {
    'Genesis': 'GEN',
    'Exodus': 'EXO',
    'Leviticus': 'LEV',
    'Numbers': 'NUM',
    'Deuteronomy': 'DEU',
    'Joshua': 'JOS',
    'Judges': 'JDG',
    'Ruth': 'RUT',
    '1 Samuel': '1SA',
    '2 Samuel': '2SA',
    '1 Kings': '1KI',
    '2 Kings': '2KI',
    '1 Chronicles': '1CH',
    '2 Chronicles': '2CH',
    'Ezra': 'EZR',
    'Nehemiah': 'NEH',
    'Esther': 'EST',
    'Job': 'JOB',
    'Psalms': 'PSA',
    'Psalm': 'PSA',
    'Proverbs': 'PRO',
    'Ecclesiastes': 'ECC',
    'Song of Solomon': 'SNG',
    'Isaiah': 'ISA',
    'Jeremiah': 'JER',
    'Lamentations': 'LAM',
    'Ezekiel': 'EZK',
    'Daniel': 'DAN',
    'Hosea': 'HOS',
    'Joel': 'JOL',
    'Amos': 'AMO',
    'Obadiah': 'OBA',
    'Jonah': 'JON',
    'Micah': 'MIC',
    'Nahum': 'NAM',
    'Habakkuk': 'HAB',
    'Zephaniah': 'ZEP',
    'Haggai': 'HAG',
    'Zechariah': 'ZEC',
    'Malachi': 'MAL',
    'Matthew': 'MAT',
    'Mark': 'MRK',
    'Luke': 'LUK',
    'John': 'JHN',
    'Acts': 'ACT',
    'Romans': 'ROM',
    '1 Corinthians': '1CO',
    '2 Corinthians': '2CO',
    'Galatians': 'GAL',
    'Ephesians': 'EPH',
    'Philippians': 'PHP',
    'Colossians': 'COL',
    '1 Thessalonians': '1TH',
    '2 Thessalonians': '2TH',
    '1 Timothy': '1TI',
    '2 Timothy': '2TI',
    'Titus': 'TIT',
    'Philemon': 'PHM',
    'Hebrews': 'HEB',
    'James': 'JAS',
    '1 Peter': '1PE',
    '2 Peter': '2PE',
    '1 John': '1JN',
    '2 John': '2JN',
    '3 John': '3JN',
    'Jude': 'JUD',
    'Revelation': 'REV'
  };
  
  try {
    // Extract book name and chapter/verse reference
    const match = reference.match(/^([\w\s]+)\s+(\d+(?::\d+(?:-\d+(?::\d+)?)?)?)/);
    if (!match) return null;
    
    const [, bookName, verseRef] = match;
    
    // Look up the book code
    const bookCode = bookMap[bookName.trim()];
    if (!bookCode) return null;
    
    // Parse chapter and verse
    const parts = verseRef.split(':');
    const chapter = parts[0];
    
    // If only chapter is specified, return the whole chapter
    if (parts.length === 1) {
      return `${bookCode}.${chapter}`;
    }
    
    // If verse range is specified
    const verses = parts[1];
    return `${bookCode}.${chapter}.${verses}`;
  } catch (error) {
    console.warn(`Failed to convert reference "${reference}":`, error);
    return null;
  }
};

/**
 * Gets fallback readings from API.Bible when USCCB scraping fails
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Fallback readings
 */
const getFallbackReadings = async (dateStr) => {
  console.log(`Using fallback readings for ${dateStr}`);
  
  try {
    // This would need to be expanded with a proper liturgical calendar
    // mapping for a production application
    
    // For now, we'll just provide a generic reading
    const passage = await apiBible.getPassage(DEFAULT_BIBLE_ID, 'JHN.3.16');
    
    return {
      date: dateStr,
      liturgicalDay: 'Fallback Reading',
      readings: [
        {
          title: 'Gospel',
          reference: 'John 3:16',
          content: passage.content,
          source: 'API.Bible (Fallback)'
        }
      ],
      fallback: true
    };
  } catch (error) {
    console.error('Fallback readings also failed:', error);
    
    // Return a minimal object if everything fails
    return {
      date: dateStr,
      liturgicalDay: 'Readings Unavailable',
      readings: [],
      error: 'Could not retrieve readings from any source'
    };
  }
};

/**
 * Searches for Bible passages matching a query
 * @param {string} query - Search query
 * @param {string} bibleId - Optional Bible version ID
 * @returns {Promise<Object>} Search results
 */
const searchBiblePassages = async (query, bibleId = DEFAULT_BIBLE_ID) => {
  try {
    return await apiBible.searchBible(bibleId, query);
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    throw new Error(`Failed to search Bible: ${error.message}`);
  }
};

/**
 * Gets available Bible versions
 * @returns {Promise<Array>} List of Bible versions
 */
const getBibleVersions = async () => {
  try {
    return await apiBible.getBibleVersions();
  } catch (error) {
    console.error('Error getting Bible versions:', error);
    throw new Error(`Failed to get Bible versions: ${error.message}`);
  }
};

/**
 * Clears the cache for a specific date or all dates
 * @param {string} dateStr - Optional date string in YYYY-MM-DD format
 * @returns {boolean} True if cache was cleared
 */
const clearCache = (dateStr = null) => {
  if (dateStr) {
    const cacheKey = `enhanced_readings_${dateStr}`;
    return cache.del(cacheKey);
  }
  
  // Clear all cache
  cache.flushAll();
  usccbScraper.clearCache();
  apiBible.clearCache();
  return true;
};

module.exports = {
  getTodaysReadings,
  getReadingsForDate,
  searchBiblePassages,
  getBibleVersions,
  clearCache
};
