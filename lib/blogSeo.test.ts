import { describe, expect, it } from 'vitest';
import { isTopicalBlogPost, selectSeoBlogPosts } from './blogSeo';
import type { BlogPost } from '../types';

function post(id: number, title: string, slug: string): BlogPost {
  return {
    id,
    title,
    slug,
    image: '/logo.png',
    content: title,
    seo: { title, description: title, keywords: [] },
    date: '26.07.2026',
  };
}

describe('blog SEO filtering', () => {
  it('keeps packaging content and rejects unrelated content', () => {
    expect(isTopicalBlogPost(post(1, 'Kraft paket tanlash', 'kraft-paket'))).toBe(true);
    expect(isTopicalBlogPost(post(2, 'Chempionlar ligasi finali', 'futbol-finali'))).toBe(false);
  });

  it('keeps only the newest post for a duplicate slug', () => {
    const selected = selectSeoBlogPosts([
      post(3, 'Qadoqlash', 'qadoqlash'),
      post(8, 'Qadoqlash yangilandi', 'qadoqlash'),
    ]);

    expect(selected.map((item) => item.id)).toEqual([8]);
  });
});
