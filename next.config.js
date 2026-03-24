/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/chat/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/chat/:path*` },
      { source: '/api/chatauth/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/chatauth/:path*` },
    ];
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
