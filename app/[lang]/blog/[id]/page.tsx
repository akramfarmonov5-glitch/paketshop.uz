import { supabase } from '../../../../lib/supabaseClient';
import BlogClient from './BlogClient';
import { getLocalizedText } from '../../../../lib/i18nUtils';

export async function generateMetadata({ params }: { params: { id: string, lang: string } }) {
  try {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!post) return { title: 'Maqola topilmadi' };

    const lang = params.lang || 'uz';
    const seoTitle = getLocalizedText(post.seo?.title, lang) || getLocalizedText(post.title, lang);
    const seoDesc = getLocalizedText(post.seo?.description, lang) || getLocalizedText(post.content, lang)?.substring(0, 160);
    const keywords = getLocalizedText(post.seo?.keywords, lang)?.split(',').map((k: string) => k.trim()) || [];

    return {
      title: seoTitle,
      description: seoDesc,
      keywords: keywords,
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        images: post.image ? [{ url: post.image }] : [],
      }
    };
  } catch (error) {
    return { title: 'Blog' };
  }
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  return <BlogClient id={params.id} />;
}
