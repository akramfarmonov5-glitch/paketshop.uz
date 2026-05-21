import React from 'react';
import BlogContent from './BlogContent';
import { fetchGlobalData } from '../../../lib/fetchGlobalData';

export const revalidate = 300; // Cache for 5 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const activeLang = lang || 'uz';

  const titles: Record<string, string> = {
    uz: 'Foydali Maqolalar va Yangiliklar | PaketShop.uz',
    ru: 'Полезные Статьи и Новости | PaketShop.uz',
    en: 'Useful Articles and News | PaketShop.uz',
  };

  const descriptions: Record<string, string> = {
    uz: "Kraft paketlar, qadoqlash materiallari va qog'oz xaltalar haqida eng so'nggi foydali maqolalar, biznes maslahatlari va soha yangiliklari.",
    ru: 'Последние полезные статьи, бизнес-советы и новости отрасли о крафт-пакетах, упаковочных материалах и бумажных пакетах.',
    en: 'The latest useful articles, business tips, and industry news about kraft bags, packaging materials, and paper bags.',
  };

  const title = titles[activeLang] || titles.uz;
  const description = descriptions[activeLang] || descriptions.uz;

  return {
    title,
    description,
    alternates: {
      canonical: `https://paketshop.uz/${activeLang}/blog`,
      languages: {
        uz: 'https://paketshop.uz/uz/blog',
        ru: 'https://paketshop.uz/ru/blog',
        en: 'https://paketshop.uz/en/blog',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://paketshop.uz/${activeLang}/blog`,
      siteName: 'PaketShop.uz',
    },
  };
}

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const activeLang = lang || 'uz';

  const { blogPosts } = await fetchGlobalData();

  return <BlogContent blogPosts={blogPosts} lang={activeLang} />;
}
