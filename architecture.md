# Bible Chat App Architecture

## Overview

The Bible Chat App is a web application that allows users (housemates) to log in to a chat room where they can discuss Catholic Daily readings. The app fetches daily Bible verses from the USCCB website, displays them to users, and provides a chat interface that resets each day with new readings.

## Technology Stack

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API for global state

### Backend
- **Framework**: Next.js API routes
- **Database**: Cloudflare D1 (SQLite-compatible database provided by Cloudflare Workers)
- **Authentication**: NextAuth.js for user authentication

### External Services
- **USCCB Website**: Source for Catholic Daily readings (via web scraping)
- **API.Bible**: Backup source for Bible content and search functionality

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                        │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │   Auth Pages    │   │  Reading Page   │   │   Chat Page     ││
│  │  (Login/Signup) │   │ (Daily Verses)  │   │ (Discussion)    ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Backend                         │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐│
│  │   Auth API      │   │  Readings API   │   │    Chat API     ││
│  │                 │   │                 │   │                 ││
│  └─────────────────┘   └─────────────────┘   └─────────────────┘│
└───────────┬─────────────────────┬───────────────────┬───────────┘
            │                     │                   │
            ▼                     ▼                   ▼
┌───────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│  Cloudflare D1    │  │  USCCB Web Scraper  │  │    API.Bible    │
│    Database       │  │                     │  │                 │
└───────────────────┘  └─────────────────────┘  └─────────────────┘
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Readings Table
```sql
CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Component Structure

### Authentication Components
- `LoginForm`: Handles user login
- `SignupForm`: Handles new user registration
- `AuthProvider`: Provides authentication context to the application

### Reading Components
- `DailyReading`: Displays the current day's readings
- `ReadingFetcher`: Manages fetching and caching of daily readings
- `ReadingNavigation`: Allows navigation between different readings for the day

### Chat Components
- `ChatRoom`: Main chat interface
- `MessageList`: Displays messages for the current day
- `MessageInput`: Allows users to send new messages
- `UserPresence`: Shows which users are currently online

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `GET /api/auth/user`: Get current user information
- `POST /api/auth/logout`: Log out a user

### Reading Endpoints
- `GET /api/readings/today`: Get today's readings
- `GET /api/readings/date/:date`: Get readings for a specific date

### Chat Endpoints
- `GET /api/messages/today`: Get today's chat messages
- `POST /api/messages`: Create a new message
- `GET /api/messages/date/:date`: Get messages for a specific date

## Data Flow

### Daily Reading Fetching Process
1. Check if today's readings are already in the database
2. If not, scrape the USCCB website to get the current day's readings
3. Parse and store the readings in the database
4. If scraping fails, attempt to use API.Bible as a fallback
5. Return the readings to the client

### Chat Message Flow
1. User submits a new message
2. Message is sent to the server via API
3. Server validates the message and stores it in the database
4. Server broadcasts the message to all connected clients
5. Clients receive and display the new message

### Daily Reset Process
1. A scheduled job runs at midnight (server time)
2. The job fetches new readings for the day
3. The chat interface is updated to display the new day's readings
4. Previous day's messages remain accessible but are no longer displayed by default

## Caching Strategy

1. Daily readings are cached in the database after being fetched
2. API.Bible responses are cached to minimize API usage
3. Client-side caching is implemented for frequently accessed data
4. Service Worker is used to provide offline functionality

## Security Considerations

1. User passwords are hashed using bcrypt
2. Authentication is handled via secure HTTP-only cookies
3. API endpoints are protected with appropriate authentication middleware
4. Input validation is performed on all user inputs
5. CSRF protection is implemented for all state-changing operations

## Deployment Strategy

The application will be deployed using Cloudflare Pages and Workers:
1. Frontend is deployed as a static site on Cloudflare Pages
2. Backend API is deployed as Cloudflare Workers
3. Database is hosted on Cloudflare D1
4. Scheduled jobs are implemented as Cloudflare Cron Triggers

## Monitoring and Maintenance

1. Error logging is implemented to track issues
2. Usage analytics are collected to monitor performance
3. Regular backups of the database are performed
4. Automated tests ensure functionality remains intact after updates
