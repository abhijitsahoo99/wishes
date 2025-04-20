/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to allow client-side rendering
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // This allows dynamic routes to be generated at runtime
  trailingSlash: true,
};

module.exports = nextConfig;
