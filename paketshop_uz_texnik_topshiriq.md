# PAKETSHOP.UZ SAYTINI QAYTA QURISH UCHUN TEXNIK TOPSHIRIQ

## 1. Loyiha nomi

**PaketShop.uz — ulgurji qadoqlash, bir martalik idishlar va xo‘jalik sarf materiallari katalogi**

## 2. Loyiha maqsadi

PaketShop.uz’ni oddiy chakana internet-do‘kondan ulgurji B2B savdoga mos, tez ishlaydigan va mobil qurilmalarda qulay katalog hamda buyurtma yig‘ish tizimiga aylantirish.

Saytning asosiy vazifasi:

1. OLX, Telegram, Google va boshqa kanallardan kelgan mijozga assortimentni tartibli ko‘rsatish.
2. Mahsulotning o‘lchami, qadoqdagi soni, korobkadagi soni va boshlang‘ich narxini aniq tushuntirish.
3. Mijozdan ulgurji buyurtma yoki narx so‘rovini olish.
4. Telegram va telefon orqali savdoni tez yopish.
5. Tashkilotlar, qayta sotuvchilar, bozorchilar va yangi biznes boshlayotganlar uchun alohida takliflar berish.
6. 1 000–50 000 tagacha mahsulotga kengayishga tayyor arxitektura yaratish.
7. Admin orqali mahsulot, narx, kategoriya, qoldiq holati va buyurtmalarni boshqarish.
8. Qaysi kanal, mahsulot va e’lon ko‘proq savdo olib kelayotganini o‘lchash.

## 3. Biznes modeli

PaketShop.uz’da savdo modeli quyidagicha:

**OLX / Google / Instagram / Telegram → PaketShop katalogi → Telegram, telefon yoki so‘rov formasi → menejer narx va qoldiqni tasdiqlaydi → to‘lov → yetkazish**

Sayt birinchi bosqichda to‘liq avtomatik chakana checkout’ga tayanmaydi. Asosiy konversiya:

- “Telegram orqali buyurtma”
- “Ulgurji narxni so‘rash”
- “Telefon qilish”
- “Buyurtma so‘rovi yuborish”

Savat bo‘lishi kerak, lekin savatning asosiy vazifasi mahsulotlar ro‘yxatini yig‘ib, menejerga buyurtma so‘rovi yuborishdir.

## 4. Asosiy xaridor segmentlari

### 4.1. Yangi biznes boshlayotganlar

Misollar:

- kofe nuqtasi;
- fast-food;
- ovqat yetkazish xizmati;
- qandolatchi;
- do‘kon yoki savdo nuqtasi.

Ularga tayyor “Start to‘plamlar” ko‘rsatiladi.

### 4.2. Qayta sotuvchilar

Misollar:

- bozorchilar;
- ulgurji olib qayta sotuvchilar;
- kichik do‘konlar;
- hududiy sotuvchilar.

Ularga miqdor bo‘yicha narx, katta qadoq, korobka va qayta buyurtma funksiyasi muhim.

### 4.3. Tashkilotlar

Ularga quyidagilar muhim:

- bank orqali to‘lov;
- hisob-faktura;
- shartnoma;
- doimiy ta’minot;
- katta miqdorni rezerv qilish;
- menejer bilan individual kelishuv.

### 4.4. Doimiy sarf qiluvchi bizneslar

Misollar:

- kafe va restoranlar;
- catering;
- street-food;
- supermarket va do‘konlar;
- ombor va ishlab chiqarish korxonalari;
- floristlar;
- qandolatchilar.

## 5. MVP doirasi

Birinchi versiyada quyidagilar tayyor bo‘lishi shart:

1. O‘zbek va rus tillari.
2. Mobil-first responsive dizayn.
3. Bosh sahifa.
4. Katalog va kategoriyalar.
5. Kuchli qidiruv va filtrlar.
6. Mahsulot sahifasi.
7. Savat va buyurtma so‘rovi.
8. Telegram deep-link orqali tayyor xabar.
9. Telefon orqali bog‘lanish.
10. “Ulgurji xaridorlar uchun” sahifasi.
11. “Tashkilotlar uchun” sahifasi.
12. “Yangi biznes uchun to‘plamlar” sahifasi.
13. Yetkazib berish va to‘lov sahifalari.
14. Admin panel.
15. Excel/CSV orqali mahsulot importi va eksporti.
16. Buyurtma va leadlarni boshqarish.
17. SEO, sitemap va analitika.
18. Eski URL’lardan yangi URL’larga 301 redirect.
19. Mahsulot rasmi va hujjatlari uchun media boshqaruvi.
20. Asosiy xavfsizlik, backup va audit log.

MVP’da majburiy bo‘lmagan funksiyalar:

- Click yoki Payme orqali avtomatik online to‘lov;
- mobil ilova;
- aniq real-time ombor integratsiyasi;
- murakkab bonus tizimi;
- to‘liq 1C integratsiyasi;
- marketplace integratsiyalari.

Bu funksiyalar keyingi bosqichda qo‘shilishi mumkin.

## 6. Tavsiya etilgan texnologik stack

Codex quyidagi stack asosida loyihani qursin:

### Frontend va backend

- Next.js 15 yoki undan yangi stabil versiya;
- App Router;
- TypeScript, strict mode;
- Server Components va Server Actions;
- Tailwind CSS;
- shadcn/ui yoki Radix UI;
- Zod validatsiyasi;
- React Hook Form.

### Ma’lumotlar bazasi

- PostgreSQL;
- Prisma ORM;
- migration va seed skriptlari.

