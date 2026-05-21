import { NextResponse } from 'next/server';
import { supabase, hasSupabaseCredentials } from '../../../lib/supabaseClient';
import { getLocalizedText } from '../../../lib/i18nUtils';
import { productSlug } from '../../../lib/slugify';

const BASE_URL = 'https://paketshop.uz';

export const revalidate = 3600;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(text: string): string {
  return `<![CDATA[${String(text).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export async function GET() {
  if (!hasSupabaseCredentials) {
    return NextResponse.json(
      { error: 'Supabase credentials missing' },
      { status: 500 }
    );
  }

  try {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) throw error;

    const xmlItems = (products || []).map((product) => {
      const name = getLocalizedText(product.name, 'uz') || 'Mahsulot';
      const description = getLocalizedText(product.shortDescription || product.description || product.name, 'uz') || name;
      const slug = productSlug({ id: product.id, name: product.name, slug: product.slug }, 'uz');
      const inStock = product.stock === undefined || product.stock === null || Number(product.stock) > 0;
      const googleCategory = product.googleProductCategory || 'Home & Garden > Household Supplies';

      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${cdata(name)}</g:title>
      <g:description>${cdata(description)}</g:description>
      <g:link>${BASE_URL}/uz/product/${escapeXml(slug)}</g:link>
      <g:image_link>${escapeXml(product.image || '')}</g:image_link>
      <g:brand>PaketShop</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${Number(product.price || 0)} UZS</g:price>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
    </item>`;
    }).join('');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>PaketShop.uz Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Sifatli qadoqlash va xo'jalik mahsulotlari PaketShop.uz dan</description>${xmlItems}
  </channel>
</rss>`;

    return new NextResponse(xmlFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('Catalog Feed Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    );
  }
}
