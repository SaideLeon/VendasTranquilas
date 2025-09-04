import type {NextConfig} from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Enable React strict mode for highlighting potential problems
  swcMinify: true, // Enable SWC minification for faster builds
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
     ignoreBuildErrors: true, // Keep this if needed, but try to fix type errors
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
     ignoreDuringBuilds: true, // Keep this if needed, but address lint issues
  },
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add other remote patterns if needed
    ],
  },
  // You can add other configurations here, like experimental features
   experimental: {
     appDir: true, // Ensure App Router is enabled (default in newer Next.js versions)
   },
};

export default nextConfig;

        