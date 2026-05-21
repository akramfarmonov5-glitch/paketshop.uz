import fetch from 'node-fetch';

const apiKey = "AIzaSyBArTzFJLPySBiLljkvd_ptFlo_tKNJAsI";

async function testGeminiModels() {
  console.log("Foydalanuvchi so'ragan Gemini 3.x/2.x Flash Lite modellari tekshirilmoqda...");
  
  const models = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-preview-0205",
    "gemini-3.0-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite-preview"
  ];
  
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Write a 1 sentence welcome message for PaketShop.uz website in Uzbek." }]
          }]
        })
      });
      
      const data = await response.json();
      console.log(`Model: ${model} | Status:`, response.status);
      if (response.status === 200) {
        console.log(`-> MUVAFFAQIYATLI! (${model}) | Natija:`, data.candidates[0].content.parts[0].text);
        return;
      } else {
        console.log(`-> Rad etildi:`, data.error ? data.error.message : data);
      }
    } catch (err) {
      console.error(`Xatolik (${model}):`, err);
    }
  }
}

testGeminiModels();
