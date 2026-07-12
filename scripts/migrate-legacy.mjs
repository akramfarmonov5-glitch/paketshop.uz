// Legacy Supabase katalogini Prisma jadvallariga ko'chirish (idempotent).
// Ishga tushirish: node --env-file=.env scripts/migrate-legacy.mjs
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Legacy kategoriya slug -> seed qilingan Prisma kategoriya slugUz
const CATEGORY_MAP = {
  'polietilen-paketlar': 'polietilen-paketlar',
  'bir-martalik-idish-tovoqlar': 'bir-martalik-idishlar',
  'pishiriq-anjomlari': 'qandolatchilik-qadoqlari',
  'mayda-anjomlar-va-aksessuarlar': 'xojalik-sarf-materiallari',
  'tozalash-vositalari-va-xo-jalik-anjomlari': 'xojalik-sarf-materiallari',
  'bayram-tovarlari-va-bezaklari': 'bayram-mahsulotlari',
  'savdo-va-dokon-anjomlari': 'xojalik-sarf-materiallari',
};
const FALLBACK_CATEGORY = 'xojalik-sarf-materiallari';

function parseLocalized(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : { uz: String(raw) };
  } catch {
    return { uz: String(raw) };
  }
}

function slugifyText(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/['`’]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function availabilityFromStock(stock) {
  const value = Number(stock || 0);
  if (value <= 0) return 'CHECK_AVAILABILITY';
  if (value <= 50) return 'LOW_STOCK';
  return 'IN_STOCK';
}

function mimeFromUrl(url) {
  if (/\.png(\?|$)/i.test(url)) return 'image/png';
  if (/\.webp(\?|$)/i.test(url)) return 'image/webp';
  return 'image/jpeg';
}

const { data: legacyProducts, error } = await supabase.from('products').select('*').order('id');
if (error) throw error;

console.log(`Legacy mahsulotlar: ${legacyProducts.length} ta`);
let migrated = 0;
let skipped = 0;

for (const legacy of legacyProducts) {
  const sku = `PS-${legacy.id}`;
  const existing = await db.product.findUnique({ where: { sku } });
  if (existing) {
    skipped += 1;
    continue;
  }

  const name = parseLocalized(legacy.name);
  const description = parseLocalized(legacy.description);
  const slug = parseLocalized(legacy.slug);
  const nameUz = name.uz || name.ru || sku;
  const nameRu = name.ru || nameUz;

  let slugUz = slug.uz || slugifyText(nameUz) || sku.toLowerCase();
  let slugRu = slug.ru || slugifyText(nameRu) || `${slugUz}-ru`;
  if (slugRu === slugUz) slugRu = `${slugRu}-ru`;
  if (await db.product.findFirst({ where: { OR: [{ slugUz }, { slugRu: slugUz }] } })) slugUz = `${slugUz}-${legacy.id}`;
  if (await db.product.findFirst({ where: { OR: [{ slugRu }, { slugUz: slugRu }] } })) slugRu = `${slugRu}-${legacy.id}`;

  const categorySlug = CATEGORY_MAP[String(legacy.category || '').trim()] || FALLBACK_CATEGORY;
  const category = await db.category.findUnique({ where: { slugUz: categorySlug } });
  if (!category) throw new Error(`Prisma kategoriya topilmadi: ${categorySlug} (avval npm run db:seed)`);

  const unitsPerPack = Math.max(1, Math.trunc(Number(legacy.itemsPerPackage || 1)));
  const piecePrice = Number(legacy.price || 0);
  const packPrice = piecePrice > 0 ? piecePrice * unitsPerPack : null;
  const imageUrls = [...new Set([legacy.image, ...(Array.isArray(legacy.images) ? legacy.images : [])].filter(Boolean))];

  await db.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        sku,
        legacySku: sku,
        slugUz,
        slugRu,
        categoryId: category.id,
        status: 'ACTIVE',
        availabilityStatus: availabilityFromStock(legacy.stock),
        priceMode: packPrice ? 'PUBLIC_EXACT' : 'REQUEST_ONLY',
        baseUnit: 'PIECE',
        saleUnit: 'PACK',
        unitsPerPack,
        packsPerCarton: 1,
        unitsPerCarton: unitsPerPack,
        minimumOrderQuantity: 1,
        orderStep: 1,
        publicPrice: packPrice,
        isBestSeller: Boolean(legacy.is_bestseller),
        isNew: false,
        createdAt: legacy.created_at ? new Date(legacy.created_at) : undefined,
      },
    });

    for (const locale of ['uz', 'ru']) {
      const localizedName = locale === 'uz' ? nameUz : nameRu;
      const localizedDescription = description[locale] || description.uz || '';
      await tx.productTranslation.create({
        data: {
          productId: product.id,
          locale,
          name: localizedName,
          shortDescription: localizedDescription.slice(0, 300) || null,
          description: localizedDescription || null,
          searchText: [localizedName, sku, categorySlug].join(' ').toLowerCase(),
        },
      });
    }

    for (const [index, url] of imageUrls.entries()) {
      const media = await tx.media.upsert({
        where: { key: url },
        update: {},
        create: { key: url, url, mimeType: mimeFromUrl(url), sizeBytes: 0 },
      });
      await tx.productMedia.create({
        data: { productId: product.id, mediaId: media.id, sortOrder: index, primary: index === 0 },
      });
    }
  });

  console.log(`Ko'chirildi: ${sku} — ${nameUz} (${categorySlug}, qadoqda ${unitsPerPack} dona, qadoq narxi ${packPrice ?? 'so\'rov bo\'yicha'})`);
  migrated += 1;
}

console.log(`\nNatija: ${migrated} ta ko'chirildi, ${skipped} ta avvaldan mavjud.`);
await db.$disconnect();
