'use client';

import React from 'react';
import { useGlobalData } from '../../../context/GlobalContext';
import BlogGrid from '../../../components/BlogGrid';
import { useRouter, useParams } from 'next/navigation';


export default function BlogArchivePage() {
  const { blogPosts, isLoading } = useGlobalData();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'uz';

  const navigateToBlogPost = (id: number) => {
    router.push(`/${lang}/blog/${id}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <BlogGrid posts={blogPosts} onPostClick={navigateToBlogPost} isLoading={isLoading} />
    </div>
  );
}
