# Bible Chat App Research

## Requirements
- Create a web app for daily Bible verse discussions
- Allow users (housemates) to log in to a chat room
- Display Catholic Daily readings
- Chat interface that resets each day with new readings
- Readings should update daily

## API Options

### 1. USCCB Website (Catholic Daily Readings)
- URL: https://bible.usccb.org/daily-bible-reading
- Structure:
  - Daily readings are organized by date
  - Each day includes multiple readings (First Reading, Responsorial Psalm, Gospel, etc.)
  - Content is structured in HTML format
- No official API found
- Would require web scraping to extract daily readings
- Pros:
  - Contains official Catholic Daily readings
  - Follows the liturgical calendar
  - Includes all readings for the day
- Cons:
  - No official API
  - Requires web scraping which may break if website structure changes
  - May have usage limitations or terms of service restrictions

### 2. API.Bible
- URL: https://scripture.api.bible/
- Features:
  - Comprehensive API with nearly 2500 Bible versions across 1600 languages
  - Unified formatting across different Bible versions
  - Search functionality
  - Authentication required (API key)
  - Free for non-commercial use with limitations (5,000 queries per day, 500 consecutive verses)
- Available endpoints:
  - Bibles: List available Bible versions
  - Books: Access books within a Bible version
  - Chapters: Access chapters within a book
  - Verses: Access individual verses
  - Passages: Retrieve specific passages
  - Search: Search for keywords or references
- Pros:
  - Well-documented API
  - Multiple Bible versions available
  - Structured data format
  - Official API with support
- Cons:
  - Does not specifically provide Catholic Daily readings
  - Does not follow the liturgical calendar
  - Would require additional logic to map to daily readings

## Recommended Approach

Based on the research, a hybrid approach is recommended:

1. **For Bible Content**: Use API.Bible to access Bible content when needed for additional context or searching.

2. **For Daily Catholic Readings**: Implement web scraping of the USCCB website to get the official Catholic Daily readings that follow the liturgical calendar.

3. **Caching Strategy**: Implement a daily caching mechanism to:
   - Reduce load on the USCCB website
   - Minimize API calls to API.Bible
   - Ensure readings are available even if external services are temporarily unavailable

4. **Fallback Mechanism**: If scraping fails, provide a fallback option using API.Bible to retrieve relevant passages based on the liturgical calendar (would require maintaining a mapping of dates to readings).

## Next Steps

1. Design the web app architecture incorporating both data sources
2. Set up the project environment using Next.js (as recommended in the knowledge module)
3. Implement the Bible verse fetching mechanism with the hybrid approach
4. Create user authentication for housemates
5. Develop the chat interface
6. Implement daily reset functionality
7. Deploy the web application
