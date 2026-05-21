'use client';

import { useGlobalData } from '../../../../context/GlobalContext';
import BlogPostDetail from '../../../../components/BlogPostDetail';
import { useRouter, useParams } from 'next/navigation';
import { getBlogIdFromSlug } from '../../../../lib/slugify';

export default function BlogClient({ slug }: { slug: string }) {
  const { blogPosts, isLoading } = useGlobalData();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'uz';

  if (isLoading) return <div className="min-h-screen pt-24 text-center">Yuklanmoqda...</div>;

  const postId = getBlogIdFromSlug(slug);
  const post = blogPosts.find(p => p.id === postId);

  if (!post) return <div className="min-h-screen pt-24 text-center">Maqola topilmadi</div>;
  return <BlogPostDetail post={post} onBack={() => router.push(`/${lang}/blog`)} />;
}
