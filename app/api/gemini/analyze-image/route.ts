import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY muhit o'zgaruvchisi topilmadi." },
      { status: 500 }
    );
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl manzili talab qilinadi." },
        { status: 400 }
      );
    }

    console.log(`[AI Image Analyzer] Rasm tahlil qilinmoqda: ${imageUrl}`);

    // 1. Rasmni havola orqali yuklab olib, buffer va base64 formatiga o'tkazish
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Rasm yuklab olishda xatolik: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    // 2. GoogleGenAI yordamida Gemini multimodal so'rovini yuborish
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze the packaging or household product shown in this image.
Identify its physical attributes (such as color, material, shape, potential usage, and dimensions if visually apparent).

Generate a complete SEO metadata package and suggested product catalog details based on this image in three languages: Uzbek (uz), Russian (ru), and English (en).

For each language, provide:
1. Suggested catchy commercial title (name).
2. A SEO-friendly kebab-case image alt description (alt): it must be lowercase, use English letters only, separate words with hyphens (e.g. "jigarrang-dastakli-kraft-qogoz-paket" or "kruglyy-plastikovyy-konteyner-dlya-salata").
3. A list of 4-5 relevant SEO search keywords (keywords).
4. A professional, sales-friendly short description (description) summarizing the product benefits in max 2 sentences.
5. An array of 4 suggested technical specifications (specs) with labels and values (e.g., Material: Kraft paper, Shape: Round, etc.) translated properly for each language.

You MUST return ONLY a valid JSON object matching the following TypeScript schema with NO additional markdown wrapping, explanations, or backticks:

{
  "name": {
    "uz": "O'zbekcha mahsulot nomi",
    "ru": "Русское название товара",
    "en": "English product name"
  },
  "alt": {
    "uz": "ozbekcha-rasm-tavsifi-alt",
    "ru": "russkoe-opisanie-kartinki-alt",
    "en": "english-image-alt-text"
  },
  "keywords": {
    "uz": ["kalit", "soz", "lar"],
    "ru": ["ключевые", "слова"],
    "en": ["keywords", "list"]
  },
  "description": {
    "uz": "O'zbekcha qisqa tavsif. 2 ta gapdan oshmasin.",
    "ru": "Русское короткое описание. Не более 2 предложений.",
    "en": "English short description. Maximum 2 sentences."
  },
  "specs": [
    {
      "label": {
        "uz": "Material",
        "ru": "Материал",
        "en": "Material"
      },
      "value": {
        "uz": "Tola / Qog'oz",
        "ru": "Бумага",
        "en": "Paper"
      }
    }
  ]
}`;

    const geminiResponse = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const textResult = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) {
      throw new Error("Gemini tahlil natijasini qaytarmadi.");
    }

    const parsedData = JSON.parse(textResult.trim());
    console.log("[AI Image Analyzer] Rasm tahlili yakunlandi va JSON qabul qilindi.");

    return NextResponse.json({ success: true, analysis: parsedData });

  } catch (error: any) {
    console.error("[AI Image Analyzer] Catch Error:", error);
    return NextResponse.json(
      { error: "Rasm tahlil qilishda xatolik yuz berdi", details: error.message },
      { status: 500 }
    );
  }
}
