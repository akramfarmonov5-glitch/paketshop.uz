import { supabase } from '../../../../lib/supabaseClient';
import ProductClient from './ProductClient';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { getCategoryDisplayName } from '../../../../lib/categoryUtils';

export async function generateMetadata({ params }: { params: { id: string, lang: string } }) {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!product) return { title: 'Mahsulot topilmadi' };

    const lang = params.lang || 'uz';
    const productName = getLocalizedText(product.name, lang);
    const productDesc = getLocalizedText(product.description, lang)?.substring(0, 160) || '';
    
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

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductClient id={params.id} />;
}
