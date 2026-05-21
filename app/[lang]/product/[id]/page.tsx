import { supabase } from '../../../../lib/supabaseClient';
import ProductClient from './ProductClient';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { getCategoryDisplayName } from '../../../../lib/categoryUtils';
import { MOCK_PRODUCTS } from '../../../../constants';

export async function generateMetadata({ params }: { params: Promise<{ id: string, lang: string }> }) {
  try {
    const { id, lang } = await params;
    
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

  let productId = id;
  if (isNaN(Number(id)) && id.includes('-')) {
    const parts = id.split('-');
    productId = parts[parts.length - 1];
  }

  let product = null;
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();
    product = data;
  } catch (error) {
    console.error("Schema fetch failed:", error);
  }

  if (!product) {
    product = MOCK_PRODUCTS.find(p => p.id === Number(productId)) as any || null;
  }

  const activeLang = lang || 'uz';
  const schemaMarkup = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": getLocalizedText(product.name, activeLang),
    "image": product.image ? [product.image] : [],
    "description": getLocalizedText(product.description || product.shortDescription || product.name, activeLang),
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
      <ProductClient id={id} />
    </>
  );
}
