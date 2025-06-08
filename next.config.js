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
  },
  // Configuración mejorada para el manejo de chunks
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  webpack: (config, { isServer, dev }) => {
    // Configuración mejorada para evitar errores de chunk loading
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          three: {
            name: 'three',
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
            enforce: true,
          },
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    // Configuración adicional para mejorar la carga de archivos
    config.module.rules.push({
      test: /\.(fbx|glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/models/',
          outputPath: 'static/models/',
        },
      },
    });
    
    return config;
  },
}

module.exports = nextConfig;
