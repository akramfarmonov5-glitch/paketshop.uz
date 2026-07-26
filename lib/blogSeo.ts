import { getLocalizedText } from './i18nUtils';
import { slugify } from './slugify';
import type { BlogPost } from '../types';

const PACKAGING_TOPIC_PATTERN =
  /(qadoq|qadoqlash|paket|xalta|idish|konteyner|kraft|upakov|posud|packag|container|paper bag|упаков|пакет|посуд|контейнер|крафт)/i;

export function blogTopicKey(post: BlogPost): string {
  return (
    getLocalizedText(post.slug, 'uz')
    || slugify(getLocalizedText(post.title, 'uz'))
  ).trim().toLowerCase();
}

export function isTopicalBlogPost(post: BlogPost): boolean {
  const searchable = [
    getLocalizedText(post.title, 'uz'),
    getLocalizedText(post.title, 'ru'),
    getLocalizedText(post.slug, 'uz'),
    getLocalizedText(post.slug, 'ru'),
    getLocalizedText(post.content, 'uz').slice(0, 500),
    getLocalizedText(post.content, 'ru').slice(0, 500),
  ].join(' ');

  return PACKAGING_TOPIC_PATTERN.test(searchable);
}

/**
 * Search va sitemap uchun faqat PaketShop mavzusidagi, eng yangi kanonik
 * maqolani qoldiradi. Bir xil slug bilan yaratilgan eski AI dublikatlari
 * indeksga qayta yuborilmaydi.
 */
export function selectSeoBlogPosts(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>();

  return [...posts]
    .sort((a, b) => b.id - a.id)
    .filter(isTopicalBlogPost)
    .filter((post) => {
      const key = blogTopicKey(post);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
