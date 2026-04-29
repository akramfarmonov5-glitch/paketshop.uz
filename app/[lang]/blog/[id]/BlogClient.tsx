'use client';

import { useGlobalData } from '../../../../context/GlobalContext';
import BlogPostDetail from '../../../../components/BlogPostDetail';
import { useRouter } from 'next/navigation';

export default function BlogClient({ id }: { id: string }) {
  const { blogPosts, isLoading } = useGlobalData();
  const router = useRouter();

  if (isLoading) return <div className="min-h-screen pt-24 text-center">Yuklanmoqda...</div>;
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) return <div className="min-h-screen pt-24 text-center">Maqola topilmadi</div>;
  return <BlogPostDetail post={post} onBack={() => router.push('/')} />;
}
