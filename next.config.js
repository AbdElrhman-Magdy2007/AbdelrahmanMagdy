/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features for advanced functionality
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Support large payloads (e.g., image uploads)
    },
    optimizePackageImports: ['@tsparticles/react', '@tsparticles/engine'], // Optimize imports for tsparticles
  },

  // Image optimization configuration
  images: {
    deviceSizes: [640, 768, 1024, 1280, 1600], // Optimize for common device widths
    imageSizes: [16, 32, 48, 64, 96], // Optimize for thumbnail sizes
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Restrict to Supabase storage for security
        pathname: '/storage/v1/object/public/**', // Allow public storage objects
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // Support Cloudinary for media hosting
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**', // Local development uploads
      },
    ],
  },

  // Webpack configuration for custom asset handling
  webpack: (config, { isServer }) => {
    // Handle media files (images, videos)
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|jpeg|jpg|png|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]', // Consistent output path
      },
      parser: {
        dataUrlCondition: {
          maxSize: 10 * 1024, // Inline files smaller than 10KB
        },
      },
    });

    // Optimize SVG handling for React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'], // Allow SVGs as React components
    });

    // Improve performance for server-side builds
    if (isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = config.optimization.splitChunks || {};
      config.optimization.splitChunks.cacheGroups = {
        ...(config.optimization.splitChunks.cacheGroups || {}),
        prisma: {
          test: /[\\/]node_modules[\\/]@prisma[\\/]/,
          name: 'prisma',
          chunks: 'all',
          priority: 10,
        },
      };
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME-type sniffing
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for legacy or external routes
  async redirects() {
    return [
      {
        source: '/old-admin',
        destination: '/admin',
        permanent: true,
      },
    ];
  },

  // Environment-specific configurations
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // TypeScript and ESLint configurations
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking during build
  },
  eslint: {
    ignoreDuringBuilds: false, // Enforce linting during build
  },

  // Output configuration for deployment
  output: 'standalone', // Optimize for serverless environments like Vercel
};

module.exports = nextConfig;
/////////////////////////////////