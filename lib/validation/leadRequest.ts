import { z } from 'zod';
import { attributionSchema } from '@/lib/validation/orderRequest';

export const LEAD_TYPES = ['chat', 'contact', 'wholesale', 'organization', 'reseller', 'product_request'] as const;

export const leadRequestSchema = z.object({
  type: z.enum(LEAD_TYPES).default('contact'),
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(9).max(40),
  email: z.string().trim().email().max(200).optional(),
  telegram: z.string().trim().max(100).optional(),
  city: z.string().trim().max(120).optional(),
  note: z.string().trim().max(1000).optional(),
  organizationName: z.string().trim().max(200).optional(),
  tin: z.string().trim().regex(/^\d{9}$/, 'STIR 9 ta raqamdan iborat bo‘lishi kerak').optional(),
  bankPayment: z.boolean().optional(),
  contractNeeded: z.boolean().optional(),
  tradePlace: z.string().trim().max(200).optional(),
  monthlyVolume: z.string().trim().max(200).optional(),
  categories: z.string().trim().max(300).optional(),
  products: z.string().trim().max(500).optional(),
  locale: z.enum(['uz', 'ru']).default('uz'),
  attribution: attributionSchema.optional(),
  website: z.string().max(0).optional(),
  startedAt: z.coerce.number().int().positive().optional(),
}).strict();

export type LeadRequestInput = z.infer<typeof leadRequestSchema>;
