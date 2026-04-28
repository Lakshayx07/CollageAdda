/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external domains used in the app
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'www.svgrepo.com' },
    ],
  },
};

export default nextConfig;
