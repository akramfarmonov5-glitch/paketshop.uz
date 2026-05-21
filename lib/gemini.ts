import fetch from 'node-fetch';

export interface LocalizedString {
  uz: string;
  ru: string;
  en: string;
}

export interface SEOPostResult {
  title: LocalizedString;
  content: LocalizedString;
  description: LocalizedString;
  slug: LocalizedString;
  category: string;
  tags: string[];
}

/**
 * Server-side Gemini API yordamchisi.
 * Google Gemini 3.1 Flash Lite modelidan foydalanib ko'p tilli SEO blog postlarini generatsiya qiladi.
 */
export async function generateSEOPost(topic: string): Promise<SEOPostResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY muhit o'zgaruvchisi topilmadi.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Write a comprehensive, professional, and highly engaging SEO-friendly blog post about "${topic}".
You MUST generate the post in three languages: Uzbek (uz), Russian (ru), and English (en).
The target audience in Uzbekistan includes business owners (restaurateurs, cafe owners, store owners) as well as household retail customers looking for high-quality packaging and household products.

For each language, provide:
1. title: A catchy, SEO-optimized title in that language.
2. content: The main blog content written in rich Markdown (using headings like ##, ###, bullet points, numbered lists, and bold text). The content must be highly detailed and at least 500-700 words long per language. It should provide practical advice, guides, and tips.
3. description: A short, compelling meta description for search engines (150-160 characters).
4. slug: A URL-friendly slug based on the title for that language (lowercase, English letters only, separate words with hyphens). For Uzbek, transliterate special characters properly (e.g. 'o' -> 'o', 'g'' -> 'g', "o'zbekcha-qadoqlash" -> "ozbekcha-qadoqlash").

General fields:
- category: A single string categorized as one of: 'qadoqlash', 'biznes', 'ekologiya', 'uy-ruzgor'.
- tags: An array of 4-5 relevant general tags in Uzbek (e.g. ["kraft paket", "qadoqlash", "ekologiya"]).

You MUST return ONLY a valid JSON object matching the following TypeScript schema, with no additional markdown wrapping or explanations (do not wrap in \`\`\`json block, just return raw JSON string):

{
  "title": {
    "uz": "Uzbek title",
    "ru": "Russian title",
    "en": "English title"
  },
  "content": {
    "uz": "Detailed Markdown content in Uzbek...",
    "ru": "Detailed Markdown content in Russian...",
    "en": "Detailed Markdown content in English..."
  },
  "description": {
    "uz": "Uzbek description",
    "ru": "Russian description",
    "en": "English description"
  },
  "slug": {
    "uz": "uzbek-slug",
    "ru": "russian-slug",
    "en": "english-slug"
  },
  "category": "qadoqlash",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Request failed with status ${response.status}: ${errorText}`);
  }

  const responseData = (await response.json()) as any;
  
  try {
    const textResult = responseData.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(textResult.trim()) as SEOPostResult;
    return parsedData;
  } catch (err) {
    console.error("Gemini JSON parsing error. Raw response text:", responseData);
    throw new Error(`Gemini dan qaytgan javobni JSON formatida o'qib bo'lmadi: ${err.message}`);
  }
}
