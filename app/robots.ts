import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
