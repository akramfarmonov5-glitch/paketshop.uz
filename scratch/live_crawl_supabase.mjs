import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const baseUrl = 'https://www.paketshop.uz';
const languages = ['uz', 'ru', 'en'];

// Deep localized helper to handle stringified or native JSON columns
function getLocalizedText(obj, lang) {
  if (!obj) return '';
  let parsed = obj;
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        return obj;
      }
    } else {
      return obj;
    }
  }
  if (typeof parsed === 'object') {
    return parsed[lang] || parsed['uz'] || parsed['en'] || parsed['ru'] || '';
  }
  return String(parsed);
}

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['`']/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productSlug(product, lang = 'uz') {
  const localizedSlug = getLocalizedText(product.slug, lang);
  const localizedName = getLocalizedText(product.name, lang);
  return `${slugify(localizedSlug) || slugify(localizedName)}-${product.id}`;
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

async function run() {
  console.log('--- INITIALIZING LIVE DATABASE CRAWLER ---');
  let env;
  try {
    env = loadEnv();
  } catch (err) {
    console.error(`Failed to load env: ${err.message}`);
    return;
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client connected.');

  // Fetch products
  console.log('Fetching products from database...');
  const { data: products, error: prodErr } = await supabase.from('products').select('*');
  if (prodErr) {
    console.error(`Error fetching products: ${prodErr.message}`);
    return;
  }
  console.log(`Found ${products.length} products in DB.`);

  // Fetch blogs
  console.log('Fetching blog posts from database...');
  const { data: blogs, error: blogErr } = await supabase.from('blog_posts').select('*');
  if (blogErr) {
    console.warn(`Could not fetch blog posts: ${blogErr.message}`);
  }
  const blogList = blogs || [];
  console.log(`Found ${blogList.length} blog posts in DB.`);

  // Fetch categories
  console.log('Fetching categories from database...');
  const { data: categories, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) {
    console.warn(`Could not fetch categories: ${catErr.message}`);
  }
  const categoryList = categories || [];
  console.log(`Found ${categoryList.length} categories in DB.`);

  const urlsToVerify = [];

  // Generate product URLs
  for (const product of products) {
    for (const lang of languages) {
      const slugPart = productSlug(product, lang);
      const url = `${baseUrl}/${lang}/product/${slugPart}`;
      urlsToVerify.push({ type: 'product', lang, name: getLocalizedText(product.name, lang), url });
    }
  }

  // Generate blog post URLs
  for (const blog of blogList) {
    for (const lang of languages) {
      const url = `${baseUrl}/${lang}/blog/${blog.id}`;
      urlsToVerify.push({ type: 'blog', lang, name: getLocalizedText(blog.title, lang), url });
    }
  }

  // Generate category URLs
  for (const category of categoryList) {
    for (const lang of languages) {
      const categorySlug = getLocalizedText(category.slug, lang) || slugify(getLocalizedText(category.name, 'en'));
      const url = `${baseUrl}/${lang}/category/${categorySlug}`;
      urlsToVerify.push({ type: 'category', lang, name: getLocalizedText(category.name, lang), url });
    }
  }

  console.log(`\nPrepared ${urlsToVerify.length} dynamically generated live URLs to verify.`);

  const results = [];
  for (const item of urlsToVerify) {
    console.log(`Testing [${item.type}] (${item.lang}): ${item.url}`);
    try {
      const response = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      results.push({
        type: item.type,
        lang: item.lang,
        name: item.name,
        url: item.url,
        status: response.status
      });
    } catch (e) {
      results.push({
        type: item.type,
        lang: item.lang,
        name: item.name,
        url: item.url,
        status: 'ERROR',
        error: e.message
      });
    }
  }

  console.log('\n--- DYNAMIC URL VERIFICATION RESULTS ---');
  console.table(results.map(r => ({ type: r.type, lang: r.lang, name: r.name.slice(0, 30), status: r.status, url: r.url })));

  const broken = results.filter(r => r.status !== 200);
  if (broken.length > 0) {
    console.log(`\n❌ Found ${broken.length} broken database-driven page URLs!`);
    console.table(broken);
  } else {
    console.log('\n✅ Absolutely AMAZING! All dynamic products, blogs, and categories are live and returning HTTP 200!');
  }
}

run();
