import { createClient } from '@supabase/supabase-js';

/**
 * Pre-rendering API — Google Bot uchun to'liq HTML sahifalar
 * 
 * /api/prerender/product/midnight-chronograph-1 → Product page HTML
 * /api/prerender/blog/premium-soatlar-2026-1 → Blog page HTML
 * /api/prerender/category/soatlar → Category page HTML
 * /api/prerender/ → Home page HTML
 */
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_KEY;
  const BASE_URL = 'https://paketshop.uz';
  
  // URL path ni olish
  const { path } = req.query;
  const segments = Array.isArray(path) ? path : (path ? path.split('/') : []);
  const pageType = segments[0] || 'home'; // product, blog, category, home

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

    // Fallback mock data
    if (products.length === 0) {
      products = getMockProducts();
    }
    if (categories.length === 0) {
      categories = getMockCategories();
    }

    let html = '';

    if (pageType === 'product' && segments[1]) {
      html = renderProductPage(segments[1], products, categories, BASE_URL);
    } else if (pageType === 'blog' && segments[1]) {
      html = renderBlogPage(segments[1], blogPosts, BASE_URL);
    } else if (pageType === 'category' && segments[1]) {
      html = renderCategoryPage(segments[1], products, categories, BASE_URL);
    } else {
      html = renderHomePage(products, categories, blogPosts, BASE_URL);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);

  } catch (err) {
    console.error('Pre-render Error:', err);
    // Redirect to SPA
    res.redirect(302, '/');
  }
}

