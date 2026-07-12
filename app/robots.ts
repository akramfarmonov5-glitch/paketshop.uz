import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/uz/admin',
        '/ru/admin',
        '/uz/checkout',
        '/ru/checkout',
        '/uz/profile',
        '/ru/profile',
        '/uz/tracking',
        '/ru/tracking',
        '/uz/wishlist',
        '/ru/wishlist',
      ],
    },
    sitemap: 'https://paketshop.uz/sitemap.xml',
    host: 'https://paketshop.uz',
  };
}
