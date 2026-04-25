import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://paketshop.uz';
const LANGUAGES = ['uz', 'ru', 'en'] as const;

interface SitemapImageData {
  image?: string;
  imageTitle?: string;
  imageCaption?: string;
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;
  const today = new Date().toISOString().split('T')[0];

  try {
    let products = [];
    let categories = [];
    let blogPosts = [];

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const [prodRes, catRes, blogRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('blog_posts').select('*').order('date', { ascending: false }),
      ]);

      if (prodRes.data) products = prodRes.data;
      if (catRes.data) categories = catRes.data;
      if (blogRes.data) blogPosts = blogRes.data;
    }

    if (products.length === 0) products = getFallbackProducts();
    if (categories.length === 0) categories = getFallbackCategories();

    let urls = '';

    urls += renderLocalizedUrl('/', today, 'daily', '1.0');

    for (const cat of categories) {
      const catSlug = cat.slug || slugify(getLocalizedText(cat.name, 'uz'));
      urls += renderLocalizedUrl(`/category/${catSlug}`, today, 'weekly', '0.9', {
        image: cat.image,
        imageTitle: getLocalizedText(cat.name, 'uz'),
      });
    }

    for (const product of products) {
      const prodSlug = `${slugify(getLocalizedText(product.name, 'uz'))}-${product.id}`;
      urls += renderLocalizedUrl(`/product/${prodSlug}`, today, 'weekly', '0.8', {
        image: product.image,
        imageTitle: getLocalizedText(product.name, 'uz'),
        imageCaption: getLocalizedText(product.shortDescription || product.description || product.name, 'uz'),
      });
    }

    for (const post of blogPosts) {
      const postSlug = `${slugify(getLocalizedText(post.title, 'uz'))}-${post.id}`;
      urls += renderLocalizedUrl(`/blog/${postSlug}`, post.date || today, 'monthly', '0.7', {
        image: post.image,
        imageTitle: getLocalizedText(post.title, 'uz'),
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);
  } catch (err) {
    console.error('Sitemap Generation Error:', err);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/uz</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(fallback);
  }
}

function renderLocalizedUrl(path, lastmod, changefreq, priority, imageData: SitemapImageData = {}) {
  return LANGUAGES.map((lang) => {
    const loc = localizedUrl(path, lang);
    const alternates = LANGUAGES.map((altLang) =>
      `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${localizedUrl(path, altLang)}" />`
    ).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(path, 'uz')}" />`;
    const image = imageData.image ? `
    <image:image>
      <image:loc>${escapeXml(imageData.image)}</image:loc>
      <image:title>${escapeXml(imageData.imageTitle || '')}</image:title>${imageData.imageCaption ? `
      <image:caption>${escapeXml(imageData.imageCaption)}</image:caption>` : ''}
    </image:image>` : '';

    return `
  <url>
    <loc>${loc}</loc>
${alternates}
${xDefault}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${image}
  </url>`;
  }).join('');
}

function localizedUrl(path, lang) {
  return `${BASE_URL}${path === '/' ? `/${lang}` : `/${lang}${path}`}`;
}

function getLocalizedText(text, lang) {
  if (!text) return '';
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (parsed && (parsed.uz !== undefined || parsed.ru !== undefined || parsed.en !== undefined)) {
        return parsed[lang] || parsed.uz || '';
      }
    } catch {
      return text;
    }
  }
  if (typeof text === 'object') {
    return text[lang] || text.uz || '';
  }
  return String(text);
}

function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/['`']/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getFallbackProducts() {
  return [
    { id: 1, name: { uz: 'Chiqindi uchun qoplar 70x90 sm 20 dona', ru: 'Мешки для мусора 70x90 см 20 шт', en: 'Trash bags 70x90 cm 20 pcs' }, category: 'chiqindi-paketlari', image: 'https://res.cloudinary.com/dkc6rlyeo/image/upload/v1776180967/xmpekaing8zqafdzu42k.webp', shortDescription: { uz: 'Ulgurji narxlarda sifatli chiqindi qoplari.', ru: 'Качественные мешки для мусора по оптовым ценам.', en: 'Quality trash bags at wholesale prices.' } },
  ];
}

function getFallbackCategories() {
  return [
    { slug: 'paketlar', name: { uz: 'Paketlar', ru: 'Пакеты', en: 'Bags' } },
    { slug: 'idishlar', name: { uz: 'Idishlar va konteynerlar', ru: 'Посуда и контейнеры', en: 'Tableware and containers' } },
    { slug: 'xojalik-mollari', name: { uz: "Xo'jalik mollari", ru: 'Хозяйственные товары', en: 'Household goods' } },
  ];
}
