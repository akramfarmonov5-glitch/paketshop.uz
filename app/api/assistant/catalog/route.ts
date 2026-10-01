import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { mapAssistantProduct } from '@/lib/domain/assistantCatalog';
import { assistantApiKey, isAssistantRequest } from '@/lib/server/assistantAuth';
import { db } from '@/lib/server/db';
import { SITE_URL } from '@/lib/site';

// Public catalogue feed for the AI assistant (paketshop-asistent). Protected by the shared ASSISTANT_API_KEY.
// Explicit `select` keeps purchase prices, reseller/organization prices and supplier data out of the query result.
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;
const NO_STORE = { 'Cache-Control': 'no-store' };

const productSelect = {
  sku: true,
  legacySku: true,
  slugUz: true,
  slugRu: true,
  availabilityStatus: true,
  priceMode: true,
  baseUnit: true,
  saleUnit: true,
  unitsPerPack: true,
  packsPerCarton: true,
  unitsPerCarton: true,
  minimumOrderQuantity: true,
  orderStep: true,
  publicPrice: true,
  lengthCm: true,
  widthCm: true,
  heightCm: true,
  volumeMl: true,
  diameterMm: true,
  thicknessMicron: true,
  isNew: true,
  isBestSeller: true,
  updatedAt: true,
  category: { select: { slugUz: true, translations: { select: { locale: true, name: true } } } },
  translations: { select: { locale: true, name: true, shortDescription: true, description: true } },
  media: {
    orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }] as Prisma.ProductMediaOrderByWithRelationInput[],
    take: 4,
    select: { media: { select: { url: true } } },
  },
  variants: {
    where: { active: true },
    orderBy: { sku: 'asc' },
    select: {
      sku: true,
      color: true,
      size: true,
      volumeMl: true,
      thicknessMicron: true,
      unitsPerPack: true,
      price: true,
      availabilityStatus: true,
    },
  },
  priceTiers: {
    where: { customerGroupId: null },
    orderBy: { minQuantity: 'asc' },
    select: {
      customerGroupId: true,
      minQuantity: true,
      maxQuantity: true,
      price: true,
      priceUnit: true,
      startsAt: true,
      endsAt: true,
    },
  },
} satisfies Prisma.ProductSelect;

function limitFrom(raw: string | null): number {
  const parsed = Number.parseInt(raw || '', 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function dateFrom(raw: string | null): Date | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(request: NextRequest) {
  if (!assistantApiKey()) {
    return NextResponse.json({ error: 'Assistant integration is not configured' }, { status: 503, headers: NO_STORE });
  }
  if (!isAssistantRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
  }

  const params = request.nextUrl.searchParams;
  const limit = limitFrom(params.get('limit'));
  const cursor = params.get('cursor')?.trim().slice(0, 120) || null;
  const updatedAfter = dateFrom(params.get('updatedAfter'));

  try {
    const rows = await db.product.findMany({
      where: { status: 'ACTIVE', ...(updatedAfter ? { updatedAt: { gt: updatedAfter } } : {}) },
      orderBy: { sku: 'asc' },
      take: limit + 1,
      ...(cursor ? { cursor: { sku: cursor }, skip: 1 } : {}),
      select: productSelect,
    });

    const now = new Date();
    const page = rows.slice(0, limit);
    return NextResponse.json(
      {
        products: page.map((row) => mapAssistantProduct(row, { baseUrl: SITE_URL, now })),
        nextCursor: rows.length > limit ? page[page.length - 1].sku : null,
        generatedAt: now.toISOString(),
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error('Assistant catalog feed failed:', error);
    return NextResponse.json({ error: 'Catalog is temporarily unavailable' }, { status: 500, headers: NO_STORE });
  }
}
