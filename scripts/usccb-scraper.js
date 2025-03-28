/**
 * USCCB Scraper for Catholic Daily Readings
 * 
 * This module scrapes the USCCB website to fetch the daily readings
 * following the Catholic liturgical calendar.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

// Initialize cache with standard TTL of 24 hours (in seconds)
const cache = new NodeCache({ stdTTL: 86400 });

// Base URL for USCCB daily readings
const USCCB_BASE_URL = 'https://bible.usccb.org';
const DAILY_READINGS_URL = `${USCCB_BASE_URL}/daily-bible-reading`;

/**
 * Formats a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets today's date formatted as YYYY-MM-DD
 * @returns {string} Today's date as YYYY-MM-DD
 */
const getTodayFormatted = () => {
  return formatDate(new Date());
};

/**
 * Fetches the HTML content from the USCCB daily readings page
 * @param {string} dateStr - Optional date string in YYYY-MM-DD format
 * @returns {Promise<string>} HTML content of the page
 */
const fetchUSCCBPage = async (dateStr = null) => {
  try {
    let url = DAILY_READINGS_URL;
    if (dateStr) {
      // Convert YYYY-MM-DD to the format used by USCCB (YYYY-MM-DD)
      const [year, month, day] = dateStr.split('-');
      url = `${USCCB_BASE_URL}/bible/readings/${year}${month}${day}.cfm`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching USCCB page:', error);
    throw new Error(`Failed to fetch USCCB readings: ${error.message}`);
  }
};

/**
 * Parses the HTML content to extract readings
 * @param {string} html - HTML content from USCCB page
 * @returns {Object} Structured readings data
 */
const parseReadings = (html) => {
  const $ = cheerio.load(html);
  const readings = [];
  
  // Extract the date and liturgical day
  const dateText = $('h1').text().trim();
  const liturgicalDay = $('h2').first().text().trim();
  
  // Extract each reading section
  $('h3').each((i, element) => {
    const title = $(element).text().trim();
    const reference = $(element).next('h4').text().trim();
    
    // Get the content of the reading
    let content = '';
    let currentElement = $(element).next();
    
    // Continue until we hit the next heading or end of content
    while (
      currentElement.length && 
      !currentElement.is('h3') && 
      !currentElement.is('h2')
    ) {
      if (currentElement.is('p')) {
        content += currentElement.text().trim() + '\n\n';
      }
      currentElement = currentElement.next();
    }
    
    readings.push({
      title,
      reference,
      content: content.trim()
    });
  });
  
  return {
    date: dateText,
    liturgicalDay,
    readings
  };
};

/**
 * Fetches daily readings from USCCB website
 * @param {string} dateStr - Optional date string in YYYY-MM-DD format
 * @returns {Promise<Object>} Structured readings data
 */
const fetchDailyReadings = async (dateStr = null) => {
  const date = dateStr || getTodayFormatted();
  const cacheKey = `readings_${date}`;
  
  // Check if readings are in cache
  const cachedReadings = cache.get(cacheKey);
  if (cachedReadings) {
    console.log(`Using cached readings for ${date}`);
    return cachedReadings;
  }
  
  try {
    console.log(`Fetching readings for ${date} from USCCB`);
    const html = await fetchUSCCBPage(date);
    const readings = parseReadings(html);
    
    // Store in cache
    cache.set(cacheKey, readings);
    
    return readings;
  } catch (error) {
    console.error(`Error fetching readings for ${date}:`, error);
    throw error;
  }
};

/**
 * Clears the cache for a specific date or all dates
 * @param {string} dateStr - Optional date string in YYYY-MM-DD format
 * @returns {boolean} True if cache was cleared
 */
const clearCache = (dateStr = null) => {
  if (dateStr) {
    const cacheKey = `readings_${dateStr}`;
    return cache.del(cacheKey);
  }
  
  // Clear all cache
  cache.flushAll();
  return true;
};

module.exports = {
  fetchDailyReadings,
  clearCache,
  formatDate,
  getTodayFormatted
};
