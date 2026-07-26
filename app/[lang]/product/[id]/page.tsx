import { supabase } from '../../../../lib/supabaseClient';
import ProductClient from './ProductClient';
import B2BProductView from './B2BProductView';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { MOCK_PRODUCTS } from '../../../../constants';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';
import { catalogCardUrlSlug, getPrismaProductDetail } from '../../../../lib/server/prismaCatalog';
import { findActiveRedirect } from '../../../../lib/server/redirects';
import { productSlug } from '../../../../lib/slugify';
import { SITE_NAME, SITE_URL } from '../../../../lib/site';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

async function resolvePrismaDetail(id: string, lang: string) {
  const locale = lang === 'ru' ? 'ru' as const : 'uz' as const;
  try {
    return await getPrismaProductDetail(id, locale);
  } catch (error) {
    console.error('Prisma product lookup failed, falling back to legacy source:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string, lang: string }> }) {
  try {
    const { id, lang } = await params;

    const detail = await resolvePrismaDetail(id, lang);
    if (detail) {
      const locale = detail.locale;
      const title = `${detail.name} | PaketShop.uz`;
      const description = (detail.shortDescription || detail.description || detail.name).slice(0, 160);
      return {
        title,
        description,
        alternates: {
          canonical: `/${locale}/product/${catalogCardUrlSlug(detail.card, locale)}`,
          languages: {
            uz: `/uz/product/${catalogCardUrlSlug(detail.card, 'uz')}`,
            ru: `/ru/product/${catalogCardUrlSlug(detail.card, 'ru')}`,
            'x-default': `/uz/product/${catalogCardUrlSlug(detail.card, 'uz')}`,
          },
        },
        openGraph: {
          title,
          description,
          images: detail.images[0] ? [{ url: detail.images[0] }] : [],
          type: 'website',
        },
      };
    }

    // Support both direct ID (e.g. "2") and slug with ID (e.g. "product-name-2")
    let productId = id;
    if (isNaN(Number(id)) && id.includes('-')) {
      const parts = id.split('-');
      productId = parts[parts.length - 1];
    }

    let { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (!product) {
      product = MOCK_PRODUCTS.find(p => p.id === Number(productId)) as any || null;
    }

    if (!product) {
      return {
        title: 'Mahsulot topilmadi',
        robots: { index: false, follow: false },
      };
    }

    const activeLang = lang || 'uz';
    const productName = getLocalizedText(product.name, activeLang);
    const productDesc = getLocalizedText(product.description || product.shortDescription, activeLang)?.substring(0, 160) || '';

    
    // Kategoriyani ham olish kerak agar nomi kerak bo'lsa, lekin hozircha oddiy qilamiz
    const title = `${productName} | PaketShop.uz`;

    return {
      title: title,
      description: productDesc,
      alternates: {
        canonical: `/${activeLang}/product/${productSlug(product, activeLang)}`,
        languages: {
          uz: `/uz/product/${productSlug(product, 'uz')}`,
          ru: `/ru/product/${productSlug(product, 'ru')}`,
          'x-default': `/uz/product/${productSlug(product, 'uz')}`,
        },
      },
      openGraph: {
        title: title,
        description: productDesc,
        url: `${SITE_URL}/${activeLang}/product/${productSlug(product, activeLang)}`,
        images: product.image ? [{ url: product.image }] : [],
        type: 'website'
      }
    };
  } catch {
    return {
      title: 'Mahsulot | PaketShop.uz',
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string, lang: string }> }) {
  const { id, lang } = await params;

  const detail = await resolvePrismaDetail(id, lang);
  if (detail) {
    const canonicalSlug = catalogCardUrlSlug(detail.card, detail.locale);
    if (id !== canonicalSlug) {
      permanentRedirect(`/${detail.locale}/product/${canonicalSlug}`);
    }

    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: detail.name,
      image: detail.images,
      description: detail.shortDescription || detail.name,
      sku: detail.card.sku,
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/${detail.locale}/product/${canonicalSlug}`,
        priceCurrency: 'UZS',
        price: String(detail.packPrice || 0),
        itemCondition: 'https://schema.org/NewCondition',
        availability: ['IN_STOCK', 'LOW_STOCK'].includes(detail.card.availabilityStatus)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    };
    const breadcrumbMarkup = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: detail.locale === 'ru' ? 'Главная' : 'Bosh sahifa',
          item: `${SITE_URL}/${detail.locale}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: detail.locale === 'ru' ? 'Каталог' : 'Katalog',
          item: `${SITE_URL}/${detail.locale}/catalog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: detail.categoryName,
          item: `${SITE_URL}/${detail.locale}/category/${detail.categoryUrlSlug}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: detail.name,
          item: `${SITE_URL}/${detail.locale}/product/${canonicalSlug}`,
        },
      ],
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }} />
        <B2BProductView detail={detail} />
      </>
    );
  }

  let productId = id;
  if (isNaN(Number(id)) && id.includes('-')) {
    const parts = id.split('-');
    productId = parts[parts.length - 1];
  }

  // Pre-fetch all products and categories using unified server data fetcher
  const { products, categories } = await fetchGlobalData();
  const product = products.find(p => p.id === Number(productId)) || null;

  const activeLang = lang || 'uz';

  // Mahsulot topilmasa, admin boshqaradigan redirect jadvalini tekshiramiz (spec §27).
  if (!product) {
    const resolved = await findActiveRedirect(`/${activeLang}/product/${decodeURIComponent(id)}`).catch(() => null);
    if (resolved && resolved.statusCode !== 410) {
      if (resolved.statusCode === 302) redirect(resolved.target);
      permanentRedirect(resolved.target);
    }
    notFound();
  }
  const canonicalSlug = productSlug(product, activeLang);
  if (id !== canonicalSlug) {
    permanentRedirect(`/${activeLang}/product/${canonicalSlug}`);
  }

  const schemaMarkup = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": getLocalizedText(product.name, activeLang),
    "image": product.image ? [product.image] : [],
    "description": getLocalizedText(product.shortDescription || product.name, activeLang),
    "sku": String(product.id),
    "mpn": String(product.id),
    "brand": {
      "@type": "Brand",
      "name": "PaketShop.uz"
    },
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/${activeLang}/product/${canonicalSlug}`,
      "priceCurrency": "UZS",
      "price": String(product.price || 0),
      "priceValidUntil": "2030-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock !== undefined && product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": SITE_NAME
      }
    }
  } : null;

  return (
    <>
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}
      <ProductClient id={id} initialProducts={products} initialCategories={categories} />
    </>
  );
}
