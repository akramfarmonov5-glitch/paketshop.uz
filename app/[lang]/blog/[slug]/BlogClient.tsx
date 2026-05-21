'use client';

import { useGlobalData } from '../../../../context/GlobalContext';
import BlogPostDetail from '../../../../components/BlogPostDetail';
import { useRouter, useParams } from 'next/navigation';
import { getBlogIdFromSlug } from '../../../../lib/slugify';
import { BlogPost } from '../../../../types';

interface BlogClientProps {
  slug: string;
  initialPost?: BlogPost | null;
}

export default function BlogClient({ slug, initialPost }: BlogClientProps) {
  const globalData = useGlobalData();
  const isLoading = initialPost ? false : globalData.isLoading;
  const blogPosts = globalData.blogPosts;

  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'uz';

  if (isLoading) return <div className="min-h-screen pt-24 text-center">Yuklanmoqda...</div>;

  const postId = getBlogIdFromSlug(slug);
  const post = initialPost || blogPosts.find(p => p.id === postId);

  if (!post) return <div className="min-h-screen pt-24 text-center">Maqola topilmadi</div>;
  return <BlogPostDetail post={post} onBack={() => router.push(`/${lang}/blog`)} />;
}
