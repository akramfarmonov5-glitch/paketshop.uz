import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://paketshop.uz';
const LANGUAGES = ['uz', 'ru', 'en'] as const;
const LOCALES = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;
  const { path } = req.query;
  const rawSegments = Array.isArray(path) ? path : (path ? path.split('/') : []);
  const lang = LANGUAGES.includes(rawSegments[0]) ? rawSegments[0] : 'uz';
  const segments = LANGUAGES.includes(rawSegments[0]) ? rawSegments.slice(1) : rawSegments;
  const pageType = segments[0] || 'home';

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

    if (products.length === 0) products = getMockProducts();
    if (categories.length === 0) categories = getMockCategories();

    let html = '';
    if (pageType === 'product' && segments[1]) {
      html = renderProductPage(segments[1], products, categories, lang);
    } else if (pageType === 'blog' && segments[1]) {
      html = renderBlogPage(segments[1], blogPosts, lang);
    } else if (pageType === 'category' && segments[1]) {
      html = renderCategoryPage(segments[1], products, categories, lang);
    } else {
      html = renderHomePage(products, categories, blogPosts, lang);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (err) {
    console.error('Pre-render Error:', err);
    res.redirect(302, localizedPath('/', 'uz'));
  }
}

function renderProductPage(slug, products, categories, lang) {
  const id = parseInt(slug.split('-').pop(), 10);
  const product = products.find(p => Number(p.id) === id);
  if (!product) return renderNotFound(lang);

  const category = findCategoryByValue(product.category, categories);
  const categoryName = category ? getLocalizedText(category.name, lang) : getLocalizedText(product.category, lang);
  const categorySlug = category ? getCategorySlug(category) : slugify(getLocalizedText(product.category, 'uz'));
  const name = getLocalizedText(product.name, lang);
  const descriptionText = getLocalizedText(product.shortDescription || product.description || product.name, lang);
  const canonicalUrl = localizedUrl(`/product/${slug}`, lang);
  const title = `${name} - ${categoryName} | PaketShop.uz`;
  const description = `${name} - ${descriptionText}. ${formatPrice(product.price)}. PaketShop.uz`;

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    image: [product.image, ...(product.images || [])],
    description: descriptionText,
    sku: `PSHOP-${product.id}`,
    brand: { '@type': 'Brand', name: 'PaketShop' },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'UZS',
      price: product.price,
      availability: (product.stock === undefined || product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'PaketShop.uz' },
    },
  };

  const breadcrumbs = [
    { name: homeLabel(lang), url: localizedUrl('/', lang) },
    { name: categoryName, url: localizedUrl(`/category/${categorySlug}`, lang) },
    { name, url: canonicalUrl },
  ];

  const related = products
    .filter(p => getProductCategoryKey(p.category, categories) === categorySlug && Number(p.id) !== Number(product.id))
    .slice(0, 4);

  return renderDocument({
    lang,
    title,
    description,
    canonicalUrl,
    keywords: [name, categoryName, 'PaketShop', 'Uzbekistan'],
    ogType: 'product',
    ogImage: product.image,
    schemas: [productSchema, breadcrumbSchema(breadcrumbs)],
    body: `
      ${breadcrumbHtml(breadcrumbs)}
      <article itemscope itemtype="https://schema.org/Product">
        <h1 itemprop="name">${esc(name)}</h1>
        <img itemprop="image" src="${esc(product.image)}" alt="${esc(name)}" width="600" height="750">
        <p itemprop="description">${esc(descriptionText)}</p>
        <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="priceCurrency" content="UZS">
          <p>${priceLabel(lang)}: <span itemprop="price">${product.price}</span> UZS</p>
        </div>
        ${specTable(product.specs || [], lang)}
      </article>
      ${related.length > 0 ? `<section><h2>${relatedLabel(lang)}</h2><ul>${related.map(p => productListItem(p, lang)).join('')}</ul></section>` : ''}
    `,
  });
}

