import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { generateSEOPost } from '../../../../lib/gemini';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const TOPICS = [
  "Restoran va kafelar uchun eng to'g'ri qadoqlash materiallarini tanlash va brendlash sirlari",
  "Ekologik qog'oz paketlar va ularning plastik xaltalardan atrof-muhit uchun afzalliklari",
  "Uyni ko'chirish va narsalarni tartiblashda buyumlarni xavfsiz qadoqlash maslahatlari",
  "Oziq-ovqatlarni uzoqroq, yangi va toza saqlashda zamonaviy qadoqlash sirlari",
  "Brendlangan kraft paketlar biznesingiz nufuzi va mijozlar ishonchini qanday oshiradi?",
  "Ko'cha taomlari (Street Food) biznesi uchun qulay qog'oz idishlar, stakanlar va qutilar",
  "Plastik idishlardan butunlay ekologik qog'oz idishlarga silliq o'tish bo'yicha qo'llanma",
  "Kuryerlik, kargo va yetkazib berish xizmatlari uchun yuklarni mustahkam qadoqlash"
];

// Kategoriyaga qarab Unsplash rasm pool'lari (next.config.mjs da ruxsat etilgan)
const IMAGE_POOL: Record<string, string[]> = {
  qadoqlash: [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop',
  ],
  biznes: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
  ],
  ekologiya: [
    'https://images.unsplash.com/photo-1547996160-71df45082e0e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1200&auto=format&fit=crop',
  ],
  'uy-ruzgor': [
    'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop',
  ],
};

const FALLBACK_POOL = IMAGE_POOL.qadoqlash;

function pickImage(category: string | undefined): string {
  const pool = (category && IMAGE_POOL[category]) || FALLBACK_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET muhit o\'zgaruvchisi sozlanmagan');
    return NextResponse.json(
      { error: 'Server xato sozlangan' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader ? authHeader.split(' ')[1] : null;

  const provided = bearerToken || secret || '';
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(cronSecret);
  const valid =
    providedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!valid) {
    return NextResponse.json(
      { error: "Ruxsat berilmadi (Noto'g'ri maxfiy kalit)" },
      { status: 401 }
    );
  }

  try {
    // 2. Tasodifiy mavzu tanlash
    const randomIndex = Math.floor(Math.random() * TOPICS.length);
    const selectedTopic = TOPICS[randomIndex];

    // 3. Gemini 3.1 Flash Lite orqali maqolani 3 tilda generatsiya qilish
    console.log(`Gemini orqali yangi post yaratilmoqda. Mavzu: "${selectedTopic}"`);
    const generated = await generateSEOPost(selectedTopic);

    // 4. Generatsiya qilingan kategoriyaga qarab rasm tanlash
    const image = pickImage(generated.category);

    // 5. Bazadagi getLocalizedText funksiyasiga mos kelishi uchun JSON-string formatga o'tkazish
    const titleStr = JSON.stringify(generated.title);
    const contentStr = JSON.stringify(generated.content);
    const slugStr = JSON.stringify(generated.slug);
    const descriptionStr = JSON.stringify(generated.description);
    
    // 6. Bugungi sanani shakllantirish (masalan: 21.05.2026)
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

    // 7. SupabaseAdmin bypass RLS yordamida haqiqiy blog_posts jadvali ustunlariga yozish
    const { data, error } = await supabaseAdmin.from('blog_posts').insert([
      {
        title: titleStr,
        slug: slugStr,
        content: contentStr,
        image: image,
        date: dateStr,
        seo_title: titleStr,
        seo_description: descriptionStr,
        seo_keywords: generated.tags
      }
    ]).select();

    if (error) {
      console.error("Supabase yozish xatoligi:", error);
      return NextResponse.json(
        { error: "Ma'lumotlar bazasiga yozishda xatolik yuz berdi", details: error.message },
        { status: 500 }
      );
    }

    console.log("Yangi blog post muvaffaqiyatli saqlandi:", data);
    return NextResponse.json({ 
      success: true, 
      message: "Yangi ko'p tilli (UZ, RU, EN) blog post muvaffaqiyatli generatsiya qilindi va saqlandi!", 
      post: data[0] 
    });

  } catch (err) {
    console.error("Auto-Blog Generation Catch Error:", err);
    return NextResponse.json(
      { error: "Avtomatik maqola yaratish jarayonida xatolik yuz berdi", details: err.message },
      { status: 500 }
    );
  }
}
