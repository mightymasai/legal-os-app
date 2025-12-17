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
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react'],
  },
};

export default nextConfig;