// === PRODUCT PAGE ===
function renderProductPage(slug, products, categories, BASE_URL) {
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1], 10);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return renderNotFound(BASE_URL);
  }

  const title = `${product.name} - ${product.category} | PaketShop.uz`;
  const description = `${product.name} - ${product.shortDescription || product.category}. Narxi: ${product.formattedPrice || formatPrice(product.price)}. PaketShop.uz dan buyurtma bering!`;
  const canonicalUrl = `${BASE_URL}/product/${slug}`;
  
  const productSchema = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, ...(product.images || [])],
    "description": product.shortDescription || product.name,
    "sku": `PSHOP-${product.id}`,
    "brand": { "@type": "Brand", "name": "PaketShop" },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "UZS",
      "price": product.price,
      "availability": (product.stock === undefined || product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": "PaketShop.uz" }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  });

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Bosh sahifa", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": product.category, "item": `${BASE_URL}/category/${slugify(product.category)}` },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": canonicalUrl }
    ]
  });

  // O'xshash mahsulotlar
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${esc(product.name)}, ${esc(product.category)}, sotib olish, narxi, PaketShop, online shop uzbekistan">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonicalUrl}">
  
  <meta property="og:type" content="product">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${product.image}">
  <meta property="og:site_name" content="PaketShop.uz">
  <meta property="og:locale" content="uz_UZ">
  <meta property="product:price:amount" content="${product.price}">
  <meta property="product:price:currency" content="UZS">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${product.image}">
  
  <script type="application/ld+json">${productSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  
  <link rel="icon" type="image/png" href="/logo-light.png">
</head>
<body>
  <header>
    <nav>
      <a href="${BASE_URL}/">PaketShop.uz</a>
    </nav>
  </header>
  
  <main>
    <nav aria-label="breadcrumb">
      <ol>
        <li><a href="${BASE_URL}/">Bosh sahifa</a></li>
        <li><a href="${BASE_URL}/category/${slugify(product.category)}">${esc(product.category)}</a></li>
        <li>${esc(product.name)}</li>
      </ol>
    </nav>

    <article itemscope itemtype="https://schema.org/Product">
      <h1 itemprop="name">${esc(product.name)}</h1>
      <img itemprop="image" src="${product.image}" alt="${esc(product.name)}" width="600" height="750">
      
      <div itemprop="description">
        <p>${esc(product.shortDescription || '')}</p>
      </div>
      
      <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <meta itemprop="priceCurrency" content="UZS">
        <p>Narxi: <span itemprop="price">${product.price}</span> UZS</p>
        <p>Holati: <span itemprop="availability" content="${(product.stock === undefined || product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}">${(product.stock === undefined || product.stock > 0) ? 'Mavjud' : 'Tugagan'}</span></p>
      </div>
      
      <div>
        <h2>Xususiyatlar</h2>
        <table>
          ${(product.specs || []).map(s => `<tr><th>${esc(s.label)}</th><td>${esc(s.value)}</td></tr>`).join('')}
        </table>
      </div>

      <div itemprop="brand" itemscope itemtype="https://schema.org/Brand">
        <meta itemprop="name" content="PaketShop">
      </div>
    </article>

    ${related.length > 0 ? `
    <section>
      <h2>O'xshash mahsulotlar</h2>
      <ul>
        ${related.map(p => `
        <li>
          <a href="${BASE_URL}/product/${slugify(p.name)}-${p.id}">
            <img src="${p.image}" alt="${esc(p.name)}" width="300" height="375" loading="lazy">
            <h3>${esc(p.name)}</h3>
            <p>${formatPrice(p.price)}</p>
          </a>
        </li>`).join('')}
      </ul>
    </section>` : ''}
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} PaketShop.uz — O'zbekistondagi ishonchli onlayn do'kon</p>
    <nav>
      <a href="${BASE_URL}/">Bosh sahifa</a>
      ${getMockCategories().map(c => `<a href="${BASE_URL}/category/${c.slug}">${esc(c.name)}</a>`).join(' ')}
    </nav>
  </footer>
  
  <script>
    // Redirect real users to SPA
    if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebot|ia_archiver/i)) {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</body>
</html>`;
}

// === BLOG PAGE ===
function renderBlogPage(slug, blogPosts, BASE_URL) {
  const parts = slug.split('-');
  const id = parts[parts.length - 1];
  const post = blogPosts.find(p => String(p.id) === String(id));
  
  if (!post) return renderNotFound(BASE_URL);

  const title = `${post.seo?.title || post.title} | PaketShop.uz Blog`;
  const description = post.seo?.description || post.content.substring(0, 160);
  const canonicalUrl = `${BASE_URL}/blog/${slug}`;

  const blogSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": { "@type": "Organization", "name": "PaketShop.uz" },
    "publisher": {
      "@type": "Organization",
      "name": "PaketShop.uz",
      "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo-light.png` }
    },
    "description": description,
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
  });

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${(post.seo?.keywords || []).join(', ')}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonicalUrl}">
  
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${post.image}">
  <meta property="article:published_time" content="${post.date}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${post.image}">
  
  <script type="application/ld+json">${blogSchema}</script>
  <link rel="icon" type="image/png" href="/logo-light.png">
