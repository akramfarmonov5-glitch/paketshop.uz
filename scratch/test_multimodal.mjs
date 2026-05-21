import fetch from 'node-fetch';

async function testMultimodal() {
  console.log("Multimodal Rasm Tahlili API testi boshlanmoqda...");
  const imageUrl = "https://res.cloudinary.com/daazevmhg/image/upload/q_auto,f_auto,w_1200/v1777175783/paketshop/acsjf72e10p970o7taqf.png";

  try {
    const response = await fetch("http://localhost:3000/api/gemini/analyze-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ imageUrl })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Javob:", JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log("✅ Rasm tahlili testi muvaffaqiyatli yakunlandi!");
    } else {
      console.log("❌ Rasm tahlili testi xato bilan tugadi.");
    }
  } catch (err) {
    console.error("Test xatosi:", err);
  }
}

testMultimodal();