### Autentifikatsiya

- Auth.js;
- admin foydalanuvchilari uchun email va parol;
- parollar bcrypt yoki Argon2 orqali hash qilinsin;
- role-based access control.

### Fayl saqlash

- S3-compatible storage;
- Cloudflare R2, AWS S3 yoki MinIO bilan ishlay oladigan adapter;
- WebP/AVIF optimizatsiyasi;
- original fayl va optimallashtirilgan versiyalar.

### Qidiruv

MVP:

- PostgreSQL full-text search;
- trigram/fuzzy search;
- SKU, nom, sinonim va kategoriya bo‘yicha qidiruv.

Katalog 10 000+ mahsulotga yetganda:

- Meilisearch yoki Typesense adapterini ulash imkoniyati.

### Deploy

- Dockerfile;
- docker-compose lokal muhit uchun;
- production uchun Vercel yoki VPS;
- PostgreSQL alohida managed database bo‘lishi mumkin;
- `.env.example`;
- CI pipeline: lint, typecheck, test, build.

## 7. Til va lokalizatsiya

MVP tillari:

- `uz`
- `ru`

URL strukturasi:

- `/uz`
- `/ru`
- `/uz/catalog`
- `/ru/catalog`
- `/uz/product/[slug]`
- `/ru/product/[slug]`

Talablar:

- barcha statik matnlar tarjima fayllarida;
- kategoriya va mahsulotlarda o‘zbekcha va ruscha nom, tavsif va SEO maydonlari;
- til almashtirilganda mos tarjima qilingan sahifaga o‘tish;
- noto‘g‘ri yoki yo‘q tarjimada o‘zbekcha fallback;
- `hreflang` va canonical teglar.

Ingliz tili MVP’dan chiqarilsin.

## 8. Dizayn yo‘nalishi

Dizayn premium moda do‘koni kabi emas, professional ulgurji savdo va ombor katalogi kabi bo‘lsin.

### Vizual tamoyillar

- toza oq fon;
- bitta asosiy brend rangi;
- kuchli kontrast;
- katta va o‘qilishi oson shrift;
- mahsulot kartalarida ma’lumot birinchi o‘rinda;
- ortiqcha animatsiya ishlatilmasin;
- ranglar ishonchli va biznesga mos bo‘lsin;
- mobil qurilmada barcha asosiy tugmalar bosh barmoq bilan qulay bosilsin.

### UI prioriteti

1. Mahsulot nomi.
2. Mahsulot kodi.
3. O‘lchami yoki hajmi.
4. Qadoqdagi dona.
5. Korobkadagi qadoq yoki dona.
6. Narx birligi.
7. Mavjudlik holati.
8. Telegram orqali buyurtma.

“Premium”, “eksklyuziv”, “maxsus kolleksiya” kabi mazmunsiz umumiy yozuvlar ishlatilmasin.

## 9. Sayt xaritasi

### 9.1. Public sahifalar

- Bosh sahifa
- Katalog
- Qidiruv natijalari
- Kategoriya
- Subkategoriya
- Mahsulot
- Yangi kelganlar
- Ko‘p sotiladiganlar
- Aksiya mahsulotlari
- Yangi biznes uchun to‘plamlar
- Ulgurji xaridorlar uchun
- Tashkilotlar uchun
- Yetkazib berish
- To‘lov usullari
- Biz haqimizda
- Kontaktlar
- FAQ
- Maxfiylik siyosati
- Foydalanish shartlari
- 404
- 500

### 9.2. Foydalanuvchi sahifalari

MVP’da ro‘yxatdan o‘tish majburiy emas.

Ixtiyoriy hisob:

- profil;
- buyurtmalar tarixi;
- saqlangan manzillar;
- avvalgi buyurtmani takrorlash;
- tanlangan mahsulotlar.

### 9.3. Admin sahifalari

- Dashboard
- Mahsulotlar
- Kategoriyalar
- Atributlar
- Mahsulot variantlari
- Narx darajalari
- Qoldiq holatlari
- Buyurtmalar
- Narx so‘rovlari
- Mijozlar
- Tashkilotlar
- Start to‘plamlar
- Bannerlar
- Statik sahifalar
- Foydalanuvchilar va rollar
- Import/eksport
- Redirectlar
- SEO
- Sozlamalar
- Audit log

## 10. Header

Desktop header:

1. Logo.
2. Katalog tugmasi.
3. Katta qidiruv maydoni.
4. Telefon raqami.
5. Telegram tugmasi.
6. Til almashtirgich.
7. Savat.
8. Profil, agar account funksiyasi yoqilgan bo‘lsa.

Mobile header:

1. Hamburger.
2. Logo.
3. Qidiruv.
4. Savat.

Mobile pastki sticky panel:

- Katalog
- Qidiruv
- Telegram
- Savat

## 11. Bosh sahifa

### 11.1. Hero blok

Sarlavha:

**Bir martalik idishlar va qadoqlash mahsulotlari ulgurji savdosi**

Pastki matn:

**Kafe, savdo nuqtalari, tashkilotlar va qayta sotuvchilar uchun ombordagi va buyurtma asosidagi mahsulotlar.**

CTA:

- `Katalogni ko‘rish`
- `Telegram orqali narx olish`

Hero’da posilka yetkazib berish xizmatiga o‘xshash matn bo‘lmasin.

### 11.2. Ishonch bloklari

Faqat real shartlar ko‘rsatiladi:

