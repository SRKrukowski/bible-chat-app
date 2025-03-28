/**
 * Next.js Configuration
 * 
 * This file configures Next.js for the application.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure Cloudflare Pages integration
  experimental: {
    // Enable Cloudflare Pages integration
    cloudflarePages: true,
  },
  
  // Configure image domains for external images
  images: {
    domains: ['bible.usccb.org'],
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
