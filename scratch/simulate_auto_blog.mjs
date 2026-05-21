import fetch from 'node-fetch';

const secret = "paketshop_auto_blog_2026_secret";
const url = `http://localhost:3000/api/cron/generate-posts?secret=${secret}`;

async function testAutoBlog() {
  console.log("------------------------------------------------------------------");
  console.log("PaketShop.uz - AI Auto-Blog (Gemini 3.1 Flash Lite) Test qilinmoqda...");
  console.log("Lokal URL:", url);
  console.log("------------------------------------------------------------------");
  
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log("Status:", response.status);
    console.log(`Bajarilish vaqti: ${duration} soniya`);
    console.log("------------------------------------------------------------------");
    console.log("API Natijasi:", JSON.stringify(data, null, 2));
    console.log("------------------------------------------------------------------");
    
    if (response.status === 200 && data.success) {
      console.log("TEST MUVAFFAQIYATLI O'TDI! Yangi ko'p tilli post bazaga yozildi.");
    } else {
      console.log("TESTDA XATOLIK MAVJUD. Yuqoridagi xabar bilan tanishing.");
    }
  } catch (err) {
    console.error("Ulanish xatosi (Lokal dev-server yoqilganligiga ishonch hosil qiling):", err.message);
  }
}

testAutoBlog();
