import { slugify } from './slugify';
import { getLocalizedText } from './i18nUtils';
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  DEFAULT_HERO_CONTENT,
  DEFAULT_NAVIGATION,
} from '../constants';
import type {
  Product,
  Category,
  HeroContent,
  NavigationSettings,
  BlogPost,
} from '../types';

export interface GlobalData {
  products: Product[];
  categories: Category[];
  heroContent: HeroContent;
  navigationSettings: NavigationSettings;
  blogPosts: BlogPost[];
}

/**
 * Fetch global data for the application.
 * Uses Prisma (via dynamic import to avoid client-side bundling)
 * when DATABASE_URL is set, otherwise falls back to mock data.
 */
export async function fetchGlobalData(): Promise<GlobalData> {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  if (!hasDatabaseUrl) {
    return {
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      heroContent: DEFAULT_HERO_CONTENT,
      navigationSettings: DEFAULT_NAVIGATION,
      blogPosts: [],
    };
  }

  try {
    // Dynamic import to avoid bundling server-only code on client
    const { db } = await import('./server/db');

    const [dbCategories, dbProducts, dbHeroSetting] = await Promise.all([
      db.category.findMany({
        where: { active: true },
        include: { translations: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.product.findMany({
        where: { status: 'ACTIVE' },
        include: { translations: true, media: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      db.siteSetting.findUnique({ where: { key: 'hero_content' } }),
    ]);

    const categories: Category[] = dbCategories.length > 0
      ? dbCategories.map((c) => {
          const uzTrans = c.translations.find((t) => t.locale === 'uz');
          const ruTrans = c.translations.find((t) => t.locale === 'ru');
          return {
            id: parseInt(c.id, 36) || 0,
            name: { uz: uzTrans?.name || c.slugUz, ru: ruTrans?.name || c.slugRu },
            slug: { uz: c.slugUz, ru: c.slugRu },
            image: '/logo.png',
            description: { uz: uzTrans?.description || '', ru: ruTrans?.description || '' },
          };
        })
      : MOCK_CATEGORIES;

    const products: Product[] = dbProducts.length > 0
      ? dbProducts.map((p) => {
          const uzTrans = p.translations.find((t) => t.locale === 'uz');
          const ruTrans = p.translations.find((t) => t.locale === 'ru');
          const primaryMedia = p.media.find((m) => m.primary)?.media || p.media[0]?.media;
          const price = p.publicPrice ? Number(p.publicPrice) : 0;
          return {
            id: parseInt(p.id, 36) || 0,
            catalogId: p.id,
            sku: p.sku,
            legacySku: p.legacySku || undefined,
            name: { uz: uzTrans?.name || p.sku, ru: ruTrans?.name || p.sku },
            slug: { uz: p.slugUz, ru: p.slugRu },
            price,
            formattedPrice: price > 0 ? new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m' : '',
            category: p.categoryId,
            image: primaryMedia?.url || '/logo.png',
            images: p.media.map((m) => m.media.url),
            shortDescription: {
              uz: uzTrans?.shortDescription || '',
              ru: ruTrans?.shortDescription || '',
            },
            specs: [],
            stock: undefined,
            itemsPerPackage: p.unitsPerPack,
            packsPerCarton: p.packsPerCarton,
            unitsPerCarton: p.unitsPerCarton,
            minimumOrderQuantity: p.minimumOrderQuantity,
            orderStep: p.orderStep,
            baseUnit: p.baseUnit,
            saleUnit: p.saleUnit,
            priceMode: p.priceMode,
            availabilityStatus: p.availabilityStatus,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
            isBestSeller: p.isBestSeller,
          };
        })
      : MOCK_PRODUCTS;

    const heroContent: HeroContent = dbHeroSetting?.value
      ? {
          badge: (dbHeroSetting.value as any).badge || DEFAULT_HERO_CONTENT.badge,
          title: (dbHeroSetting.value as any).title || DEFAULT_HERO_CONTENT.title,
          description: (dbHeroSetting.value as any).description || DEFAULT_HERO_CONTENT.description,
          buttonText: (dbHeroSetting.value as any).buttonText || DEFAULT_HERO_CONTENT.buttonText,
          images: (dbHeroSetting.value as any).images || DEFAULT_HERO_CONTENT.images,
        }
      : DEFAULT_HERO_CONTENT;

    return {
      products,
      categories,
      heroContent,
      navigationSettings: DEFAULT_NAVIGATION,
      blogPosts: [],
    };
  } catch (error) {
    console.error('fetchGlobalData error, falling back to mock data:', error);
    return {
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      heroContent: DEFAULT_HERO_CONTENT,
      navigationSettings: DEFAULT_NAVIGATION,
      blogPosts: [],
    };
  }
}
