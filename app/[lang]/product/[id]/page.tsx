import { supabase } from '../../../../lib/supabaseClient';
import ProductClient from './ProductClient';
import B2BProductView from './B2BProductView';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { getCategoryDisplayName } from '../../../../lib/categoryUtils';
import { MOCK_PRODUCTS } from '../../../../constants';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';
import { catalogCardUrlSlug, getPrismaProductDetail } from '../../../../lib/server/prismaCatalog';
import { findActiveRedirect } from '../../../../lib/server/redirects';
import { permanentRedirect, redirect } from 'next/navigation';

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

    if (!product) return { title: 'Mahsulot topilmadi' };

    const activeLang = lang || 'uz';
    const productName = getLocalizedText(product.name, activeLang);
    const productDesc = getLocalizedText(product.description || product.shortDescription, activeLang)?.substring(0, 160) || '';

    
    // Kategoriyani ham olish kerak agar nomi kerak bo'lsa, lekin hozircha oddiy qilamiz
    const title = `${productName} | PaketShop.uz`;

    return {
      title: title,
      description: productDesc,
      openGraph: {
        title: title,
        description: productDesc,
        images: product.image ? [{ url: product.image }] : [],
        type: 'website'
      }
    };
  } catch (error) {
    return { title: 'Mahsulot | PaketShop.uz' };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string, lang: string }> }) {
  const { id, lang } = await params;

  const detail = await resolvePrismaDetail(id, lang);
  if (detail) {
    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: detail.name,
      image: detail.images,
      description: detail.shortDescription || detail.name,
      sku: detail.card.sku,
      brand: { '@type': 'Brand', name: 'PaketShop.uz' },
      offers: {
        '@type': 'Offer',
        url: `https://paketshop.uz/${detail.locale}/product/${catalogCardUrlSlug(detail.card, detail.locale)}`,
        priceCurrency: 'UZS',
        price: String(detail.packPrice || 0),
        itemCondition: 'https://schema.org/NewCondition',
        availability: ['IN_STOCK', 'LOW_STOCK'].includes(detail.card.availabilityStatus)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
        seller: { '@type': 'Organization', name: 'PaketShop.uz' },
      },
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
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
      "url": `https://paketshop.uz/${activeLang}/product/${id}`,
      "priceCurrency": "UZS",
      "price": String(product.price || 0),
      "priceValidUntil": "2030-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock !== undefined && product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "PaketShop.uz"
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