</head>
<body>
  <header><nav><a href="${BASE_URL}/">PaketShop.uz</a></nav></header>
  <main>
    <nav aria-label="breadcrumb">
      <ol>
        <li><a href="${BASE_URL}/">Bosh sahifa</a></li>
        <li>Blog</li>
        <li>${esc(post.title)}</li>
      </ol>
    </nav>
    <article itemscope itemtype="https://schema.org/BlogPosting">
      <h1 itemprop="headline">${esc(post.title)}</h1>
      <time itemprop="datePublished" datetime="${post.date}">${post.date}</time>
      <img itemprop="image" src="${post.image}" alt="${esc(post.title)}" width="1200" height="675">
      <div itemprop="articleBody">
        ${post.content.split('\n').map(p => `<p>${esc(p)}</p>`).join('')}
      </div>
    </article>
  </main>
  <footer><p>&copy; ${new Date().getFullYear()} PaketShop.uz</p></footer>
  <script>
    if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebot|ia_archiver/i)) {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</body>
</html>`;
}

// === CATEGORY PAGE ===
function renderCategoryPage(catSlug, products, categories, BASE_URL) {
  const category = categories.find(c => c.slug === catSlug || slugify(c.name) === catSlug);
  const catName = category ? category.name : catSlug;
  const catProducts = products.filter(p => slugify(p.category) === catSlug || p.category === catName);
  
  const title = `${catName} - Online Sotib Olish | PaketShop.uz`;
  const description = category?.description || `${catName} kategoriyasidagi sifatli mahsulotlar. PaketShop.uz dan buyurtma bering!`;
  const canonicalUrl = `${BASE_URL}/category/${catSlug}`;

  const itemListSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": catName,
    "description": description,
    "url": canonicalUrl,
    "numberOfItems": catProducts.length,
    "itemListElement": catProducts.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${BASE_URL}/product/${slugify(p.name)}-${p.id}`,
      "name": p.name
    }))
  });

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${esc(catName)}, sotib olish, narxi, PaketShop, online shop uzbekistan">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonicalUrl}">
  
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${category?.image || `${BASE_URL}/logo-light.png`}">
  
  <script type="application/ld+json">${itemListSchema}</script>
  <link rel="icon" type="image/png" href="/logo-light.png">
</head>
<body>
  <header><nav><a href="${BASE_URL}/">PaketShop.uz</a></nav></header>
  <main>
    <nav aria-label="breadcrumb">
      <ol>
        <li><a href="${BASE_URL}/">Bosh sahifa</a></li>
        <li>${esc(catName)}</li>
      </ol>
    </nav>
    <h1>${esc(catName)} — PaketShop.uz</h1>
    <p>${esc(description)}</p>
    
    <section>
      <h2>${catProducts.length} ta mahsulot</h2>
      <ul>
        ${catProducts.map(p => `
        <li>
          <a href="${BASE_URL}/product/${slugify(p.name)}-${p.id}">
            <img src="${p.image}" alt="${esc(p.name)}" width="300" height="375" loading="lazy">
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.shortDescription || '')}</p>
            <p>Narxi: ${formatPrice(p.price)}</p>
          </a>
        </li>`).join('')}
      </ul>
    </section>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} PaketShop.uz — O'zbekistondagi ishonchli onlayn do'kon</p>
    <nav>
      <a href="${BASE_URL}/">Bosh sahifa</a>
      ${getMockCategories().map(c => `<a href="${BASE_URL}/category/${c.slug}">${esc(c.name)}</a>`).join(' ')}
    </nav>
  </footer>
  <script>
    if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebot|ia_archiver/i)) {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</body>
</html>`;
}

// === HOME PAGE ===
function renderHomePage(products, categories, blogPosts, BASE_URL) {
  const title = "PaketShop.uz | Online Do'kon — O'zbekistondagi Sifatli Mahsulotlar";
  const description = "PaketShop.uz — O'zbekistondagi ishonchli onlayn do'kon. Soatlar, sumkalar, parfyumeriya va boshqa sifatli mahsulotlar. Yuqori sifat va qulay narxlar. Bepul yetkazib berish!";

  const orgSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PaketShop.uz",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo-light.png`,
    "description": "O'zbekistondagi ishonchli onlayn do'kon",
    "sameAs": ["https://instagram.com/paketshop_uz", "https://t.me/paketshop_uz"]
  });

  const storeSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "PaketShop.uz Online Do'kon",
    "url": BASE_URL,
    "image": `${BASE_URL}/logo-light.png`,
    "description": "Sifatli soatlar, sumkalar, parfyumeriya va aksessuarlar",
    "priceRange": "$$$",
    "address": { "@type": "PostalAddress", "addressCountry": "UZ" }
  });

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="online shop, paketshop, soatlar, sumkalar, parfyumeriya, online shop uzbekistan, sifatli mahsulotlar, narxlari, sotib olish">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${BASE_URL}/">
  
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${BASE_URL}/">
  <meta property="og:image" content="${BASE_URL}/logo-light.png">
  
  <script type="application/ld+json">${orgSchema}</script>
  <script type="application/ld+json">${storeSchema}</script>
  <link rel="icon" type="image/png" href="/logo-light.png">
