import 'server-only';
import { Prisma } from '@prisma/client';
import {
  approximatePiecePrice,
  legacyIdFromSku,
  mapCatalogCard,
  toPriceNumber,
  type CatalogCard,
  type LocalizedPair,
} from '@/lib/domain/catalogMapping';
import { searchQueryVariants } from '@/lib/domain/searchNormalization';
import { db } from '@/lib/server/db';
import type { Category } from '@/types';

export interface PrismaCatalogQuery {
  query?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  locale?: string;
}

export interface PrismaCatalogResult {
  products: CatalogCard[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

const PAGE_SIZES = [24, 48, 96];

const productCardInclude = {
  category: { select: { slugUz: true } },
  translations: true,
  media: {
    orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }] as Prisma.ProductMediaOrderByWithRelationInput[],
    take: 1,
    include: { media: { select: { url: true } } },
  },
} satisfies Prisma.ProductInclude;

type ProductWithCard = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

function translationPair(
  translations: Array<{ locale: string; name: string; shortDescription?: string | null }>,
): { name: LocalizedPair; shortDescription: Partial<LocalizedPair> } {
  const uz = translations.find((translation) => translation.locale === 'uz');
  const ru = translations.find((translation) => translation.locale === 'ru');
  return {
    name: { uz: uz?.name || ru?.name || '', ru: ru?.name || uz?.name || '' },
    shortDescription: { uz: uz?.shortDescription || '', ru: ru?.shortDescription || '' },
  };
}

function toCard(product: ProductWithCard): CatalogCard {
  const { name, shortDescription } = translationPair(product.translations);
  return mapCatalogCard({
    catalogId: product.id,
    sku: product.sku,
    legacySku: product.legacySku,
    slugUz: product.slugUz,
    slugRu: product.slugRu,
    publicPrice: product.publicPrice?.toString(),
    priceMode: product.priceMode,
    availabilityStatus: product.availabilityStatus,
    saleUnit: product.saleUnit,
    unitsPerPack: product.unitsPerPack,
    packsPerCarton: product.packsPerCarton,
    unitsPerCarton: product.unitsPerCarton,
    minimumOrderQuantity: product.minimumOrderQuantity,
    orderStep: product.orderStep,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    categorySlug: product.category.slugUz,
    imageUrl: product.media[0]?.media.url,
    name,
    shortDescription,
  });
}

export async function getPrismaCategories(): Promise<Category[]> {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { slugUz: 'asc' }],
    include: { translations: true },
  });

  return categories.map((category, index) => {
    const uz = category.translations.find((translation) => translation.locale === 'uz');
    const ru = category.translations.find((translation) => translation.locale === 'ru');
    return {
      id: index + 1,
      name: { uz: uz?.name || category.slugUz, ru: ru?.name || uz?.name || category.slugUz },
      slug: category.slugUz,
      image: '',
      description: { uz: uz?.description || '', ru: ru?.description || '' },
    } as Category;
  });
}

interface SearchFilters {
  categorySlug?: string;
  availableOnly?: boolean;
}

const SEARCH_RESULT_LIMIT = 2000;
const WORD_SIMILARITY_THRESHOLD = 0.4;

/**
 * Trigram + transliteratsiya asosidagi qidiruv (spec §13): SKU, nom, searchText bo'yicha,
 * kirill/lotin variantlari va typo tolerance bilan. Relevance tartibida product id qaytaradi.
 */
