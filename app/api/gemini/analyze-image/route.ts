import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimit = checkRateLimit(`gemini-image:${ip}`, 5, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Siz juda ko'p so'rov yubordingiz. Iltimos, birozdan keyin qayta urining." },
      { status: 429 }
    );
  }

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

    // SSRF Domain Protection
    try {
      const parsedUrl = new URL(imageUrl);
      const hostname = parsedUrl.hostname;
      const isValidDomain = hostname === 'cloudinary.com' || hostname.endsWith('.cloudinary.com');
      
      if (!isValidDomain) {
        return NextResponse.json(
          { error: "Rasm manzili faqat Cloudinary platformasidan bo'lishi kerak." },
          { status: 400 }
        );
      }
    } catch (urlError) {
      return NextResponse.json(
        { error: "Rasm manzili (URL) noto'g'ri." },
        { status: 400 }
      );
    }

    console.log(`[AI Image Analyzer] Rasm tahlil qilinmoqda: ${imageUrl}`);

    // 1. Rasmni havola orqali yuklab olib, buffer va base64 formatiga o'tkazish
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Rasm yuklab olishda xatolik: ${response.status} ${response.statusText}`);
    }

    // Check content-type header
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: "Faqat rasm fayllari qabul qilinadi." },
        { status: 400 }
      );
    }

    // Check content-length header
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Rasm hajmi juda katta. Maksimal hajm 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Rasm hajmi juda katta. Maksimal hajm 10MB." },
        { status: 400 }
      );
    }

    const base64Image = Buffer.from(arrayBuffer).toString('base64');

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
