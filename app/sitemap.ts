import type { MetadataRoute } from 'next';
import { legacyIdFromSku } from '@/lib/domain/catalogMapping';
import { blogSlug } from '@/lib/slugify';
import { SITE_URL } from '@/lib/site';

const LANGS = ['uz', 'ru'] as const;
type Lang = (typeof LANGS)[number];

interface SitemapProduct {
  slugUz: string;
  slugRu: string;
  legacySku: string | null;
  updatedAt: Date;
}

interface SitemapCategory {
  slugUz: string;
  slugRu: string;
  updatedAt: Date;
}

function buildAlternates(pathBuilder: (lang: Lang) => string) {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    languages[lang] = `${SITE_URL}${pathBuilder(lang)}`;
  }
  languages['x-default'] = `${SITE_URL}${pathBuilder('uz')}`;
  return languages;
}

function productPathSlug(product: SitemapProduct, lang: Lang): string {
  const slug = lang === 'ru' ? product.slugRu || product.slugUz : product.slugUz;
  const legacyId = legacyIdFromSku(product.legacySku);
  return legacyId ? `${slug}-${legacyId}` : slug;
}

function categoryPathSlug(category: SitemapCategory, lang: Lang): string {
  return lang === 'ru' ? category.slugRu || category.slugUz : category.slugUz;
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGS) {
    entries.push({
      url: `${SITE_URL}/${lang}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
      alternates: { languages: buildAlternates((locale) => `/${locale}`) },
    });
    entries.push({
      url: `${SITE_URL}/${lang}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: { languages: buildAlternates((locale) => `/${locale}/blog`) },
    });
  }

  const publicPages = [
    'catalog',
    'wholesale',
    'organizations',
    'starter-kits',
    'delivery',
    'payment',
    'about',
    'contact',
    'faq',
    'privacy',
    'terms',
  ];

  for (const lang of LANGS) {
    for (const page of publicPages) {
      entries.push({
        url: `${SITE_URL}/${lang}/${page}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: page === 'catalog' ? 0.9 : 0.7,
        alternates: {
          languages: buildAlternates((locale) => `/${locale}/${page}`),
        },
      });
    }
  }

  try {
    const [{ db }, { getSeoBlogPosts }] = await Promise.all([
      import('@/lib/server/db'),
      import('@/lib/server/blogRepository'),
    ]);
    const [products, categories, blogPosts] = await Promise.all([
      db.product.findMany({
        where: { status: 'ACTIVE' },
        select: { slugUz: true, slugRu: true, legacySku: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5000,
      }),
      db.category.findMany({
        where: { active: true, products: { some: { status: 'ACTIVE' } } },
        select: { slugUz: true, slugRu: true, updatedAt: true },
        orderBy: { sortOrder: 'asc' },
        take: 500,
      }),
      getSeoBlogPosts(),
    ]);

    for (const product of products) {
      for (const lang of LANGS) {
        entries.push({
          url: `${SITE_URL}/${lang}/product/${productPathSlug(product, lang)}`,
          lastModified: product.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: buildAlternates(
              (locale) => `/${locale}/product/${productPathSlug(product, locale)}`,
            ),
          },
        });
      }
    }

    for (const category of categories) {
      for (const lang of LANGS) {
        entries.push({
          url: `${SITE_URL}/${lang}/category/${categoryPathSlug(category, lang)}`,
          lastModified: category.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: buildAlternates(
              (locale) => `/${locale}/category/${categoryPathSlug(category, locale)}`,
            ),
          },
        });
      }
    }

    for (const post of blogPosts) {
      const postLastModified = parseBlogDate(post.date, now);
      for (const lang of LANGS) {
        entries.push({
          url: `${SITE_URL}/${lang}/blog/${blogSlug(post, lang)}`,
          lastModified: postLastModified,
          changeFrequency: 'monthly',
          priority: 0.5,
          alternates: {
            languages: buildAlternates(
              (locale) => `/${locale}/blog/${blogSlug(post, locale)}`,
            ),
          },
        });
      }
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return entries;
}

function parseBlogDate(raw: string, fallback: Date): Date {
  const dotMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    return new Date(`${yyyy}-${mm}-${dd}`);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}
