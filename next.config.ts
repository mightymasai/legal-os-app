import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react'],
  },
};

export default nextConfig;

