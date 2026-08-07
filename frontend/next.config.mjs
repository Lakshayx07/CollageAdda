/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains used in the app
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  // Required for Google OAuth popup — without this the popup sticks on about:blank
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.png',
      },
      {
        source: '/google4736c4d1c2c1ea28.html',
        destination: '/google-verify',
      },
      {
        source: '/googleA4XYapdxAtUPtUxCDxxMKNmj5vB9j2lSOoXKJGdR9yU.html',
        destination: '/google-verify',
      },
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
