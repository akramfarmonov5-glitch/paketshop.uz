# Goal: Kategoriyalar uchun alohida rasmlar yuklash imkoniyatini qo'shish

Muammo: Barcha kategoriyalarda bir xil PaketShop logotipi ko'rinmoqda, chunki hozirgi Prisma ma'lumotlar bazasida kategoriya rasmini saqlash uchun maydon yo'q va kod default logotipni ko'rsatmoqda.

## Taklif qilinayotgan yechim
Kategoriyalarga rasm (imageUrl) biriktirish imkoniyatini yaratamiz va Admin paneldan rasmlarni yuklash yoki havolasini kiritish imkonini qo'shamiz.

## O'zgartirishlar rejasi

### 1. Ma'lumotlar bazasi (Prisma)
- `prisma/schema.prisma` faylidagi `Category` modeliga `imageUrl String?` maydonini qo'shamiz.
- `npx prisma db push` orqali bazani yangilaymiz.

### 2. Validatsiya va API (Backend)
- `lib/validation/adminCatalog.ts` da kategoriya sxemasiga `imageUrl` maydonini qo'shamiz.
- `app/api/admin/categories/route.ts` va `app/api/admin/categories/[id]/route.ts` API larda kategoriyani yaratish va yangilashda `imageUrl` ni qabul qilib, bazaga yozishni to'g'rilaymiz.
- `lib/fetchGlobalData.ts` va `lib/server/prismaCatalog.ts` fayllarida frontend ga kategoriya ma'lumoti bilan birga uning aniq rasmini (bo'sh qator o'rniga) jo'natamiz.

### 3. Admin panel (Frontend)
- `components/admin/AdminCategoriesV2.tsx` (yoki uni o'rniga ishlatilayotgan komponent) faylida kategoriya qo'shish va tahrirlash oynasiga "Rasm URL" degan kiritish maydonini qo'shamiz. Yoki avvalgi mahsulotlardagi kabi Cloudinary orqali rasm yuklash tugmasini joylashtiramiz.

## User Review Required
> [!IMPORTANT]
> Admin paneldagi kategoriyalarga rasm qo'yish uchun **URL manzilini kiritish** yetarlimi yoki rasmni to'g'ridan-to'g'ri kompyuterdan/telefondan **yuklash tugmasi (Cloudinary orqali)** bo'lishini xohlaysizmi? Odatda mahsulotlarga yuklash qildik, shuning uchun kategoriyaga ham yuklash qilish qulayroq bo'lishi mumkin.

Shu rejaga rozilik bersangiz, ishni boshlayman!