function renderBlogPage(slug, blogPosts, lang) {
  const id = slug.split('-').pop();
  const post = blogPosts.find(p => String(p.id) === String(id));
  if (!post) return renderNotFound(lang);

  const titleText = getLocalizedText(post.seo?.title || post.title, lang);
  const postTitle = getLocalizedText(post.title, lang);
  const content = getLocalizedText(post.content, lang);
  const description = getLocalizedText(post.seo?.description, lang) || content.substring(0, 160);
  const canonicalUrl = localizedUrl(`/blog/${slug}`, lang);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postTitle,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'PaketShop.uz' },
    publisher: {
      '@type': 'Organization',
      name: 'PaketShop.uz',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo-light.png` },
    },
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  };

  const breadcrumbs = [
    { name: homeLabel(lang), url: localizedUrl('/', lang) },
    { name: 'Blog', url: localizedUrl('/', lang) },
    { name: postTitle, url: canonicalUrl },
  ];

  return renderDocument({
    lang,
    title: `${titleText} | PaketShop.uz Blog`,
    description,
    canonicalUrl,
    keywords: getLocalizedText(post.seo?.keywords, lang) || postTitle,
    ogType: 'article',
    ogImage: post.image,
    schemas: [schema, breadcrumbSchema(breadcrumbs)],
    body: `
      ${breadcrumbHtml(breadcrumbs)}
      <article itemscope itemtype="https://schema.org/BlogPosting">
        <h1 itemprop="headline">${esc(postTitle)}</h1>
        <time itemprop="datePublished" datetime="${esc(post.date || '')}">${esc(post.date || '')}</time>
        <img itemprop="image" src="${esc(post.image)}" alt="${esc(postTitle)}" width="1200" height="675">
        <div itemprop="articleBody">${content.split('\n').map(p => `<p>${esc(p)}</p>`).join('')}</div>
      </article>
    `,
  });
}

function renderCategoryPage(catSlug, products, categories, lang) {
  const category = categories.find(c => getCategorySlug(c) === catSlug || slugify(getLocalizedText(c.name, 'uz')) === catSlug);
  const categoryName = category ? getLocalizedText(category.name, lang) : catSlug;
  const description = category ? getLocalizedText(category.description, lang) : `${categoryName} - PaketShop.uz`;
  const canonicalUrl = localizedUrl(`/category/${catSlug}`, lang);
  const catProducts = products.filter(p => getProductCategoryKey(p.category, categories) === catSlug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryName,
    description,
    url: canonicalUrl,
    numberOfItems: catProducts.length,
    itemListElement: catProducts.map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: localizedUrl(`/product/${slugify(getLocalizedText(p.name, 'uz'))}-${p.id}`, lang),
      name: getLocalizedText(p.name, lang),
    })),
  };

  const breadcrumbs = [
    { name: homeLabel(lang), url: localizedUrl('/', lang) },
    { name: categoryName, url: canonicalUrl },
  ];

  return renderDocument({
    lang,
    title: `${categoryName} | PaketShop.uz`,
    description,
    canonicalUrl,
    keywords: [categoryName, 'PaketShop', 'Uzbekistan'],
    ogType: 'website',
    ogImage: category?.image || `${BASE_URL}/logo-light.png`,
    schemas: [schema, breadcrumbSchema(breadcrumbs)],
    body: `
      ${breadcrumbHtml(breadcrumbs)}
      <h1>${esc(categoryName)}</h1>
      <p>${esc(description)}</p>
      <section>
        <h2>${productsCountLabel(lang, catProducts.length)}</h2>
        <ul>${catProducts.map(p => productListItem(p, lang)).join('')}</ul>
      </section>
    `,
  });
}

function renderHomePage(products, categories, blogPosts, lang) {
  const title = homeTitle(lang);
  const description = homeDescription(lang);
  const canonicalUrl = localizedUrl('/', lang);
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'PaketShop.uz',
      url: BASE_URL,
      logo: `${BASE_URL}/logo-light.png`,
      description,
      sameAs: ['https://instagram.com/paketshop.uz', 'https://t.me/paketshop_uz'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'PaketShop.uz',
      url: BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/${lang}?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return renderDocument({
    lang,
    title,
    description,
    canonicalUrl,
    keywords: ['PaketShop', 'online shop', 'Uzbekistan'],
    ogType: 'website',
    ogImage: `${BASE_URL}/logo-light.png`,
    schemas,
    body: `
      <h1>${esc(title)}</h1>
      <p>${esc(description)}</p>
      <section>
        <h2>${categoriesLabel(lang)}</h2>
        <ul>${categories.map(c => `<li><a href="${localizedUrl(`/category/${getCategorySlug(c)}`, lang)}">${esc(getLocalizedText(c.name, lang))}</a></li>`).join('')}</ul>
      </section>
      <section>
        <h2>${productsLabel(lang)}</h2>
        <ul>${products.slice(0, 12).map(p => productListItem(p, lang)).join('')}</ul>
      </section>
      ${blogPosts.length > 0 ? `<section><h2>Blog</h2><ul>${blogPosts.map(p => `<li><a href="${localizedUrl(`/blog/${slugify(getLocalizedText(p.title, 'uz'))}-${p.id}`, lang)}">${esc(getLocalizedText(p.title, lang))}</a></li>`).join('')}</ul></section>` : ''}
    `,
  });
}

function renderDocument({ lang, title, description, canonicalUrl, keywords, ogType, ogImage, schemas, body }) {
  const basePath = stripLanguagePrefix(new URL(canonicalUrl).pathname);
  const alternates = LANGUAGES.map(altLang =>
    `<link rel="alternate" hreflang="${altLang}" href="${localizedUrl(basePath, altLang)}">`
  ).join('\n  ');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${esc(Array.isArray(keywords) ? keywords.join(', ') : keywords)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonicalUrl}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${localizedUrl(basePath, 'uz')}">
  <meta property="og:type" content="${esc(ogType)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:site_name" content="PaketShop.uz">
  <meta property="og:locale" content="${LOCALES[lang]}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
  ${schemas.map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('\n  ')}
  <link rel="icon" type="image/png" href="/logo-light.png">
</head>
<body>
  <header><nav><a href="${localizedUrl('/', lang)}">PaketShop.uz</a></nav></header>
  <main>${body}</main>
  <footer><p>&copy; ${new Date().getFullYear()} PaketShop.uz</p></footer>
  <script>
    if (!navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebot|ia_archiver/i)) {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</body>
</html>`;
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function breadcrumbHtml(items) {
  return `<nav aria-label="breadcrumb"><ol>${items.map((item, index) =>
    index === items.length - 1
      ? `<li>${esc(item.name)}</li>`
      : `<li><a href="${item.url}">${esc(item.name)}</a></li>`
  ).join('')}</ol></nav>`;
}

function specTable(specs, lang) {
  if (!specs.length) return '';
  return `<table>${specs.map(spec => `<tr><th>${esc(getLocalizedText(spec.label, lang))}</th><td>${esc(getLocalizedText(spec.value, lang))}</td></tr>`).join('')}</table>`;
}

function productListItem(product, lang) {
  const name = getLocalizedText(product.name, lang);
  const description = getLocalizedText(product.shortDescription || product.description || '', lang);
  return `<li>
    <a href="${localizedUrl(`/product/${slugify(getLocalizedText(product.name, 'uz'))}-${product.id}`, lang)}">
      <img src="${esc(product.image)}" alt="${esc(name)}" width="300" height="375" loading="lazy">
      <h3>${esc(name)}</h3>
      <p>${esc(description)}</p>
      <p>${priceLabel(lang)}: ${formatPrice(product.price)}</p>
    </a>
  </li>`;
}

function findCategoryByValue(value, categories) {
  const rawValue = getLocalizedText(value, 'uz');
  return categories.find(category => {
    const names = LANGUAGES.map(lang => getLocalizedText(category.name, lang));
    return rawValue === getCategorySlug(category) || names.includes(rawValue);
  });
}

function getProductCategoryKey(value, categories) {
  const category = findCategoryByValue(value, categories);
  return category ? getCategorySlug(category) : getLocalizedText(value, 'uz');
}

function getCategorySlug(category) {
  return category.slug || slugify(getLocalizedText(category.name, 'uz'));
}

function localizedUrl(path, lang) {
  return `${BASE_URL}${localizedPath(path, lang)}`;
}

function localizedPath(path, lang) {
  const cleanPath = stripLanguagePrefix(path);
  return cleanPath === '/' ? `/${lang}` : `/${lang}${cleanPath}`;
}

function stripLanguagePrefix(path) {
  const segments = path.split('/').filter(Boolean);
  if (LANGUAGES.includes(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
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
  if (typeof text === 'object') return text[lang] || text.uz || '';
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

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatPrice(price) {
  if (!price) return '0 UZS';
  return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
}

function homeLabel(lang) {
  return ({ uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' })[lang];
}

function homeTitle(lang) {
  return ({
    uz: "PaketShop.uz | O'zbekistondagi sifatli mahsulotlar",
    ru: 'PaketShop.uz | Качественные товары в Узбекистане',
    en: 'PaketShop.uz | Quality products in Uzbekistan',
  })[lang];
}

function homeDescription(lang) {
  return ({
    uz: "PaketShop.uz - O'zbekistondagi ishonchli onlayn do'kon. Qadoqlash, oshxona va xo'jalik mahsulotlarini qulay narxlarda buyurtma qiling.",
    ru: 'PaketShop.uz - надежный интернет-магазин в Узбекистане. Заказывайте упаковку, кухонные и хозяйственные товары по удобным ценам.',
    en: 'PaketShop.uz is a reliable online store in Uzbekistan. Order packaging, kitchen and household products at convenient prices.',
  })[lang];
}

function categoriesLabel(lang) {
  return ({ uz: 'Kategoriyalar', ru: 'Категории', en: 'Categories' })[lang];
}

function productsLabel(lang) {
  return ({ uz: 'Mahsulotlar', ru: 'Товары', en: 'Products' })[lang];
}

function priceLabel(lang) {
  return ({ uz: 'Narxi', ru: 'Цена', en: 'Price' })[lang];
}

function relatedLabel(lang) {
  return ({ uz: "O'xshash mahsulotlar", ru: 'Похожие товары', en: 'Related products' })[lang];
}

function productsCountLabel(lang, count) {
  return ({ uz: `${count} ta mahsulot`, ru: `${count} товаров`, en: `${count} products` })[lang];
}

function renderNotFound(lang) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>404 | PaketShop.uz</title><meta name="robots" content="noindex"></head><body><h1>404</h1><p><a href="${localizedUrl('/', lang)}">PaketShop.uz</a></p></body></html>`;
}

function getMockProducts() {
  return [
    {
      id: 1,
      name: { uz: 'Chiqindi uchun qoplar 70x90 sm 20 dona', ru: 'Мешки для мусора 70x90 см 20 шт', en: 'Trash bags 70x90 cm 20 pcs' },
      price: 45000,
      category: 'paketlar',
      image: 'https://res.cloudinary.com/dkc6rlyeo/image/upload/v1776180967/xmpekaing8zqafdzu42k.webp',
      shortDescription: { uz: 'Ulgurji narxlarda sifatli chiqindi qoplari.', ru: 'Качественные мешки для мусора по оптовым ценам.', en: 'Quality trash bags at wholesale prices.' },
      specs: [],
    },
  ];
}

function getMockCategories() {
  return [
    { slug: 'paketlar', name: { uz: 'Paketlar', ru: 'Пакеты', en: 'Bags' }, description: { uz: 'Polietilen va qogoz paketlar', ru: 'Полиэтиленовые и бумажные пакеты', en: 'Polyethylene and paper bags' } },
    { slug: 'idishlar', name: { uz: 'Idishlar va konteynerlar', ru: 'Посуда и контейнеры', en: 'Tableware and containers' } },
    { slug: 'xojalik-mollari', name: { uz: "Xo'jalik mollari", ru: 'Хозяйственные товары', en: 'Household goods' } },
  ];
}
