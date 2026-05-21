import HomeContent from './HomeContent';
import { fetchGlobalData } from '../../lib/fetchGlobalData';

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const activeLang = lang || 'uz';
  const { products, categories, heroContent, blogPosts } = await fetchGlobalData();

  return (
    <HomeContent
      lang={activeLang}
      products={products}
      categories={categories}
      heroContent={heroContent}
      blogPosts={blogPosts}
    />
  );
}
