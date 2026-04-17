import { createClient } from '@supabase/supabase-js';

/**
 * Dinamik Sitemap Generator
 * Supabase dan barcha mahsulotlar, kategoriyalar va blog postlarni olib,
 * Google uchun to'liq sitemap.xml yaratadi.
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_KEY;
  const BASE_URL = 'https://paketshop.uz';
  const TODAY = new Date().toISOString().split('T')[0];

  try {
    let products = [];
    let categories = [];
    let blogPosts = [];

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const [prodRes, catRes, blogRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('blog_posts').select('*').order('date', { ascending: false })
      ]);

      if (prodRes.data) products = prodRes.data;
      if (catRes.data) categories = catRes.data;
      if (blogRes.data) blogPosts = blogRes.data;
    }

    // Fallback mock data if DB is empty
    if (products.length === 0) {
      products = [
        { id: 1, name: 'Chiqindi uchun qoplar 70x90 sm 20 dona', category: 'Chiqindi paketlari', image: 'https://res.cloudinary.com/dkc6rlyeo/image/upload/v1776180967/xmpekaing8zqafdzu42k.webp', shortDescription: 'Optombazar.uz sizga 70x90 sm o\'lchamdagi 20 dona chiqindi qoplarini ulgurji narxlarda taklif etadi.' },
        { id: 2, name: 'Mikrofibrlar', category: 'Salfetka va lattalar', image: 'https://res.cloudinary.com/dkc6rlyeo/image/upload/v1767876157/d2zvjnucolbig9axjj2j.avif', shortDescription: 'Yuqori sifatli mikrofibr matolar' },
        { id: 3, name: 'Plastik oziq-ovqat konteyneri 1000 ml', category: 'Konteynerlar va idishlar', image: 'https://res.cloudinary.com/dkc6rlyeo/image/upload/v1766339063/xigshqt4xkrrt9qwjes2.png', shortDescription: '1000 ml hajmli yuqori sifatli plastik konteynerlar to\'plami' },
        { id: 4, name: 'Ziplock paketlar 6x9 sm, 200 dona', category: 'Zip-Lock paketlar', image: 'https://res.cloudinary.com/dkc6rlyeo/image/upload/v1766332558/kf8kk10hofivdo7mbtas.jpg', shortDescription: 'Ushbu 6x9 sm o\'lchamdagi 200 dona qulflanadigan Ziplock paketlar' },
      ];
    }

    if (categories.length === 0) {
      categories = [
        { slug: 'paketlar', name: 'Paketlar' },
        { slug: 'idishlar', name: 'Idishlar va Konteynerlar' },
        { slug: 'xojalik-mollari', name: 'Xo\'jalik mollari' },
        { slug: 'qadoqlash', name: 'Qadoqlash materiallari' }
      ];
    }

    // Slug yaratish funksiyasi
    const slugify = (text) => text.toString().toLowerCase().trim()
      .replace(/['`']/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

    // === XML Sitemap ===
    let urls = '';

    // 1. Bosh sahifa
    urls += `
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // 2. Kategoriya sahifalari
    for (const cat of categories) {
      const catSlug = cat.slug || slugify(cat.name);
      urls += `
  <url>
    <loc>${BASE_URL}/category/${catSlug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    // 3. Mahsulot sahifalari (ENG MUHIM!)
    for (const product of products) {
      const prodSlug = `${slugify(product.name)}-${product.id}`;
      urls += `
  <url>
    <loc>${BASE_URL}/product/${prodSlug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${product.image ? `
    <image:image>
      <image:loc>${escapeXml(product.image)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
      <image:caption>${escapeXml(product.shortDescription || product.name)}</image:caption>
    </image:image>` : ''}
  </url>`;
    }

    // 4. Blog postlar
    for (const post of blogPosts) {
      const postSlug = `${slugify(post.title)}-${post.id}`;
      urls += `
  <url>
    <loc>${BASE_URL}/blog/${postSlug}</loc>
    <lastmod>${post.date || TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${post.image ? `
    <image:image>
      <image:loc>${escapeXml(post.image)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>` : ''}
  </url>`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);

  } catch (err) {
    console.error('Sitemap Generation Error:', err);
    // Fallback minimal sitemap
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(fallback);
  }
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
