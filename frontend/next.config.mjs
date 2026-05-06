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
};

export default nextConfig;
