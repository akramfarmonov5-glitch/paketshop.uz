import fetch from 'node-fetch';

async function testSlugUrl() {
  // Kutib turamiz - server ishga tushishi uchun
  await new Promise(r => setTimeout(r, 3000));
  
  const urls = [
    'http://localhost:3000/uz/blog/restoran-va-kafelar-uchun-qadoqlash-sirlari-3',
    'http://localhost:3000/uz/blog/1',  // Eski format — 404 bo'lishi kerak (chunki slug emas)
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      console.log(`URL: ${url}`);
      console.log(`  Status: ${res.status}`);
      console.log(`  Title: ${titleMatch ? titleMatch[1] : 'N/A'}`);
      console.log('---');
    } catch (err) {
      console.log(`URL: ${url}`);
      console.log(`  Error: ${err.message}`);
      console.log('---');
    }
  }
}

testSlugUrl();
