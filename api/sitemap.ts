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
        { id: 1, name: 'Midnight Chronograph', category: 'Soatlar', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Eksklyuziv soat' },
        { id: 2, name: 'Royal Leather Bag', category: 'Sumkalar', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Premium charm sumka' },
        { id: 3, name: 'Aviator Elite', category: "Ko'zoynaklar", image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Aviator ko\'zoynak' },
        { id: 4, name: 'Essence No. 5', category: 'Parfyumeriya', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Premium parfyum' },
        { id: 5, name: 'Golden Horizon Heels', category: 'Poyabzal', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Zamonaviy tufli' },
        { id: 6, name: 'Obsidian Cufflinks', category: 'Aksessuarlar', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Premium tugmalar' },
        { id: 7, name: 'Silk Monarch Scarf', category: 'Aksessuarlar', image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Ipak sharf' },
        { id: 8, name: 'Titan Smart Ring', category: 'Texnologiya', image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1000&auto=format&fit=crop', shortDescription: 'Aqlli uzuk' }
      ];
    }

    if (categories.length === 0) {
      categories = [
        { slug: 'soatlar', name: 'Soatlar' },
        { slug: 'sumkalar', name: 'Sumkalar' },
        { slug: 'kozoynaklar', name: "Ko'zoynaklar" },
        { slug: 'parfyumeriya', name: 'Parfyumeriya' },
        { slug: 'aksessuarlar', name: 'Aksessuarlar' }
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
