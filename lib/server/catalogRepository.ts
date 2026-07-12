import 'server-only';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/constants';
import { getLocalizedText } from '@/lib/i18nUtils';
import { getPrismaCatalog } from '@/lib/server/prismaCatalog';
import { hasSupabaseCredentials, supabase } from '@/lib/supabaseClient';
import type { Category, Product } from '@/types';

export const CATALOG_PAGE_SIZES = [24, 48, 96] as const;

export interface CatalogQuery {
  query?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  locale?: string;
}

export interface CatalogResult {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

function mapProduct(row: Record<string, any>): Product {
  const stock = Number(row.stock || 0);
  return {
    ...row,
    id: Number(row.id),
    name: row.name || '',
    sku: row.sku || `PS-${row.id}`,
    price: Number(row.price || 0),
    category: String(row.category || ''),
    image: String(row.image || '/logo.png'),
    formattedPrice: new Intl.NumberFormat('uz-UZ').format(Number(row.price || 0)) + " so'm",
    shortDescription: row.shortDescription || row.description || '',
    specs: Array.isArray(row.specifications) ? row.specifications : [],
    itemsPerPackage: Number(row.itemsPerPackage || 1),
    packsPerCarton: Number(row.packsPerCarton || 1),
    unitsPerCarton: Number(row.unitsPerCarton || row.itemsPerPackage || 1),
    minimumOrderQuantity: Number(row.minimumOrderQuantity || 1),
    orderStep: Number(row.orderStep || 1),
    saleUnit: row.saleUnit || 'PACK',
    priceMode: row.priceMode || 'PUBLIC_EXACT',
    availabilityStatus: row.availabilityStatus || (stock > 5 ? 'IN_STOCK' : stock > 0 ? 'LOW_STOCK' : 'CHECK_AVAILABILITY'),
    isBestSeller: Boolean(row.is_bestseller),
    isNew: Boolean(row.is_new),
  };
}

export async function getCatalog(input: CatalogQuery): Promise<CatalogResult> {
  // Prisma katalogi to'ldirilgach asosiy manba bo'ladi; bo'sh yoki xatoda legacy manbaga qaytadi.
  try {
    const prismaResult = await getPrismaCatalog(input);
    if (prismaResult) {
      return {
        ...prismaResult,
        products: prismaResult.products as unknown as Product[],
      };
    }
  } catch (error) {
    console.error('Prisma catalog unavailable, falling back to legacy source:', error);
  }

  const pageSize = CATALOG_PAGE_SIZES.includes(input.pageSize as 24 | 48 | 96) ? input.pageSize! : 24;
  const page = Math.max(1, Math.floor(input.page || 1));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const queryText = input.query?.trim().slice(0, 100) || '';
  const category = input.category?.trim().slice(0, 120) || '';

  if (!hasSupabaseCredentials) {
    let rows = MOCK_PRODUCTS.map((product) => mapProduct(product as unknown as Record<string, any>));
    if (queryText) {
      const needle = queryText.toLocaleLowerCase('uz');
      rows = rows.filter((product) => `${getLocalizedText(product.name, 'uz')} ${product.sku}`.toLocaleLowerCase('uz').includes(needle));
    }
    if (category) rows = rows.filter((product) => product.category === category);
    if (input.availability === 'available') rows = rows.filter((product) => product.stock == null || product.stock > 0);
    rows = sortProducts(rows, input.sort);
    const total = rows.length;
    return { products: rows.slice(from, to + 1), categories: MOCK_CATEGORIES, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  }

  const projection = 'id,name,slug,price,image,images,category,categoryId,description,stock,itemsPerPackage,specifications,is_bestseller,created_at';
  let productQuery = supabase.from('products').select(projection, { count: 'exact' });
  if (queryText) productQuery = productQuery.ilike('name', `%${queryText.replace(/[%_]/g, '')}%`);
  if (category) productQuery = productQuery.eq('category', category);
  if (input.availability === 'available') productQuery = productQuery.gt('stock', 0);

  if (input.sort === 'price_asc') productQuery = productQuery.order('price', { ascending: true });
  else if (input.sort === 'price_desc') productQuery = productQuery.order('price', { ascending: false });
  else if (input.sort === 'name_asc') productQuery = productQuery.order('name', { ascending: true });
  else productQuery = productQuery.order('created_at', { ascending: false });

  const [productsResponse, categoriesResponse] = await Promise.all([
    productQuery.range(from, to),
    supabase.from('categories').select('id,name,slug,image,description').order('id'),
  ]);
  if (productsResponse.error) throw productsResponse.error;
  if (categoriesResponse.error) throw categoriesResponse.error;

  const products = (productsResponse.data || []).map((row) => mapProduct(row));
  const categories = (categoriesResponse.data || []).map((row) => ({ ...row, id: Number(row.id) })) as Category[];
  const total = productsResponse.count || 0;
  return { products, categories, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

function sortProducts(products: Product[], sort?: string): Product[] {
  const rows = [...products];
  if (sort === 'price_asc') return rows.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') return rows.sort((a, b) => b.price - a.price);
  if (sort === 'name_asc') return rows.sort((a, b) => getLocalizedText(a.name, 'uz').localeCompare(getLocalizedText(b.name, 'uz')));
  return rows.sort((a, b) => b.id - a.id);
}
