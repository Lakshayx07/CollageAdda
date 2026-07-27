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
  // Required for Google OAuth popup — without this the popup sticks on about:blank
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return [
      {
        source: '/api/users/:id/avatar',
        destination: `${apiBase}/api/users/:id/avatar`,
      },
      {
        source: '/api/posts/:id/media',
        destination: `${apiBase}/api/posts/:id/media`,
      },
    ];
  },
};

export default nextConfig;
