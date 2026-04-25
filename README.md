# PaketShop.uz

Vite + React + Supabase asosidagi e-commerce loyiha.

## Run locally

1. `npm install`
2. `.env.local` faylida frontend uchun envlarni sozlang:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
3. Server-side envlarni Vercel yoki lokal server muhitingizga qo'shing:
   - `GEMINI_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - ixtiyoriy: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
4. `npm run dev`

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
