/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.BACKEND_URL) {
      return [
        {
          source: '/api/backend/:path*',
          destination: `${process.env.BACKEND_URL}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
