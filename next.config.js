/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest:            'public',           // sw.js + workbox files go here
  cacheOnFrontEndNav: true,            // cache navigations on client
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development', // no SW in dev
  workboxOptions: {
    disableDevLogs: true,
    // Cache-first for static assets; network-first for API/pages
    runtimeCaching: [
      {
        // Case list page — stale-while-revalidate
        urlPattern: /^https?:\/\/.*\/cases($|\?)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'cases-page-cache',
          expiration: { maxEntries: 5, maxAgeSeconds: 3600 },
        },
      },
      {
        // Supabase REST API — network-first, fall back to cache
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-cache',
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
      {
        // Google Fonts — cache-first (very stable)
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        // All other pages — network-first
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'others-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 32, maxAgeSeconds: 3600 },
        },
      },
    ],
  },
});

const nextConfig = {
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

module.exports = withPWA(nextConfig);