- ulgurji narxlar;
- Toshkent bo‘yicha yetkazish;
- viloyatlarga yuk mashinasi yoki kargo orqali jo‘natish;
- ishlab chiqaruvchi va import mahsulotlari;
- tashkilotlar bilan ishlash.

“Bepul yetkazish”, “14 kun qaytarish” yoki “barcha mahsulot sertifikatlangan” kabi umumiy va tasdiqlanmagan va’dalar avtomatik qo‘yilmasin.

### 11.3. Asosiy kategoriyalar

Har bir kategoriya:

- rasm;
- nom;
- qisqa izoh;
- mahsulotlar soni;
- kategoriya sahifasiga havola.

### 11.4. Ko‘p sotiladigan mahsulotlar

Admin belgilaydi.

### 11.5. Yangi kelgan mahsulotlar

Yaratilgan sana yoki admin belgisiga ko‘ra.

### 11.6. Xaridor turi bo‘yicha bloklar

- Yangi biznes boshlayapsizmi?
- Qayta sotuvchi yoki bozorchimisiz?
- Tashkilot uchun xarid qilyapsizmi?

Har biri tegishli landing page’ga olib boradi.

### 11.7. Start to‘plamlar

Misollar:

- Kofe nuqtasi uchun;
- Fast-food uchun;
- Ovqat yetkazish uchun;
- Qandolatchi uchun;
- Savdo nuqtasi uchun.

### 11.8. Mahsulot topib berish bloki

Matn:

**Kerakli mahsulotni katalogdan topmadingizmi? Rasmini yoki tavsifini Telegram orqali yuboring — topib beramiz.**

### 11.9. Yetkazib berish bloki

Real model ko‘rsatiladi:

- Toshkent ichida 30 000–50 000 so‘m yoki amaldagi tarif;
- Yandex orqali mijoz hisobidan;
- yirik ulgurji buyurtmani yuk mashinasigacha yetkazish;
- viloyat transportini mijoz haydovchi bilan kelishadi;
- do‘kondan olib ketish.

Narxlar admin sozlamasidan o‘zgartiriladi.

### 11.10. Kontakt va xarita

- telefon;
- Telegram;
- manzil;
- ish vaqti;
- xarita;
- “Yo‘nalish olish” tugmasi.

## 12. Kategoriya va katalog sahifasi

### 12.1. Kategoriya daraxti

Kategoriya istalgan chuqurlikda bo‘lishi mumkin, amalda 3 darajagacha ishlatiladi:

- Stakanlar va qopqoqlar
  - Qog‘oz stakanlar
  - Plastik stakanlar
  - Qopqoqlar
- Bir martalik idishlar
  - Konteynerlar
  - Sous idishlari
  - Likopcha va tarelkalar
- Paketlar
  - Kraft paketlar
  - Polietilen paketlar
  - Zip paketlar
  - Chiqindi paketlari
- Plyonka va o‘rash
  - Streych
  - Oziq-ovqat plyonkasi
  - Folga
  - Pergament
- Qandolatchilik qadoqlari
- Xo‘jalik mahsulotlari
- Bayram va yangi yil mahsulotlari

Admin yangi kategoriya va subkategoriya qo‘sha olishi kerak.

### 12.2. Filtrlar

Filtrlar kategoriya atributlariga bog‘liq bo‘lsin:

- narx;
- mavjudlik;
- material;
- rang;
- hajm, ml;
- o‘lcham;
- diametr;
- uzunlik;
- qalinlik;
- qadoqdagi dona;
- korobkadagi dona;
- ishlab chiqarilgan mamlakat;
- ishlab chiqaruvchi yoki brend;
- bir martalik yoki ko‘p martalik;
- yangi mahsulot;
- aksiya;
- buyurtma asosida.

Filtr URL query parametrlariga yozilsin va link orqali ulashish mumkin bo‘lsin.

### 12.3. Saralash

- Tavsiya etilgan;
- Ko‘p sotiladigan;
- Eng yangi;
- Narxi arzon;
- Narxi qimmat;
- Nomi A–Z.

### 12.4. Katalog kartasi

Har bir kartada:

- asosiy rasm;
- kategoriya;
- mahsulot nomi;
- SKU;
- asosiy xususiyat;
- qadoqdagi miqdor;
- narx ko‘rsatish rejimi;
- mavjudlik badge;
- “Savatga”;
- “Telegram”;
- tez ko‘rish ixtiyoriy.

Misol:

**ST-250-KR — Kraft qog‘oz stakan, 250 ml**  
Qadoqda: 50 dona  
Korobkada: 20 qadoq  
1 qadoq: 47 500 so‘m  
10 qadoqdan: narxni aniqlang  
Omborda mavjud

### 12.5. Pagination

Infinite scroll emas, SEO uchun pagination ishlatilsin:

- `?page=2`
- 24, 48 yoki 96 mahsulot.

## 13. Qidiruv

Qidiruv quyidagilar bo‘yicha ishlasin:

- mahsulot nomi;
- SKU;
- eski SKU;
- kategoriya;
- sinonim;
- o‘lcham;
- hajm;
- brend;
- ruscha va o‘zbekcha yozilish variantlari.

Misollar:

- “stakan 250”
- “стакан 250”
- “zip 10x15”
- “strech”
- “стрейч”
- “sous idishi”
- “контейнер 750”

Talablar:

- typo tolerance;
- transliteratsiya;
- autocomplete;
- so‘nggi qidiruvlar;
- mashhur qidiruvlar;
- natija topilmasa Telegram orqali so‘rov CTA;
- qidiruv analitikasi admin’da ko‘rinsin.

