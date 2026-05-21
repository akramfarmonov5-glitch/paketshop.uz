import fetch from 'node-fetch'; // Next.js next dev creates a global fetch, but we can also use native fetch since we are in Node 18+
import * as cheerio from 'cheerio';

async function testWebsite() {
  console.log("=========================================");
  console.log("PaketShop.uz Jonli Sahifalarni Tekshirish");
  console.log("=========================================\n");

  try {
    // 1. Asosiy sahifani tekshirish
    console.log("1. Asosiy sahifaga kirish: http://localhost:3000/uz ...");
    const homeRes = await fetch('http://localhost:3000/uz');
    console.log(`Status: ${homeRes.status} ${homeRes.statusText}`);
    const homeHtml = await homeRes.text();
    const $home = cheerio.load(homeHtml);
    const homeTitle = $home('title').text();
    console.log(`Uy sahifasi sarlavhasi (SEO Title): "${homeTitle}"\n`);

    // 2. Mahsulot sahifasini va Schema.org LD+JSON ma'lumotlarini tekshirish
    console.log("2. Mahsulot sahifasiga kirish: http://localhost:3000/uz/product/1 ...");
    const prodRes = await fetch('http://localhost:3000/uz/product/1');
    console.log(`Status: ${prodRes.status} ${prodRes.statusText}`);
    const prodHtml = await prodRes.text();
    const $prod = cheerio.load(prodHtml);
    const prodTitle = $prod('title').text();
    const prodDesc = $prod('meta[name="description"]').attr('content');
    console.log(`Mahsulot sahifasi sarlavhasi (SEO Title): "${prodTitle}"`);
    console.log(`Mahsulot sahifasi tavsifi (SEO Description): "${prodDesc}"`);

    // Barcha Schema.org LD+JSON bloklarini qidirish
    const schemas = [];
    $prod('script[type="application/ld+json"]').each((i, el) => {
      const htmlContent = $prod(el).html();
      if (htmlContent) {
        try {
          schemas.push(JSON.parse(htmlContent));
        } catch (e) {
          console.error("JSON parsing error for schema:", e.message);
        }
      }
    });

    if (schemas.length > 0) {
      console.log(`\n[MUVAFFAQIYAT] Sahifada ${schemas.length} ta Schema.org LD+JSON microdata topildi:`);
      schemas.forEach((schema, idx) => {
        console.log(`\n--- Schema #${idx + 1} (${schema['@type'] || 'Noma\'lum'}) ---`);
        console.log(JSON.stringify(schema, null, 2));
      });
    } else {
      console.log("\n[XATOLIK] Schema.org LD+JSON microdata topilmadi!");
    }

    console.log("\n=========================================");
    console.log("Tekshiruv muvaffaqiyatli yakunlandi!");
    console.log("=========================================");
  } catch (err) {
    console.error("\n[XATOLIK] Saytga kirishda xato yuz berdi:", err.message);
    console.log("Iltimos dev server to'liq ishga tushganiga ishonch hosil qiling.");
  }
}

testWebsite();
