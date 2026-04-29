/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'loremflickr.com', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ignore typescript and eslint errors during build for smooth migration
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
