import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeHeroContent } from '@/lib/siteSettings';
import { auditJson } from '@/lib/server/adminCatalogService';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { getHeroContentSetting } from '@/lib/server/siteSettings';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
const localizedTextSchema = z.object({
  uz: z.string().max(10_000),
  ru: z.string().max(10_000),
}).strict();
const imageSchema = z.string().trim().max(2_048).refine(
  (value) => !value || value.startsWith('/') || /^https:\/\//i.test(value),
  'Rasm manzili HTTPS yoki ichki manzil bo‘lishi kerak',
);
const heroSchema = z.object({
  badge: localizedTextSchema,
  title: localizedTextSchema,
  description: localizedTextSchema,
  buttonText: localizedTextSchema,
  images: z.array(imageSchema).max(5),
}).strict();

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ heroContent: await getHeroContentSetting() });
}

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

  const heroContent = normalizeHeroContent(parsed.data);
  try {
    await db.$transaction(async (transaction) => {
      const before = await transaction.siteSetting.findUnique({
        where: { key: 'hero_content' },
      });
      await transaction.siteSetting.upsert({
        where: { key: 'hero_content' },
        update: { value: heroContent as unknown as Prisma.InputJsonValue },
        create: {
          key: 'hero_content',
          value: heroContent as unknown as Prisma.InputJsonValue,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'HERO_UPDATE',
          entityType: 'SiteSetting',
          entityId: 'hero_content',
          before: before ? auditJson(before.value) : undefined,
          after: auditJson(heroContent),
          ip: request.headers.get('x-real-ip'),
        },
      });
    });
    revalidatePath('/uz');
    revalidatePath('/ru');
    return NextResponse.json({ success: true, heroContent });
  } catch (error) {
    console.error('Admin hero save failed:', error);
    return NextResponse.json({ error: 'Bannerni saqlab bo‘lmadi' }, { status: 500 });
  }
}
