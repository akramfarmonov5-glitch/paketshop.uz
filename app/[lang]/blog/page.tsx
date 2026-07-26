import React from 'react';
import BlogContent from './BlogContent';
import { localizedPageMetadata } from '../../../lib/seo';
import { getSeoBlogPosts } from '../../../lib/server/blogRepository';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/blog',
    title: {
      uz: 'Qadoqlash bo‘yicha foydali maqolalar | PaketShop.uz',
      ru: 'Полезные статьи об упаковке | PaketShop.uz',
    },
    description: {
      uz: 'Kraft paketlar, oziq-ovqat qadoqlari va bir martalik idishlarni tanlash bo‘yicha amaliy maslahatlar.',
      ru: 'Практические советы по выбору крафт-пакетов, пищевой упаковки и одноразовой посуды.',
    },
  });
}

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const activeLang = lang === 'ru' ? 'ru' : 'uz';
  const blogPosts = await getSeoBlogPosts().catch(() => []);

  return <BlogContent blogPosts={blogPosts} lang={activeLang} />;
}
