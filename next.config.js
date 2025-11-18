/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Prisma edge runtime compatibility
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Stát se nenahraditelným v době AI',
  },

  // Optimalizace pro produkci
  swcMinify: true,
  
  // Headers pro security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
