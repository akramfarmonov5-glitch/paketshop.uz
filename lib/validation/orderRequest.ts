import { z } from 'zod';

const touchSchema = z.object({
  source: z.string().trim().max(100).optional(),
  utm_source: z.string().trim().max(200).optional(),
  utm_medium: z.string().trim().max(200).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
  utm_content: z.string().trim().max(200).optional(),
  utm_term: z.string().trim().max(200).optional(),
  ref: z.string().trim().max(100).optional(),
  olx_ad_id: z.string().trim().max(100).optional(),
  product_code: z.string().trim().max(100).optional(),
  gclid: z.string().trim().max(200).optional(),
  landing_page: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(500).optional(),
  at: z.coerce.number().int().positive().optional(),
}).strict();

export const attributionSchema = touchSchema.extend({
  first: touchSchema.optional(),
  last: touchSchema.optional(),
}).strict();

export type AttributionInput = z.infer<typeof attributionSchema>;

export const orderRequestSchema = z.object({
  customerType: z.enum(['individual', 'entrepreneur', 'organization', 'reseller']).default('individual'),
  customerName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(9).max(40),
  telegram: z.string().trim().max(100).optional(),
  region: z.string().trim().min(2).max(120),
  address: z.string().trim().max(300).optional(),
  deliveryMethod: z.string().trim().max(100).default('manager_confirmation'),
  note: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(['cash', 'card_transfer', 'bank', 'terminal', 'other', 'click', 'payme', 'paynet']).default('cash'),
  promoCode: z.string().trim().max(40).optional(),
  locale: z.enum(['uz', 'ru']).default('uz'),
  items: z.array(z.object({
    productId: z.union([z.string().trim().min(1).max(120), z.number().int().positive()]).transform(String),
    quantity: z.coerce.number().int().positive().max(1_000_000),
    saleUnit: z.enum(['PIECE', 'PACK', 'CARTON', 'ROLL', 'KILOGRAM']).optional(),
    variantId: z.string().trim().min(1).max(120).optional(),
  }).strict()).min(1).max(100),
  attribution: attributionSchema.optional(),
  website: z.string().max(0).optional(),
  startedAt: z.coerce.number().int().positive().optional(),
}).strict();

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
