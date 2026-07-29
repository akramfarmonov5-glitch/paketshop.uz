import { NextResponse } from 'next/server';
import { legacyIdFromSku } from '@/lib/domain/catalogMapping';
import { db } from '@/lib/server/db';
import { SITE_URL } from '@/lib/site';

const BASE_URL = SITE_URL;

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
  try {
    const products = await db.product.findMany({
      where: {
        status: 'ACTIVE',
        publicPrice: { gt: 0 },
        priceMode: { in: ['PUBLIC_EXACT', 'FROM_PRICE'] },
        media: { some: {} },
      },
      select: {
        sku: true,
        legacySku: true,
        slugUz: true,
        publicPrice: true,
        availabilityStatus: true,
        translations: {
          where: { locale: 'uz' },
          select: { name: true, shortDescription: true, description: true },
          take: 1,
        },
        media: {
          select: { media: { select: { url: true } } },
          orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }],
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    });

    const xmlItems = products.map((product) => {
      const translation = product.translations[0];
      const name = translation?.name || product.sku;
      const description =
        translation?.shortDescription
        || translation?.description
        || name;
      const legacyId = legacyIdFromSku(product.legacySku);
      const slug = legacyId ? `${product.slugUz}-${legacyId}` : product.slugUz;
      const inStock = ['IN_STOCK', 'LOW_STOCK'].includes(product.availabilityStatus);
      const googleCategory = 'Home & Garden > Household Supplies';

      return `
    <item>
      <g:id>${escapeXml(product.sku)}</g:id>
      <g:title>${cdata(name)}</g:title>
      <g:description>${cdata(description)}</g:description>
      <g:link>${BASE_URL}/uz/product/${escapeXml(slug)}</g:link>
      <g:image_link>${escapeXml(product.media[0].media.url)}</g:image_link>
      <g:brand>PaketShop</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${Number(product.publicPrice)} UZS</g:price>
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
  } catch (error) {
    console.error('Catalog Feed Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    );
  }
}
