import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
const menuItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  label: z.unknown(),
  href: z.string().max(2_048),
}).passthrough();
const socialLinkSchema = z.object({
  id: z.union([z.string(), z.number()]),
  platform: z.string().max(100),
  url: z.string().max(2_048),
}).passthrough();
const navigationSchema = z.object({
  menuItems: z.array(menuItemSchema).max(100),
  socialLinks: z.array(socialLinkSchema).max(50),
}).strict();

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = navigationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await db.$transaction(async (transaction) => {
      const before = await transaction.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`SELECT * FROM public.navigation_settings WHERE id = 2 LIMIT 1`,
      );
      const menuItems = JSON.stringify(parsed.data.menuItems);
      const socialLinks = JSON.stringify(parsed.data.socialLinks);
      const after = await transaction.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        INSERT INTO public.navigation_settings (id, menu_items, social_links)
        VALUES (2, ${menuItems}::jsonb, ${socialLinks}::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          menu_items = EXCLUDED.menu_items,
          social_links = EXCLUDED.social_links
        RETURNING *
      `);
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'NAVIGATION_UPDATE',
          entityType: 'navigation_settings',
          entityId: '2',
          before: before[0] as Prisma.InputJsonObject | undefined,
          after: after[0] as Prisma.InputJsonObject,
          ip: request.headers.get('x-real-ip'),
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin navigation save failed:', error);
    return NextResponse.json({ error: 'Navigatsiyani saqlab bo‘lmadi' }, { status: 500 });
  }
}