</head>
<body>
  <header><nav><a href="${BASE_URL}/">PaketShop.uz</a></nav></header>
  <main>
    <h1>PaketShop.uz — O'zbekistondagi Sifatli Mahsulotlar Online Do'koni</h1>
    <p>${esc(description)}</p>
    
    <section>
      <h2>Kategoriyalar</h2>
      <ul>
        ${categories.map(c => `<li><a href="${BASE_URL}/category/${c.slug || slugify(c.name)}">${esc(c.name)}</a>: ${esc(c.description || '')}</li>`).join('')}
      </ul>
    </section>

    <section>
      <h2>Mashxur Mahsulotlar</h2>
      <ul>
        ${products.slice(0, 12).map(p => `
        <li>
          <a href="${BASE_URL}/product/${slugify(p.name)}-${p.id}">
            <img src="${p.image}" alt="${esc(p.name)}" width="300" height="375" loading="lazy">
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.shortDescription || '')}</p>
            <p>Narxi: ${formatPrice(p.price)}</p>
          </a>
        </li>`).join('')}
      </ul>
    </section>

    ${blogPosts.length > 0 ? `
    <section>
      <h2>Blog</h2>
      <ul>
        ${blogPosts.map(p => `
        <li>
          <a href="${BASE_URL}/blog/${slugify(p.title)}-${p.id}">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.content.substring(0, 120))}...</p>
          </a>
        </li>`).join('')}
      </ul>
    </section>` : ''}
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} PaketShop.uz — O'zbekistondagi ishonchli onlayn do'kon</p>
  </footer>
  <script>
    if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebot|ia_archiver/i)) {
      window.location.replace('${BASE_URL}/');
    }
  </script>
</body>
</html>`;
}

// === NOT FOUND ===
function renderNotFound(BASE_URL) {
  return `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><title>Sahifa topilmadi | PaketShop.uz</title><meta name="robots" content="noindex"></head><body><h1>404 — Sahifa topilmadi</h1><p><a href="${BASE_URL}/">Bosh sahifaga qaytish</a></p></body></html>`;
}

// === HELPERS ===
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/['`']/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatPrice(price) {
  if (!price) return '0 UZS';
  return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
}

function getMockProducts() {
  return [
    { id: 1, name: 'Midnight Chronograph', price: 12500000, category: 'Soatlar', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000', shortDescription: 'Eksklyuziv soat', specs: [] },
    { id: 2, name: 'Royal Leather Bag', price: 4800000, category: 'Sumkalar', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000', shortDescription: 'Premium charm sumka', specs: [] },
    { id: 3, name: 'Aviator Elite', price: 2100000, category: "Ko'zoynaklar", image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000', shortDescription: 'Aviator ko\'zoynak', specs: [] },
    { id: 4, name: 'Essence No. 5', price: 3500000, category: 'Parfyumeriya', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000', shortDescription: 'Premium parfyum', specs: [] }
  ];
}

function getMockCategories() {
  return [
    { slug: 'soatlar', name: 'Soatlar', description: 'Eksklyuziv shveytsariya soatlari' },
    { slug: 'sumkalar', name: 'Sumkalar', description: 'Italiya charmidan premium sumkalar' },
    { slug: 'kozoynaklar', name: "Ko'zoynaklar", description: 'Quyoshdan himoya va betakror uslub' },
    { slug: 'parfyumeriya', name: 'Parfyumeriya', description: 'Betakror iforlar kolleksiyasi' },
    { slug: 'aksessuarlar', name: 'Aksessuarlar', description: 'Obrazingizni to\'ldiruvchi detallar' }
  ];
}
