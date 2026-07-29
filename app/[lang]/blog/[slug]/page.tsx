import BlogClient from './BlogClient';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { blogSlug, getBlogIdFromSlug } from '../../../../lib/slugify';
import { getSeoBlogPost, getSeoBlogPosts } from '../../../../lib/server/blogRepository';
import { localizedOgImageUrl, SITE_NAME, SITE_URL } from '../../../../lib/site';
import { notFound, permanentRedirect } from 'next/navigation';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getSeoBlogPosts().catch(() => []);
  return posts.flatMap((post) => [
    { lang: 'uz', slug: blogSlug(post, 'uz') },
    { lang: 'ru', slug: blogSlug(post, 'ru') },
  ]);
}

function toIsoDate(raw: string): string {
  const dotMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsed.toISOString().slice(0, 10);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang: requestedLang } = await params;
  const lang = requestedLang === 'ru' ? 'ru' : 'uz';
  const postId = getBlogIdFromSlug(slug);
  const resolved = postId ? await getSeoBlogPost(postId).catch(() => null) : null;

  if (!resolved) {
    return {
      title: 'Maqola topilmadi',
      robots: { index: false, follow: false },
    };
  }

  const post = resolved.canonicalPost;
  const seoTitle = getLocalizedText(post.seo?.title, lang)
    || getLocalizedText(post.title, lang);
  const seoDescription = getLocalizedText(post.seo?.description, lang)
    || getLocalizedText(post.content, lang).slice(0, 160);
  const canonicalPath = `/${lang}/blog/${blogSlug(post, lang)}`;
  const image = post.image && !post.image.endsWith('/logo.png')
    ? post.image
    : localizedOgImageUrl(lang);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: Array.isArray(post.seo?.keywords) ? post.seo.keywords : undefined,
    alternates: {
      canonical: canonicalPath,
      languages: {
        uz: `/uz/blog/${blogSlug(post, 'uz')}`,
        ru: `/ru/blog/${blogSlug(post, 'ru')}`,
        'x-default': `/uz/blog/${blogSlug(post, 'uz')}`,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      url: `${SITE_URL}${canonicalPath}`,
      publishedTime: toIsoDate(post.date),
      images: [{ url: image, alt: seoTitle }],
      siteName: SITE_NAME,
      locale: lang === 'ru' ? 'ru_RU' : 'uz_UZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang: requestedLang } = await params;
  const lang = requestedLang === 'ru' ? 'ru' : 'uz';
  const postId = getBlogIdFromSlug(slug);
  const resolved = postId ? await getSeoBlogPost(postId).catch(() => null) : null;
  if (!resolved) notFound();

  const post = resolved.canonicalPost;
  const canonicalSlug = blogSlug(post, lang);
  if (slug !== canonicalSlug || resolved.post.id !== post.id) {
    permanentRedirect(`/${lang}/blog/${canonicalSlug}`);
  }

  const title = getLocalizedText(post.title, lang);
  const description = getLocalizedText(post.seo?.description, lang)
    || getLocalizedText(post.content, lang).slice(0, 160);
  const canonicalUrl = `${SITE_URL}/${lang}/blog/${canonicalSlug}`;
  const articleMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: post.image ? [post.image] : [],
    datePublished: toIsoDate(post.date),
    dateModified: toIsoDate(post.date),
    mainEntityOfPage: canonicalUrl,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  };
  const breadcrumbMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'ru' ? 'Главная' : 'Bosh sahifa',
        item: `${SITE_URL}/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: lang === 'ru' ? 'Статьи' : 'Maqolalar',
        item: `${SITE_URL}/${lang}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleMarkup) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }} />
      <BlogClient slug={canonicalSlug} initialPost={post} />
    </>
  );
}
