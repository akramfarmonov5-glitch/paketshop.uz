import type { MetadataRoute } from 'next';
import { supabase, hasSupabaseCredentials } from '../lib/supabaseClient';
import { productSlug, blogSlug } from '../lib/slugify';
import { getCategorySlug } from '../lib/categoryUtils';
import type { Product, Category, BlogPost } from '../types';

const SITE_URL = 'https://paketshop.uz';
const LANGS = ['uz', 'ru', 'en'] as const;
type Lang = (typeof LANGS)[number];

function buildAlternates(pathBuilder: (lang: Lang) => string) {
  const languages: Record<string, string> = {};
  for (const lang of LANGS) {
    languages[lang] = `${SITE_URL}${pathBuilder(lang)}`;
  }
  languages['x-default'] = `${SITE_URL}${pathBuilder('uz')}`;
  return languages;
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
      priority: 1.0,
      alternates: { languages: buildAlternates((l) => `/${l}`) },
    });
    entries.push({
      url: `${SITE_URL}/${lang}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: { languages: buildAlternates((l) => `/${l}/blog`) },
    });
  }

  if (!hasSupabaseCredentials) {
    return entries;
  }

  try {
    const [productsRes, categoriesRes, blogRes] = await Promise.all([
      supabase.from('products').select('id, name, slug').limit(5000),
      supabase.from('categories').select('id, name, slug').limit(500),
      supabase.from('blog_posts').select('id, title, slug, date').limit(5000),
    ]);

    if (productsRes.data) {
      for (const product of productsRes.data as Product[]) {
        for (const lang of LANGS) {
          entries.push({
            url: `${SITE_URL}/${lang}/product/${productSlug(product, lang)}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
            alternates: {
              languages: buildAlternates((l) => `/${l}/product/${productSlug(product, l)}`),
            },
          });
        }
      }
    }

    if (categoriesRes.data) {
      for (const category of categoriesRes.data as Category[]) {
        for (const lang of LANGS) {
          entries.push({
            url: `${SITE_URL}/${lang}/category/${getCategorySlug(category, lang)}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6,
            alternates: {
              languages: buildAlternates((l) => `/${l}/category/${getCategorySlug(category, l)}`),
            },
          });
        }
      }
    }

    if (blogRes.data) {
      for (const post of blogRes.data as BlogPost[]) {
        const postLastMod = post.date ? parseBlogDate(post.date) : now;
        for (const lang of LANGS) {
          entries.push({
            url: `${SITE_URL}/${lang}/blog/${blogSlug(post, lang)}`,
            lastModified: postLastMod,
            changeFrequency: 'monthly',
            priority: 0.5,
            alternates: {
              languages: buildAlternates((l) => `/${l}/blog/${blogSlug(post, l)}`),
            },
          });
        }
      }
    }
  } catch (err) {
    console.error('Sitemap generation error:', err);
  }

  return entries;
}

function parseBlogDate(raw: string): Date {
  const dotMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    return new Date(`${yyyy}-${mm}-${dd}`);
  }
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}
