import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle optimization settings
  experimental: {
    // Enable optimized package imports for lucide-react
    optimizePackageImports: ['lucide-react'],
    
    // Enable turbopack for faster builds (already used in package.json)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Tree shaking optimization for lucide-react
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Ensure proper tree shaking for icon libraries
        'lucide-react': 'lucide-react/dist/esm/icons',
      };
    }
    
    // Bundle analyzer (enable in development for analysis)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer
            ? '../analyze/server.html'
            : '../analyze/client.html',
        })
      );
    }
    
    return config;
  },
  
  // Compression
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
};

export default nextConfig;
