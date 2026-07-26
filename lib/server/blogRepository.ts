import 'server-only';
import { Prisma } from '@prisma/client';
import { blogTopicKey, isTopicalBlogPost, selectSeoBlogPosts } from '@/lib/blogSeo';
import { db } from '@/lib/server/db';
import type { BlogPost } from '@/types';

interface BlogRow {
  id: string | number;
  title: unknown;
  slug: unknown;
  image: string | null;
  content: unknown;
  seo_title: unknown;
  seo_description: unknown;
  seo_keywords: unknown;
  date: string | null;
}

function toBlogPost(row: BlogRow): BlogPost {
  const keywords = Array.isArray(row.seo_keywords)
    ? row.seo_keywords.map(String)
    : typeof row.seo_keywords === 'string'
      ? row.seo_keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      : [];

  return {
    id: Number(row.id),
    title: row.title as BlogPost['title'],
    slug: row.slug as BlogPost['slug'],
    image: row.image || '/logo.png',
    content: row.content as BlogPost['content'],
    seo: {
      title: (row.seo_title || row.title) as BlogPost['seo']['title'],
      description: (row.seo_description || '') as BlogPost['seo']['description'],
      keywords,
    },
    date: row.date || '',
  };
}

async function getAllBlogPosts(): Promise<BlogPost[]> {
  const rows = await db.$queryRaw<BlogRow[]>(Prisma.sql`
    SELECT id, title, slug, image, content, seo_title, seo_description, seo_keywords, date
    FROM public.blog_posts
    ORDER BY id::integer DESC
    LIMIT 500
  `);

  return rows.map(toBlogPost);
}

export async function getSeoBlogPosts(): Promise<BlogPost[]> {
  return selectSeoBlogPosts(await getAllBlogPosts());
}

export interface ResolvedBlogPost {
  post: BlogPost;
  canonicalPost: BlogPost;
}

export async function getSeoBlogPost(id: number): Promise<ResolvedBlogPost | null> {
  const posts = await getAllBlogPosts();
  const post = posts.find((candidate) => candidate.id === id);
  if (!post || !isTopicalBlogPost(post)) return null;

  const key = blogTopicKey(post);
  const canonicalPost = selectSeoBlogPosts(posts).find(
    (candidate) => blogTopicKey(candidate) === key,
  ) || post;

  return { post, canonicalPost };
}
