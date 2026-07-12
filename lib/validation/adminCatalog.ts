import { z } from 'zod';

const localizedTextSchema = z.object({
  uz: z.string().trim().min(2).max(240),
  ru: z.string().trim().min(2).max(240),
}).strict();

export const adminCategorySchema = z.object({
  parentId: z.string().cuid().nullable().optional(),
  slugUz: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  slugRu: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  name: localizedTextSchema,
  description: z.object({ uz: z.string().trim().max(2000), ru: z.string().trim().max(2000) }).strict().optional(),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(0),
  active: z.boolean().default(true),
}).strict();

const variantSchema = z.object({
  sku: z.string().trim().min(2).max(100).regex(/^[A-Za-z0-9._-]+$/),
  color: z.string().trim().max(100).optional(),
  size: z.string().trim().max(100).optional(),
  volumeMl: z.coerce.number().int().positive().optional(),
  thicknessMicron: z.coerce.number().int().positive().optional(),
  unitsPerPack: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().nonnegative().optional(),
  availabilityStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'CHECK_AVAILABILITY', 'ON_ORDER', 'OUT_OF_STOCK', 'DISCONTINUED']),
  active: z.boolean().default(true),
}).strict();

const tierSchema = z.object({
  minQuantity: z.coerce.number().int().positive(),
  maxQuantity: z.coerce.number().int().positive().nullable().optional(),
  price: z.coerce.number().nonnegative(),
  priceUnit: z.enum(['PIECE', 'PACK', 'CARTON', 'ROLL', 'KILOGRAM']),
  customerGroupId: z.string().cuid().nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
}).strict().refine((tier) => tier.maxQuantity == null || tier.maxQuantity >= tier.minQuantity, {
  message: 'maxQuantity must be greater than or equal to minQuantity',
  path: ['maxQuantity'],
});

export const adminProductSchema = z.object({
  sku: z.string().trim().min(2).max(100).regex(/^[A-Za-z0-9._-]+$/),
  legacySku: z.string().trim().max(100).nullable().optional(),
  slugUz: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  slugRu: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  categoryId: z.string().cuid(),
  brandId: z.string().cuid().nullable().optional(),
  supplierId: z.string().cuid().nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  availabilityStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'CHECK_AVAILABILITY', 'ON_ORDER', 'OUT_OF_STOCK', 'DISCONTINUED']),
  priceMode: z.enum(['PUBLIC_EXACT', 'FROM_PRICE', 'LOGIN_REQUIRED', 'REQUEST_ONLY']),
  baseUnit: z.enum(['PIECE', 'METER', 'KILOGRAM', 'ROLL', 'LITER']),
  saleUnit: z.enum(['PIECE', 'PACK', 'CARTON', 'ROLL', 'KILOGRAM']),
  unitsPerPack: z.coerce.number().int().positive(),
  packsPerCarton: z.coerce.number().int().positive(),
  unitsPerCarton: z.coerce.number().int().positive(),
  minimumOrderQuantity: z.coerce.number().int().positive(),
  orderStep: z.coerce.number().int().positive(),
  publicPrice: z.coerce.number().nonnegative().nullable().optional(),
  purchasePrice: z.coerce.number().nonnegative().nullable().optional(),
  minimumAllowedPrice: z.coerce.number().nonnegative().nullable().optional(),
  resellerPrice: z.coerce.number().nonnegative().nullable().optional(),
  organizationPrice: z.coerce.number().nonnegative().nullable().optional(),
  originCountry: z.string().trim().max(100).nullable().optional(),
  name: localizedTextSchema,
  shortDescription: z.object({ uz: z.string().trim().max(1000), ru: z.string().trim().max(1000) }).strict().optional(),
  description: z.object({ uz: z.string().trim().max(20_000), ru: z.string().trim().max(20_000) }).strict().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isSeasonal: z.boolean().default(false),
  variants: z.array(variantSchema).max(100).default([]),
  priceTiers: z.array(tierSchema).max(100).default([]),
}).strict().superRefine((product, context) => {
  if (['PUBLIC_EXACT', 'FROM_PRICE'].includes(product.priceMode) && product.publicPrice == null) {
    context.addIssue({ code: 'custom', path: ['publicPrice'], message: 'Public price is required for this price mode' });
  }

  const skus = [product.sku, ...product.variants.map((variant) => variant.sku.toUpperCase())];
  if (new Set(skus.map((sku) => sku.toUpperCase())).size !== skus.length) {
    context.addIssue({ code: 'custom', path: ['variants'], message: 'Product and variant SKUs must be unique' });
  }

  const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);
  for (let index = 1; index < sortedTiers.length; index += 1) {
    const previous = sortedTiers[index - 1];
    const current = sortedTiers[index];
    if (previous.maxQuantity == null || previous.maxQuantity >= current.minQuantity) {
      context.addIssue({ code: 'custom', path: ['priceTiers'], message: 'Price tier ranges cannot overlap' });
      break;
    }
  }
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminProductInput = z.infer<typeof adminProductSchema>;
