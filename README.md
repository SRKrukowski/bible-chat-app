# README.md - Bible Chat App

## Overview
Bible Chat App is a web application that allows users to join a chat room where they can discuss daily Bible verses from the Catholic Daily readings. The app fetches new readings each day and provides a clean chat interface that resets daily for fresh discussions.

## Features
- **Daily Bible Readings**: Automatically fetches Catholic Daily readings from USCCB
- **User Authentication**: Secure login system for invited housemates
- **Real-time Chat**: Discuss daily readings with other users
- **Mobile Responsive**: Works seamlessly on all devices
- **Daily Reset**: Chat resets each day with new readings while maintaining message archives

## Technology Stack
- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT-based authentication
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Wrangler CLI (for Cloudflare Workers)

### Local Development
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   wrangler d1 execute DB --local --file=migrations/0001_initial.sql
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment
1. Configure your Cloudflare account in wrangler.toml
2. Deploy the application:
   ```
   npm run deploy
   ```

## Usage
1. Register an account or log in
2. View the daily Bible readings in the "Today's Readings" tab
3. Switch to the "Discussion" tab to chat with other users
4. Messages will update in real-time and reset each day

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- USCCB for providing the daily Bible readings
- API.Bible for additional Bible content