## 14. Mahsulot ma’lumotlar modeli

Har bir mahsulot quyidagi maydonlarga ega bo‘lsin.

### 14.1. Asosiy maydonlar

- `id`
- `sku`
- `legacySku`
- `slugUz`
- `slugRu`
- `nameUz`
- `nameRu`
- `shortDescriptionUz`
- `shortDescriptionRu`
- `descriptionUz`
- `descriptionRu`
- `categoryId`
- `brandId`
- `supplierId`, faqat admin uchun
- `originCountry`
- `status`
- `availabilityStatus`
- `isFeatured`
- `isNew`
- `isBestSeller`
- `isSeasonal`
- `isActive`
- `createdAt`
- `updatedAt`

### 14.2. Birlik va qadoq maydonlari

- `baseUnit`: dona, metr, kilogramm, rulon va boshqalar;
- `saleUnit`: qadoq, korobka, dona, rulon;
- `unitsPerPack`;
- `packsPerCarton`;
- `unitsPerCarton`;
- `minimumOrderQuantity`;
- `orderStep`;
- `weightKg`;
- `lengthCm`;
- `widthCm`;
- `heightCm`;
- `volumeMl`;
- `diameterMm`;
- `thicknessMicron`.

`unitsPerCarton` avtomatik hisoblanishi mumkin:

`unitsPerPack × packsPerCarton`

Admin uni qo‘lda override qila olishi kerak.

### 14.3. Mavjudlik holati

Enum:

- `IN_STOCK` — omborda mavjud;
- `LOW_STOCK` — kam qoldi;
- `CHECK_AVAILABILITY` — qoldiqni aniqlash kerak;
- `ON_ORDER` — buyurtma asosida;
- `OUT_OF_STOCK` — vaqtincha yo‘q;
- `DISCONTINUED` — sotuvdan chiqarilgan.

Public sayt aniq qoldiq sonini ko‘rsatmasligi mumkin. Faqat holat ko‘rsatiladi.

### 14.4. Ta’minot manbasi

Faqat admin uchun:

- `DIRECT_MANUFACTURER`
- `DIRECT_IMPORT`
- `LOCAL_SUPPLIER`
- `MARKET_RESELLER`

Shuningdek:

- purchase price;
- minimum allowed sale price;
- supplier lead time;
- supplier contact;
- internal note.

Bu ma’lumotlar public API’da qaytmasin.

## 15. Mahsulot variantlari

Bir modelning rang, hajm yoki o‘lchamlari alohida dublikat mahsulot bo‘lmasin.

Variant maydonlari:

- variant SKU;
- rang;
- o‘lcham;
- hajm;
- qalinlik;
- rasm;
- qadoq miqdori;
- narx;
- mavjudlik;
- active status.

Mahsulot sahifasida variant tanlanganda:

- rasm;
- SKU;
- narx;
- qadoq;
- mavjudlik;
- Telegram matni

yangilansin.

## 16. Narx modeli

### 16.1. Narx birliklari

Narxning nimaga tegishli ekanligi majburiy ko‘rsatiladi:

- 1 dona;
- 1 qadoq;
- 1 korobka;
- 1 rulon;
- 1 kilogramm.

Sayt hech qachon 1 dona narxini “jami summa” sifatida ko‘rsatmasin.

Misol:

- 1 dona: 250 so‘m;
- qadoqda: 220 dona;
- qadoq jami: 55 000 so‘m.

Yoki faqat qadoq sotilsa:

- sotuv birligi: 1 qadoq;
- qadoq narxi: 55 000 so‘m;
- qadoqda 220 dona;
- taxminiy 1 dona narxi: 250 so‘m.

### 16.2. Narx darajalari

Har mahsulot uchun ixtiyoriy tier pricing:

- 1–4 qadoq;
- 5–9 qadoq;
- 10–49 qadoq;
- 50+ qadoq;
- individual narx.

Har tier:

- `minQuantity`
- `maxQuantity`
- `price`
- `priceUnit`
- `customerGroup`
- `startsAt`
- `endsAt`

### 16.3. Narx ko‘rsatish rejimi

Enum:

- `PUBLIC_EXACT` — aniq narx;
- `FROM_PRICE` — “... so‘mdan”;
- `LOGIN_REQUIRED` — ro‘yxatdan o‘tgan hamkor ko‘radi;
- `REQUEST_ONLY` — narx so‘raladi.

MVP’da `PUBLIC_EXACT`, `FROM_PRICE` va `REQUEST_ONLY` ishlasin.

### 16.4. Ichki narxlar

Admin ko‘radi:

- purchase price;
- public price;
- minimum allowed price;
- reseller price;
- organization price;
- margin percent.

Menejer minimum allowed price’dan past narx kiritsa, rahbar tasdig‘i talab qilinsin.

## 17. Mahsulot sahifasi

### 17.1. Yuqori qism

- breadcrumb;
- rasmlar galereyasi;
- mahsulot nomi;
- SKU;
- mavjudlik;
- variantlar;
- asosiy xususiyatlar;
- qadoq ma’lumoti;
- narx;
- miqdor tanlash;
- savat;
- Telegram;
- telefon.

### 17.2. Narx blokining formati

Misol:

**1 qadoq: 55 000 so‘m**  
Qadoqda: 220 dona  
Taxminiy 1 dona narxi: 250 so‘m  
10 qadoqdan katta ulgurji narx mavjud.

### 17.3. Telegram tugmasi

Tayyor xabar:

