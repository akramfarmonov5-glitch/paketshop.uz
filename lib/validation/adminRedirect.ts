import { z } from 'zod';
import { normalizeRedirectPath } from '@/lib/domain/redirects';

const pathField = z.string().trim().min(1).max(500)
  .transform((value) => normalizeRedirectPath(value))
  .refine((value) => value.startsWith('/'), 'Yo‘l / bilan boshlanishi kerak');

export const adminRedirectSchema = z.object({
  fromPath: pathField.refine((value) => value !== '/', 'Bosh sahifadan redirect qilib bo‘lmaydi'),
  toPath: pathField,
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(410)]).default(301),
  active: z.boolean().default(true),
}).strict().refine((value) => value.fromPath !== value.toPath, {
  message: 'fromPath va toPath bir xil bo‘lishi mumkin emas',
  path: ['toPath'],
});

export const adminRedirectUpdateSchema = z.object({
  toPath: pathField.optional(),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(410)]).optional(),
  active: z.boolean().optional(),
}).strict();

export type AdminRedirectInput = z.infer<typeof adminRedirectSchema>;
