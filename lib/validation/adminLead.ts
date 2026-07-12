import { z } from 'zod';

export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'] as const;

export const LOST_REASONS = [
  'narx',
  'mahsulot_yoq',
  'yetkazish',
  'javob_bermadi',
  'raqobatchi',
  'boshqa',
] as const;

export const adminLeadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  lostReason: z.enum(LOST_REASONS).optional(),
  assignedToId: z.string().trim().min(1).max(120).nullable().optional(),
}).strict().refine(
  (value) => value.status !== 'LOST' || Boolean(value.lostReason),
  { message: 'LOST statusi uchun sabab majburiy', path: ['lostReason'] },
);

export const adminLeadActivitySchema = z.object({
  note: z.string().trim().min(1).max(1000),
}).strict();

export type AdminLeadUpdateInput = z.infer<typeof adminLeadUpdateSchema>;