`Assalomu alaykum. PaketShop.uz saytidagi {SKU} — {productName} mahsulotidan {quantity} {saleUnit} kerak. Bugungi narxi va qoldig‘ini yuboring. Sahifa: {url}`

Rus tilida mos ruscha xabar.

Telegram username admin sozlamasidan olinadi.

### 17.4. Bo‘limlar

- Tavsif;
- Texnik xususiyatlar;
- Qadoq va korobka;
- Yetkazib berish;
- To‘lov;
- O‘xshash mahsulotlar;
- Birga olinadigan mahsulotlar.

### 17.5. Cross-sell

Misollar:

- stakan → qopqoq, aralashtirgich, salfetka;
- konteyner → sous idishi, paket;
- streych → skotch, qaychi;
- yangi yil qutisi → paket, lenta.

Admin manual bog‘lay oladi; avtomatik kategoriya asosidagi fallback bo‘lsin.

## 18. Savat va buyurtma so‘rovi

### 18.1. Savat

Savatda:

- mahsulot;
- variant;
- SKU;
- sotuv birligi;
- qadoq soni;
- dona ekvivalenti;
- narx;
- jami;
- mavjudlik eslatmasi.

Miqdor `minimumOrderQuantity` va `orderStep` qoidalariga mos bo‘lishi kerak.

### 18.2. Buyurtma turi

- Jismoniy shaxs;
- Yakka tartibdagi tadbirkor;
- Tashkilot;
- Qayta sotuvchi.

### 18.3. Forma maydonlari

Majburiy:

- ism yoki kompaniya nomi;
- telefon;
- Telegram username ixtiyoriy;
- shahar yoki viloyat;
- yetkazish turi;
- izoh;
- rozilik checkbox.

Tashkilot uchun:

- yuridik nom;
- STIR;
- bank orqali to‘lov kerakmi;
- shartnoma kerakmi.

### 18.4. Yuborish usullari

1. Sayt bazasiga lead/order yaratish.
2. Admin va menejerga notification.
3. Mijozga order raqami chiqarish.
4. Telegram’ga tayyor buyurtma matnini ochish ixtiyoriy.
5. Email notification ixtiyoriy.
6. Telegram bot notification Phase 1.1 yoki Phase 2.

### 18.5. Buyurtma statuslari