async function searchProductIdsRanked(queryText: string, filters: SearchFilters): Promise<string[]> {
  const variants = searchQueryVariants(queryText);
  if (!variants.length) return [];
  const patterns = variants.map((variant) => `%${variant}%`);

  const categoryFilter = filters.categorySlug
    ? Prisma.sql`AND p."categoryId" IN (SELECT c."id" FROM "Category" c WHERE c."slugUz" = ${filters.categorySlug})`
    : Prisma.empty;
  const availabilityFilter = filters.availableOnly
    ? Prisma.sql`AND p."availabilityStatus" = ANY(ARRAY['IN_STOCK', 'LOW_STOCK']::"AvailabilityStatus"[])`
    : Prisma.empty;

  const rows = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT p."id"
    FROM "Product" p
    JOIN "ProductTranslation" t ON t."productId" = p."id"
    CROSS JOIN unnest(${variants}::text[]) AS v(q)
    WHERE p."status" = 'ACTIVE'::"ProductStatus"
      ${categoryFilter}
      ${availabilityFilter}
      AND (
        lower(p."sku") LIKE ANY(${patterns}::text[])
        OR lower(coalesce(p."legacySku", '')) LIKE ANY(${patterns}::text[])
        OR lower(t."name") LIKE ANY(${patterns}::text[])
        OR lower(coalesce(t."searchText", '')) LIKE ANY(${patterns}::text[])
        OR word_similarity(v.q, lower(t."name")) > ${WORD_SIMILARITY_THRESHOLD}
      )
    GROUP BY p."id"
    ORDER BY MAX(GREATEST(
      CASE WHEN lower(p."sku") LIKE ANY(${patterns}::text[]) THEN 1.0 ELSE 0.0 END,
      CASE WHEN lower(t."name") LIKE ANY(${patterns}::text[]) THEN 0.9 ELSE 0.0 END,
      word_similarity(v.q, lower(t."name")),
      word_similarity(v.q, lower(coalesce(t."searchText", '')))
    )) DESC, p."createdAt" DESC
    LIMIT ${SEARCH_RESULT_LIMIT}
  `);
  return rows.map((row) => row.id);
}

async function recordSearchQuery(query: string, locale: string, resultCount: number): Promise<void> {
  try {
    await db.searchQuery.create({ data: { query, locale, resultCount, source: 'catalog' } });
  } catch (error) {
    console.error('Search analytics write failed:', error);
  }
}

export async function getPrismaCatalog(input: PrismaCatalogQuery): Promise<PrismaCatalogResult | null> {
  const activeCount = await db.product.count({ where: { status: 'ACTIVE' } });
  if (activeCount === 0) return null;

  const pageSize = PAGE_SIZES.includes(input.pageSize || 0) ? input.pageSize! : 24;
  const page = Math.max(1, Math.floor(input.page || 1));
  const queryText = input.query?.trim().slice(0, 100) || '';
  const categorySlug = input.category?.trim().slice(0, 120) || '';
  const availableOnly = input.availability === 'available';
  const locale = input.locale === 'ru' ? 'ru' : 'uz';

  let orderBy: Prisma.ProductOrderByWithRelationInput[];
  if (input.sort === 'price_asc') orderBy = [{ publicPrice: { sort: 'asc', nulls: 'last' } }];
  else if (input.sort === 'price_desc') orderBy = [{ publicPrice: { sort: 'desc', nulls: 'last' } }];
  else if (input.sort === 'name_asc') orderBy = [{ slugUz: 'asc' }];
  else orderBy = [{ createdAt: 'desc' }];

  if (queryText) {
    let rankedIds: string[];
    try {
      rankedIds = await searchProductIdsRanked(queryText, { categorySlug: categorySlug || undefined, availableOnly });
    } catch (error) {
      // pg_trgm mavjud bo'lmagan muhitlarda oddiy contains qidiruvga qaytamiz.
      console.error('Trigram search failed, falling back to contains search:', error);
      const fallbackWhere: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        ...(categorySlug ? { category: { slugUz: categorySlug } } : {}),
        ...(availableOnly ? { availabilityStatus: { in: ['IN_STOCK', 'LOW_STOCK'] } } : {}),
        OR: [
          { sku: { contains: queryText, mode: 'insensitive' } },
          { legacySku: { contains: queryText, mode: 'insensitive' } },
          { translations: { some: { name: { contains: queryText, mode: 'insensitive' } } } },
          { translations: { some: { searchText: { contains: queryText, mode: 'insensitive' } } } },
        ],
      };
      const matches = await db.product.findMany({ where: fallbackWhere, orderBy: { createdAt: 'desc' }, select: { id: true }, take: SEARCH_RESULT_LIMIT });
      rankedIds = matches.map((match) => match.id);
    }

    const total = rankedIds.length;
    if (page === 1) await recordSearchQuery(queryText, locale, total);

    let pageProducts: ProductWithCard[];
    if (input.sort && input.sort !== 'newest' && input.sort !== 'relevance') {
      pageProducts = await db.product.findMany({
        where: { id: { in: rankedIds } },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: productCardInclude,
      });
    } else {
      const pageIds = rankedIds.slice((page - 1) * pageSize, page * pageSize);
      const unordered = await db.product.findMany({ where: { id: { in: pageIds } }, include: productCardInclude });
      const byId = new Map(unordered.map((product) => [product.id, product]));
      pageProducts = pageIds.map((id) => byId.get(id)).filter((product): product is ProductWithCard => Boolean(product));
    }

    return {
      products: pageProducts.map(toCard),
      categories: await getPrismaCategories(),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };
  if (categorySlug) where.category = { slugUz: categorySlug };
  if (availableOnly) where.availabilityStatus = { in: ['IN_STOCK', 'LOW_STOCK'] };

  const [total, products, categories] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: productCardInclude,
    }),
    getPrismaCategories(),
  ]);

  return {
    products: products.map(toCard),
    categories,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface SearchSuggestion {
  sku: string;
  name: string;
  url: string;
  price: string;
}

export async function suggestProducts(rawQuery: string, locale: 'uz' | 'ru', limit = 8): Promise<SearchSuggestion[]> {
  const ids = (await searchProductIdsRanked(rawQuery, {})).slice(0, Math.min(Math.max(limit, 1), 20));
  if (!ids.length) return [];

  const products = await db.product.findMany({ where: { id: { in: ids } }, include: productCardInclude });
  const byId = new Map(products.map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is ProductWithCard => Boolean(product))
    .map((product) => {
      const card = toCard(product);
      return {
        sku: card.sku,
        name: locale === 'ru' ? card.name.ru : card.name.uz,
        url: `/${locale}/product/${catalogCardUrlSlug(card, locale)}`,
        price: card.formattedPrice,
      };
    });
}

export interface PrismaProductDetail {
  card: CatalogCard;
  locale: 'uz' | 'ru';
  description: string;
  shortDescription: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  images: string[];
  piecePrice: number | null;
  packPrice: number;
  priceTiers: Array<{ minQuantity: number; maxQuantity: number | null; price: number; priceUnit: string }>;
  related: CatalogCard[];
}

function pickLocale(
  translations: Array<{ locale: string; name: string; shortDescription?: string | null; description?: string | null }>,
  locale: 'uz' | 'ru',
) {
  return translations.find((translation) => translation.locale === locale)
    || translations.find((translation) => translation.locale === 'uz')
    || translations[0];
}

export async function getPrismaProductDetail(slugOrId: string, locale: 'uz' | 'ru'): Promise<PrismaProductDetail | null> {
  const decoded = decodeURIComponent(slugOrId).trim().slice(0, 200);
  const numericTail = /-(\d+)$/.exec(decoded)?.[1] || (/^\d+$/.test(decoded) ? decoded : null);

  const candidates: Prisma.ProductWhereInput[] = [
    { slugUz: decoded },
    { slugRu: decoded },
    { sku: decoded },
  ];
  if (numericTail) {
    candidates.push({ legacySku: `PS-${numericTail}` });
    candidates.push({ slugUz: decoded.replace(/-\d+$/, '') });
    candidates.push({ slugRu: decoded.replace(/-\d+$/, '') });
  }

  const detailInclude = {
    ...productCardInclude,
    category: { include: { translations: true } },
    media: {
      orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }] as Prisma.ProductMediaOrderByWithRelationInput[],
      include: { media: { select: { url: true } } },
    },
    priceTiers: { orderBy: { minQuantity: 'asc' } },
  } satisfies Prisma.ProductInclude;

  const product = await db.product.findFirst({
    where: { status: 'ACTIVE', OR: candidates },
    include: detailInclude,
  });
  if (!product) return null;

  const translation = pickLocale(product.translations, locale);
  const categoryTranslation = product.category.translations.find((entry) => entry.locale === locale)
    || product.category.translations.find((entry) => entry.locale === 'uz');

  const related = await db.product.findMany({
    where: { status: 'ACTIVE', categoryId: product.categoryId, id: { not: product.id } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: productCardInclude,
  });

  const card = toCard({ ...product, category: { slugUz: product.category.slugUz } });
  return {
    card,
    locale,
    name: translation?.name || card.sku,
    shortDescription: translation?.shortDescription || '',
    description: translation?.description || '',
    categoryName: categoryTranslation?.name || product.category.slugUz,
    categorySlug: product.category.slugUz,
    images: product.media.map((entry) => entry.media.url),
    packPrice: toPriceNumber(product.publicPrice?.toString()),
    piecePrice: approximatePiecePrice(product.publicPrice?.toString(), product.unitsPerPack),
    priceTiers: product.priceTiers.map((tier) => ({
      minQuantity: tier.minQuantity,
      maxQuantity: tier.maxQuantity,
      price: toPriceNumber(tier.price.toString()),
      priceUnit: tier.priceUnit,
    })),
    related: related.map(toCard),
  };
}

export function catalogCardUrlSlug(card: CatalogCard, locale: 'uz' | 'ru'): string {
  const slug = locale === 'ru' ? card.slug.ru || card.slug.uz : card.slug.uz;
  const legacyId = legacyIdFromSku(card.legacySku);
  return legacyId ? `${slug}-${legacyId}` : slug;
}
