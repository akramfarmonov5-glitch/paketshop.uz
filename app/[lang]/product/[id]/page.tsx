import { supabase } from '../../../../lib/supabaseClient';
import ProductClient from './ProductClient';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { getCategoryDisplayName } from '../../../../lib/categoryUtils';

export async function generateMetadata({ params }: { params: Promise<{ id: string, lang: string }> }) {
  try {
    const { id, lang } = await params;
    
    // Support both direct ID (e.g. "2") and slug with ID (e.g. "product-name-2")
    let productId = id;
    if (isNaN(Number(id)) && id.includes('-')) {
      const parts = id.split('-');
      productId = parts[parts.length - 1];
    }

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product) return { title: 'Mahsulot topilmadi' };

    const activeLang = lang || 'uz';
    const productName = getLocalizedText(product.name, activeLang);
    const productDesc = getLocalizedText(product.description, activeLang)?.substring(0, 160) || '';

    
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

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductClient id={id} />;
}
