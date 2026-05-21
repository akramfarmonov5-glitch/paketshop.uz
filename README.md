# PaketShop.uz

Next.js App Router + Supabase + Tailwind CSS + Gemini AI asosidagi zamonaviy e-commerce loyiha.

## Run locally

1. `npm install`
2. `.env.local` faylida frontend va backend uchun env o'zgaruvchilarini sozlang:
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase loyihasining URL manzili
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonim kaliti
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary bulut nomi (ixtiyoriy, fallback bor)
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Cloudinary yuklash preset (ixtiyoriy, fallback bor)
   - `GEMINI_API_KEY` - Gemini AI API kaliti
   - `TELEGRAM_BOT_TOKEN` - Telegram bot tokeni (buyurtma bildirishnomalari uchun)
   - `TELEGRAM_CHAT_ID` - Telegram kanal/chat ID
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin/service role kaliti (xavfsiz API amallari uchun)
   - `CLICK_SECRET_KEY` - Click to'lov webhook signaturasi kaliti
   - `PAYME_SECRET_KEY` - Payme to'lov webhook basic authorization kaliti
3. `npm run dev`

## Supabase

- Yangi baza uchun: `supabase_schema.sql`
- Mavjud bazani yangilash uchun: `supabase_fix_tables.sql`
- Review jadvali kerak bo'lsa: `supabase_reviews.sql`

## Admin access

1. Supabase Auth orqali admin user yarating.
2. SQL Editor ichida shu user ID sini `public.admin_users` ga qo'shing:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

Shundan keyin admin foydalanuvchi `/admin` orqali email/parol bilan kirishi mumkin bo'ladi.
