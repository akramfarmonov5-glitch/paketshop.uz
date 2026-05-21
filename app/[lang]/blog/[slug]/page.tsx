import { supabase } from '../../../../lib/supabaseClient';
import BlogClient from './BlogClient';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { getBlogIdFromSlug } from '../../../../lib/slugify';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  try {
    const { slug, lang: paramsLang } = await params;
    const postId = getBlogIdFromSlug(slug);

    if (!postId) return { title: 'Maqola topilmadi' };

    const { data: post } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!post) return { title: 'Maqola topilmadi' };

    const lang = paramsLang || 'uz';
    const seoTitle = getLocalizedText(post.seo_title, lang) || getLocalizedText(post.title, lang);
    const seoDesc = getLocalizedText(post.seo_description, lang) || getLocalizedText(post.content, lang)?.substring(0, 160);
    const keywords = Array.isArray(post.seo_keywords)
      ? post.seo_keywords
      : typeof post.seo_keywords === 'string'
        ? post.seo_keywords.split(',').map((k: string) => k.trim())
        : [];

    return {
      title: seoTitle,
      description: seoDesc,
      keywords: keywords,
      alternates: {
        canonical: `https://paketshop.uz/${lang}/blog/${slug}`,
        languages: {
          'uz': `https://paketshop.uz/uz/blog/${slug}`,
          'ru': `https://paketshop.uz/ru/blog/${slug}`,
          'en': `https://paketshop.uz/en/blog/${slug}`,
        },
      },
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        type: 'article',
        publishedTime: post.created_at || post.date,
        images: post.image ? [{ url: post.image }] : [],
        siteName: 'PaketShop.uz',
      },
    };
  } catch (error) {
    return { title: 'Blog — PaketShop.uz' };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postId = getBlogIdFromSlug(slug);

  let post = null;
  if (postId) {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();
      post = data;
    } catch (error) {
      console.error("Blog post fetch failed, using fallback:", error);
    }
  }

  if (!post && postId) {
    const { blogPosts } = await fetchGlobalData();
    post = blogPosts.find(p => p.id === postId) || null;
  }

  return <BlogClient slug={slug} initialPost={post} />;
}
