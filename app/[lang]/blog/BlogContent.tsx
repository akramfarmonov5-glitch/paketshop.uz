'use client';

import React from 'react';
import BlogGrid from '../../../components/BlogGrid';
import { useRouter } from 'next/navigation';
import { BlogPost } from '../../../types';

interface BlogContentProps {
  blogPosts: BlogPost[];
  lang: string;
}

export default function BlogContent({ blogPosts, lang }: BlogContentProps) {
  const router = useRouter();

  const navigateToBlogPost = (slug: string) => {
    router.push(`/${lang}/blog/${slug}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <BlogGrid posts={blogPosts} onPostClick={navigateToBlogPost} isLoading={false} />
    </div>
  );
}
