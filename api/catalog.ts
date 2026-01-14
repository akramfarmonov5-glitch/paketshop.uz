import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_KEY;
  const BASE_URL = 'https://paketshop.uz';

  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch products from Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    if (!products || products.length === 0) {
      console.warn('No products found in database');
    }

    // 2. Generate XML
    const xmlItems = (products || []).map((product) => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.shortDescription || product.name}]]></g:description>
      <g:link>${BASE_URL}?product_id=${product.id}</g:link>
      <g:image_link>${product.image}</g:image_link>
      <g:brand>PaketShop</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${(product.stock && product.stock > 0) ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${product.price} UZS</g:price>
      <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
    </item>
    `).join('');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>PaketShop Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Sifatli mahsulotlar PaketShop.uz dan</description>
    ${xmlItems}
  </channel>
</rss>`;

    // 3. Send Response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xmlFeed);

  } catch (err) {
    console.error('Catalog Feed Error:', err);
    res.status(500).json({
      error: 'Failed to generate feed',
      details: err instanceof Error ? err.message : 'Unknown error',
      env: {
        url: !!supabaseUrl,
        key: !!supabaseKey
      }
    });
  }
}