/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force clean builds - no caching of API routes
  experimental: {
    // This ensures API routes are rebuilt on each deployment
  },
}

module.exports = nextConfig



