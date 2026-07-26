import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
const heroSchema = z.object({
  badge: z.string().max(5_000),
  title: z.string().max(10_000),
  description: z.string().max(20_000),
  buttonText: z.string().max(5_000),
  images: z.array(z.string().url().max(2_048).or(z.literal(''))).max(5),
}).strict();

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = heroSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;
  try {
    await db.$transaction(async (transaction) => {
      const before = await transaction.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`SELECT * FROM public.hero_content WHERE id = 2 LIMIT 1`,
      );
      const after = await transaction.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        INSERT INTO public.hero_content
          (id, badge, title, description, button_text, images, active)
        VALUES
          (2, ${input.badge}, ${input.title}, ${input.description}, ${input.buttonText}, ${input.images}, true)
        ON CONFLICT (id) DO UPDATE SET
          badge = EXCLUDED.badge,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          button_text = EXCLUDED.button_text,
          images = EXCLUDED.images
        RETURNING *
      `);
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'HERO_UPDATE',
          entityType: 'hero_content',
          entityId: '2',
          before: before[0] as Prisma.InputJsonObject | undefined,
          after: after[0] as Prisma.InputJsonObject,
          ip: request.headers.get('x-real-ip'),
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin hero save failed:', error);
    return NextResponse.json({ error: 'Bannerni saqlab bo‘lmadi' }, { status: 500 });
  }
}
