const baseUrl = 'https://www.paketshop.uz';
const languages = ['uz', 'ru', 'en'];
const subPaths = [
  '',
  '/blog',
  '/checkout',
  '/profile',
  '/tracking',
  '/wishlist',
  '/admin'
];

const results = [];

async function verifyUrl(url) {
  console.log(`Checking live page: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const status = response.status;
    results.push({ url, status });
  } catch (error) {
    console.error(`Error checking ${url}: ${error.message}`);
    results.push({ url, status: 'ERROR', error: error.message });
  }
}

async function run() {
  console.log('--- STARTING LIVE PACKETSHOP.UZ ROUTE VERIFICATION ---');
  
  for (const lang of languages) {
    for (const subPath of subPaths) {
      const fullUrl = `${baseUrl}/${lang}${subPath}`;
      await verifyUrl(fullUrl);
    }
  }

  console.log('\n--- VERIFICATION RESULTS ---');
  console.table(results);

  const brokenLinks = results.filter(r => r.status !== 200 && r.status !== 302 && r.status !== 307);
  if (brokenLinks.length > 0) {
    console.log(`\n❌ Found ${brokenLinks.length} non-200 pages!`);
    console.table(brokenLinks);
  } else {
    console.log('\n✅ All primary localized routes are deployed and responding perfectly (HTTP 200/Redirect)!');
  }
}

run();
