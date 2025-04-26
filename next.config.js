/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // Strict Mode is recommended and default in Next.js 14+
  swcMinify: true, // Use SWC for faster builds
  typescript: {
    // Warns during build if there are type errors, but allows build completion.
    // It's recommended to set this to `false` and fix type errors for production readiness.
     ignoreBuildErrors: true,
  },
  eslint: {
    // Warns during build if there are ESLint errors, but allows build completion.
    // Recommended to set this to `false` and fix lint errors.
     ignoreDuringBuilds: true,
  },
   images: {
    // Configure remote image patterns if loading images from external URLs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Example placeholder image host
        port: '',
        pathname: '/**',
      },
      // Add other necessary remote patterns here
    ],
  },
   // No specific experimental flags needed for this application structure
   // experimental: {
   // },
};

module.exports = nextConfig; // Use module.exports for .js file