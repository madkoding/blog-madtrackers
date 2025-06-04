/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@react-three/drei', 
      '@react-three/fiber',
      'three',
      'react-simple-typewriter'
    ],
    // optimizeCss: true, // Desactivado temporalmente por error con critters
  },
  webpack: (config, { isServer }) => {
    // Bundle splitting for heavy dependencies
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            enforce: true,
            priority: 20,
          },
          three: {
            name: 'three',
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          firebase: {
            name: 'firebase',
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          openai: {
            name: 'openai',
            test: /[\\/]node_modules[\\/]openai[\\/]/,
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig;
