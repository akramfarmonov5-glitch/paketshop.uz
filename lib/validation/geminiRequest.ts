import { z } from 'zod';

const historyEntrySchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(
    z.object({ text: z.string().trim().min(1).max(2_000) }).strict(),
  ).min(1).max(1),
}).strict();

export const geminiRequestSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
  history: z.array(historyEntrySchema).max(12).optional(),
  voiceMode: z.boolean().optional().default(false),
  // Admin-only generation controls.
  systemInstruction: z.string().trim().min(1).max(12_000).optional(),
  jsonMode: z.boolean().optional().default(false),
  // Public storefront context. It is embedded as untrusted data under a fixed
  // server-side system instruction and cannot replace that instruction.
  catalogContext: z.string().trim().max(12_000).optional(),
  customerName: z.string().trim().max(100).optional(),
  language: z.enum(['uz', 'ru', 'en']).optional().default('uz'),
}).strict();

export type GeminiRequest = z.infer<typeof geminiRequestSchema>;
