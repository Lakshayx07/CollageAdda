/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains used in the app
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'www.svgrepo.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.collegedekho.com' },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return [
      {
        source: '/api/users/:id/avatar',
        destination: `${apiBase}/api/users/:id/avatar`,
      },
    ];
  },
};

export default nextConfig;