- `NEW`
- `CONTACTED`
- `PRICE_SENT`
- `WAITING_CUSTOMER`
- `CONFIRMED`
- `PAYMENT_PENDING`
- `PAID`
- `PREPARING`
- `READY_FOR_PICKUP`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`
- `LOST`

`LOST` uchun sabab majburiy:

- narx;
- mahsulot yo‘q;
- yetkazish;
- javob bermadi;
- raqobatchidan oldi;
- boshqa.

## 19. Yetkazib berish

Admin sozlamasidan boshqariladi.

### Variantlar

1. Do‘kondan olib ketish.
2. Toshkent bo‘yicha kuryer.
3. Yandex orqali mijoz hisobidan.
4. Viloyatga yuk yoki kargo.
5. Yuk mashinasigacha yetkazish.
6. Individual kelishuv.

### Public matn

- Toshkent ichida odatda 30 000–50 000 so‘m, yakuniy narx manzil va hajmga qarab kelishiladi.
- Yandex yoki boshqa taksi xarajatini mijoz to‘laydi.
- Yirik ulgurji buyurtma mijoz ko‘rsatgan yuk mashinasigacha yetkazilishi mumkin.
- Viloyatga transport narxini mijoz haydovchi yoki kargo bilan kelishadi.
- Mijoz oflayn do‘kondan olib ketishi mumkin.

Narxni avtomatik va’da qilmaslik kerak. “Taxminiy” yoki “menejer tasdiqlaydi” belgisi bo‘lsin.

## 20. To‘lov

MVP variantlari:

- naqd;
- karta o‘tkazmasi;
- bank hisob raqami;
- terminal;
- boshqa, admin sozlamasidan.

Online Click/Payme integratsiyasi feature flag ortida bo‘lsin va MVP’da o‘chirilgan holatda qolishi mumkin.

## 21. Start to‘plamlar

Start to‘plam oddiy mahsulot bundle bo‘lsin.

Maydonlar:

- nom;
- xaridor turi;
- tavsif;
- mahsulotlar;
- tavsiya etilgan miqdor;
- taxminiy jami;
- variantlar: Basic, Standard, Pro;
- Telegram orqali hisoblatish.

Misollar:

### Kofe nuqtasi

- 250 ml stakan;
- qopqoq;
- aralashtirgich;
- salfetka;
- kraft paket.

### Fast-food

- konteyner;
- sous idishi;
- paket;
- qoshiq-vilka;
- salfetka.

Start to‘plam narxi “taxminiy” bo‘lishi mumkin, chunki qoldiq va narx o‘zgaradi.

## 22. Tashkilotlar uchun modul

Landing page’da:

- hisob-faktura;
- shartnoma;
- bank orqali to‘lov;
- doimiy ta’minot;
- katta buyurtma;
- mahsulot rezervi;
- individual menejer.

Forma:

- tashkilot nomi;
- STIR;
- mas’ul shaxs;
- telefon;
- email;
- kerakli mahsulot;
- oylik taxminiy hajm;
- fayl yuklash;
- izoh.

Admin’da organization lead sifatida tushsin.

## 23. Qayta sotuvchilar uchun modul

Landing page’da:

- katta ulgurji narx;
- muntazam prays;
- yangi mahsulotlar;
- qoldiq haqida xabar;
- katta qadoq va korobka;
- doimiy hamkor narxi.

Forma:

- savdo joyi;
- shahar;
- taxminiy xarid hajmi;
- asosiy kategoriyalar;
- telefon;
- Telegram.

Phase 2:

- tasdiqlangan reseller hisoblari;
- yopiq narx;
- qayta buyurtma;
- individual narxlar.

## 24. Admin panel

### 24.1. Dashboard

Ko‘rsatkichlar:

- bugungi leadlar;
- yangi buyurtmalar;
- statuslar bo‘yicha son;
- Telegram click;
- telefon click;
- savat yuborish;
- top mahsulotlar;
- top kategoriyalar;
- qidiruv so‘zlari;
- lead manbalari;
- yo‘qotilgan savdo sabablari;
- o‘rtacha buyurtma summasi.

### 24.2. Mahsulot boshqaruvi

- yaratish;
- tahrirlash;
- nusxalash;
- archive;
- bulk update;
- variantlar;
- rasmlar;
- atributlar;
- narxlar;
- SEO;
- related products;
- status.

### 24.3. Bulk import

Excel/CSV shabloni:

- SKU;
- kategoriya;
- uz nom;
- ru nom;
- sotuv birligi;
- qadoqdagi dona;
- korobkadagi qadoq;
- narx;
- narx birligi;
- min buyurtma;
- order step;
- mavjudlik;
- brend;
- mamlakat;
- rasm URL;
- atributlar JSON yoki alohida ustunlar.

Talablar:

- dry-run preview;
- xatolar ro‘yxati;
- SKU bo‘yicha update;
- yangi mahsulot yaratish;
- duplicate aniqlash;
- import log;
- rollback yoki oldingi faylni saqlash.

### 24.4. Lead va buyurtmalar

- status almashtirish;
- mas’ul menejer;
- qo‘ng‘iroq eslatmasi;
- izoh;
- kelishilgan narx;
- delivery note;
- lost reason;
- UTM va source;
- tarix.

### 24.5. Rollar

- `SUPER_ADMIN`
- `ADMIN`
- `CONTENT_MANAGER`
- `SALES_MANAGER`
- `WAREHOUSE_VIEWER`

Huquqlar role bo‘yicha tekshirilsin.

## 25. Lead manbasini aniqlash

Har bir session uchun source saqlansin:

- OLX;
- Telegram;
- Instagram;
- Google Organic;
- Google Ads;
- Direct;
- boshqa.

UTM parametrlari:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Shuningdek custom parametr:

- `ref=olx`
- `olx_ad_id`
- `product_code`

Birinchi va oxirgi source saqlansin.

Telegram, telefon va order tugmalari event sifatida yuborilsin.

## 26. Analitika

Google Analytics 4 va Yandex Metrica adapter orqali ulanadi.

Eventlar:

- `view_item_list`
- `select_item`
- `view_item`
- `search`
- `filter_products`
- `add_to_cart`
- `remove_from_cart`
- `begin_order_request`
- `submit_order_request`
- `click_telegram`
- `click_phone`
- `click_directions`
- `download_price_list`
- `request_wholesale_price`
- `request_organization_offer`

Cookie consent amaldagi siyosatga mos qo‘shilsin.

## 27. SEO

### Texnik SEO

- server-side rendering;
- metadata API;
- canonical;
- hreflang;
- sitemap index;
- product sitemap;
- category sitemap;
- robots.txt;
- breadcrumb schema;
- Organization schema;
- Product schema;
- ItemList schema;
- FAQ schema faqat real FAQ uchun;
- Open Graph;
- Twitter Card;
- noindex for admin, account, cart, internal search filters;
- pagination canonical qoidalari.

### URL

- qisqa;
- lotin;
- tarjima qilingan;
- ID’siz bo‘lishi mumkin, lekin slug unique;
- eski URL’lardan 301 redirect.

### Eski sahifalar

Eski mahsulot yoki kategoriya:

- yangi ekvivalenti bo‘lsa 301;
- kategoriya almashtirilgan bo‘lsa eng yaqin kategoriya;
- butunlay yo‘q bo‘lsa foydali 410 yoki mos kategoriya;
- barcha redirectlar admin panel orqali boshqariladi.

## 28. Performance

Maqsad:

- mobile Lighthouse Performance 85+;
- Accessibility 90+;
- Best Practices 90+;
- SEO 95+;
- LCP 2.5 soniyadan past;
- CLS 0.1 dan past;
- INP 200 ms atrofida yoki past;
- initial page JS minimal;
- rasmlar lazy-load;
- hero image preload;
- caching;
- CDN;
- database indexlar.

Mahsulotlar 50 000 taga yetganda ham katalog pagination va qidiruv ishlashi kerak.

## 29. Accessibility

- semantik HTML;
- keyboard navigation;
- focus state;
- label va aria;
- kontrast WCAG AA;
- form error matni;
- modal trap;
- rasm alt matni;
- tugmalarda aniq nom.

## 30. Xavfsizlik

- Zod server validation;
- CSRF himoyasi kerakli joylarda;
- rate limiting;
- login brute-force himoyasi;
- secure cookie;
- RBAC;
- file upload MIME va size tekshiruvi;
- SQL injection Prisma orqali bloklanadi;
- XSS sanitization;
- admin action audit log;
- secrets faqat environment’da;
- production error’da stack trace ko‘rsatilmasin;
- database daily backup;
- media backup;
- restore yo‘riqnomasi.

## 31. Notification

MVP:

- admin ichida notification;
- yangi buyurtma uchun email ixtiyoriy.

Phase 1.1:

- Telegram bot orqali menejer guruhiga xabar;
- status o‘zgarganda mijozga Telegram yoki SMS integratsiya adapteri.

Telegram bot xabarida:

- order raqami;
- mijoz;
- telefon;
- mahsulotlar;
- summa;
- source;
- admin link.

## 32. Ma’lumotlar bazasi jadvallari

Kamida quyidagi entitylar bo‘lsin:

- User
- Role
- Customer
- Organization
- Address
- Category
- Product
- ProductTranslation
- ProductVariant
- Attribute
- AttributeValue
- ProductAttributeValue
- Brand
- Supplier
- Media
- PriceTier
- CustomerGroup
- Cart
- CartItem
- Order
- OrderItem
- OrderStatusHistory
- Lead
- LeadActivity
- Bundle
- BundleItem
- Page
- Banner
- SiteSetting
- Redirect
- SearchQuery
- AnalyticsEvent, optional internal
- ImportJob
- ImportError
- AuditLog

Prisma schema’da indekslar:

- SKU;
- slug;
- categoryId;
- active/status;
- createdAt;
- product name search;
- order phone;
- order status;
- lead source;
- UTM campaign.

## 33. API va server actionlar

Public:

- product list;
- product detail;
- search;
- filters;
- category tree;
- cart;
- order request;
- wholesale request;
- organization request;
- reseller request;
- contact request.

Admin:

- CRUD products;
- CRUD categories;
- CRUD attributes;
- bulk import;
- price update;
- order status;
- lead assignment;
- content;
- redirects;
- settings;
- analytics summary.

Barcha mutationlar:

- authenticated;
- authorized;
- validated;
- audit logged;
- error-handled.

## 34. Form validatsiyasi

Telefon O‘zbekiston formatlarini qabul qilsin:

- `+998 XX XXX XX XX`
- `998XXXXXXXXX`
- lokal format kiritilsa normalize qilinsin.

Spam himoyasi:

- honeypot;
- rate limit;
- server timestamp;
- kerak bo‘lsa Cloudflare Turnstile adapteri.

## 35. Kontent boshqaruvi

Admin quyidagilarni kodga tegmasdan o‘zgartira olsin:

- hero matni;
- telefon;
- Telegram;
- manzil;
- ish vaqti;
- yetkazish tarif matni;
- to‘lov usullari;
- bosh sahifa bloklari;
- bannerlar;
- FAQ;
- footer;
- ijtimoiy tarmoqlar;
- SEO defaultlar.

## 36. Migratsiya

1. Mavjud mahsulot va kategoriyalar eksport qilinsin.
2. Dublikat va noto‘g‘ri mahsulotlar tozalansin.
3. Har mahsulotga SKU berilsin.
4. Narx birligi aniqlansin.
5. Qadoq va korobka miqdori ajratilsin.
6. Eski rasmlar tekshirilsin.
7. Eski URL → yangi URL redirect jadvali tuzilsin.
8. Eski moda yoki boshqa yo‘nalishdagi metadata olib tashlansin.
9. Test muhitida migration bajarilsin.
10. Production launch oldidan redirect va indexation tekshirilsin.

## 37. Dastlabki seed kategoriyalar

1. Stakanlar va qopqoqlar
2. Bir martalik idishlar
3. Ovqat konteynerlari
4. Sous idishlari
5. Kraft paketlar
6. Polietilen paketlar
7. Zip paketlar
8. Chiqindi paketlari
9. Streych plyonkalar
10. Oziq-ovqat plyonkasi
11. Folga va pergament
12. Qandolatchilik qadoqlari
13. Bir martalik qoshiq-vilka
14. Salfetka va qog‘oz mahsulotlari
15. Xo‘jalik sarf materiallari
16. Bayram mahsulotlari
17. Yangi yil paketlari va qutilari

## 38. Testlar

### Unit test

- price calculation;
- units per carton;
- tier price selection;
- min quantity;
- order step;
- phone normalization;
- slug;
- Telegram message.

### Integration test

- product create;
- variant update;
- import;
- cart;
- order submit;
- admin status;
- redirect;
- search.

### E2E

Playwright bilan:

1. Foydalanuvchi qidiradi.
2. Filter ishlatadi.
3. Mahsulot variantini tanlaydi.
4. Savatga qo‘shadi.
5. Buyurtma so‘rovi yuboradi.
6. Telegram tugmasini bosadi.
7. Admin buyurtmani ko‘radi.
8. Admin statusni o‘zgartiradi.
9. UZ/RU til almashadi.
10. Eski URL 301 bilan yangi sahifaga o‘tadi.

## 39. Qabul mezonlari

Loyiha qabul qilinadi, agar:

1. UZ va RU tillari to‘liq ishlasa.
2. Mobil, planshet va desktop responsive bo‘lsa.
3. Admin mahsulot va kategoriya yarata olsa.
4. Excel’dan kamida 1 000 mahsulot import qilinsa.
5. Mahsulotda dona, qadoq va korobka aniq ajratilsa.
6. Tier price to‘g‘ri hisoblansa.
7. Katalog filter va qidiruv ishlasa.
8. Telegram tugmasi SKU, nom, miqdor va URL bilan xabar ochsa.
9. Savat buyurtma so‘rovini bazaga yozsa.
10. Admin buyurtma statusini boshqara olsa.
11. Lead source va UTM saqlansa.
12. 404 va eski URL redirectlari ishlasa.
13. Sitemap va robots to‘g‘ri generatsiya qilinsa.
14. Asosiy sahifalarda Lighthouse maqsadlariga yaqin natija bo‘lsa.
15. `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` xatosiz tugasa.
16. Docker orqali lokal ishga tushsa.
17. README’da to‘liq o‘rnatish va deploy yo‘riqnomasi bo‘lsa.
18. `.env.example` mavjud bo‘lsa.
19. Production’da admin ma’lumotlari va ichki narxlar public API’dan chiqmasa.
20. Database backup va restore yo‘riqnomasi berilsa.

## 40. Phase 2

MVP’dan keyin:

- Click va Payme;
- shaxsiy kabinet;
- reseller tasdiqlash;
- yopiq narxlar;
- qayta buyurtma;
- PDF prays-list generator;
- Telegram bot;
- SMS;
- 1C yoki ombor tizimi;
- real-time stock;
- menejer komissiyasi;
- mijozga individual price list;
- contract va invoice generator;
- Meilisearch/Typesense;
- OLX e’lon tracking;
- API orqali boshqa platformalarga eksport;
- PWA.

## 41. Codex uchun amalga oshirish tartibi

Codex ishni quyidagi bosqichlarda bajarsin:

### Bosqich 1 — Foundation

- repository;
- Next.js;
- TypeScript;
- Tailwind;
- Prisma;
- PostgreSQL;
- Auth;
- i18n;
- Docker;
- lint/typecheck/test.

### Bosqich 2 — Data model va admin

- schema;
- seed;
- admin layout;
- categories;
- products;
- variants;
- attributes;
- prices;
- media.

### Bosqich 3 — Public katalog

- homepage;
- catalog;
- category;
- search;
- filters;
- product page;
- responsive UI.

### Bosqich 4 — Savdo oqimi

- cart;
- order request;
- Telegram;
- phone;
- lead source;
- admin order pipeline.

### Bosqich 5 — SEO va migration

- metadata;
- sitemap;
- schema;
- redirects;
- import;
- legacy migration.

### Bosqich 6 — Test va deploy

- unit;
- integration;
- E2E;
- security pass;
- performance;
- production deploy.

Har bosqichdan keyin:

- lint;
- typecheck;
- test;
- build;
- changelog;
- README yangilanishi.

## 42. Codex uchun master prompt

Quyidagi topshiriqni Codex’ga bering:

---

You are rebuilding PaketShop.uz as a production-grade B2B wholesale catalog and order-request platform for packaging products, disposable tableware, food containers, paper and plastic cups, zip bags, kraft bags, stretch film, household consumables, and seasonal New Year packaging in Uzbekistan.

Use:

- Next.js App Router with TypeScript strict mode;
- Tailwind CSS and shadcn/ui;
- PostgreSQL and Prisma;
- Auth.js with RBAC;
- Zod;
- React Hook Form;
- S3-compatible media storage;
- Docker and docker-compose;
- Vitest and Playwright.

The primary business flow is not a traditional retail checkout. It is:

traffic source → catalog → product selection → cart or wholesale quote request → Telegram/phone communication → manager confirms price and stock → payment and delivery.

The application must support Uzbek and Russian, mobile-first UI, product variants, pack/carton quantities, tier pricing, public/from/request-only pricing modes, stock status, bulk Excel/CSV import, Telegram deep-links, order and lead pipelines, UTM attribution, SEO, redirects from legacy URLs, analytics events, admin roles, audit logs, backups, and robust validation.

Follow every requirement in this technical specification. Do not leave critical sections as mockups or TODOs. Use clean modular architecture, accessible UI, secure server-side validation, database indexes, error handling, seed data, tests, README, `.env.example`, Docker setup, and migration scripts.

Important domain rules:

1. A product can have a base unit, sale unit, units per pack, packs per carton, units per carton, minimum order quantity, and order step.
2. Never confuse one-piece price with pack total.
3. Show exact labels such as “1 pack”, “220 pieces per pack”, and “pack total”.
4. Product price modes are PUBLIC_EXACT, FROM_PRICE, LOGIN_REQUIRED, and REQUEST_ONLY.
5. Availability modes are IN_STOCK, LOW_STOCK, CHECK_AVAILABILITY, ON_ORDER, OUT_OF_STOCK, and DISCONTINUED.
6. Telegram order messages must include SKU, product name, selected variant, quantity, sale unit, language, and product URL.
7. Orders must preserve a snapshot of product name, SKU, quantity, unit, and price at the time of submission.
8. Internal purchase prices, suppliers, margins, and minimum allowed prices must never be exposed publicly.
9. Track first-touch and last-touch attribution using UTM parameters and source identifiers.
10. Legacy URLs must be handled with admin-managed 301 redirects.

Build the project incrementally in the phases listed in the specification. After each phase, run lint, typecheck, tests, and production build. Fix every error before continuing.

Start by producing:

1. architecture summary;
2. folder structure;
3. Prisma schema;
4. environment variable list;
5. implementation checklist;
6. then implement the application.

---

## 43. Yakuniy natija

Yangi PaketShop.uz:

- chakana premium do‘kon ko‘rinishida emas;
- professional ulgurji katalog ko‘rinishida;
- Telegram va telefon savdosiga mos;
- 200 mahsulotdan 50 000 mahsulotgacha kengaya oladigan;
- mahsulot kodi, qadoq, korobka va narx birligini aniq ko‘rsatadigan;
- OLX’dan kelgan mijozni yo‘qotmaydigan;
- tashkilot va qayta sotuvchilarni alohida qayta ishlaydigan;
- admin uchun katalog, lead va buyurtmalarni boshqaradigan tizim bo‘lishi kerak.
