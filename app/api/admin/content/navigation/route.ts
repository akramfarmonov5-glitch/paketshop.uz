import { Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeNavigationSettings } from '@/lib/siteSettings';
import { auditJson } from '@/lib/server/adminCatalogService';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { getNavigationSettingsSetting } from '@/lib/server/siteSettings';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
const menuLabelSchema = z.string().trim().min(1).max(5_000);
const menuHrefSchema = z.string().trim().max(2_048).refine(
  (value) => value.startsWith('/') || value.startsWith('#') || /^https:\/\//i.test(value),
  'Havola HTTPS, ichki yo‘l yoki # bilan boshlanishi kerak',
);
const localizedTextSchema = z.object({
  uz: menuLabelSchema,
  ru: menuLabelSchema,
}).strict();
const localizedHrefSchema = z.object({
  uz: menuHrefSchema,
  ru: menuHrefSchema,
}).strict();
const menuItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  label: z.union([menuLabelSchema, localizedTextSchema]),
  href: z.union([menuHrefSchema, localizedHrefSchema]),
}).strict();
const socialLinkSchema = z.object({
  id: z.union([z.string(), z.number()]),
  platform: z.enum(['instagram', 'telegram', 'facebook', 'youtube', 'twitter']),
  url: z.string().url().max(2_048).refine(
    (value) => /^https:\/\//i.test(value),
    'Ijtimoiy tarmoq havolasi HTTPS bo‘lishi kerak',
  ),
}).strict();
const navigationSchema = z.object({
  menuItems: z.array(menuItemSchema).max(100),
  socialLinks: z.array(socialLinkSchema).max(50),
}).strict();

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [navigationSettings, categories] = await Promise.all([
    getNavigationSettingsSetting(),
    db.category.findMany({
      where: { active: true },
      include: { translations: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  return NextResponse.json({
    navigationSettings,
    categories: categories.map((category) => ({
      id: category.id,
      name: {
        uz: category.translations.find((translation) => translation.locale === 'uz')?.name
          || category.slugUz,
        ru: category.translations.find((translation) => translation.locale === 'ru')?.name
          || category.slugRu,
      },
      slug: { uz: category.slugUz, ru: category.slugRu },
    })),
  });
}

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

  const navigationSettings = normalizeNavigationSettings(parsed.data);
  try {
    await db.$transaction(async (transaction) => {
      const before = await transaction.siteSetting.findUnique({
        where: { key: 'navigation_settings' },
      });
      await transaction.siteSetting.upsert({
        where: { key: 'navigation_settings' },
        update: { value: navigationSettings as unknown as Prisma.InputJsonValue },
        create: {
          key: 'navigation_settings',
          value: navigationSettings as unknown as Prisma.InputJsonValue,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'NAVIGATION_UPDATE',
          entityType: 'SiteSetting',
          entityId: 'navigation_settings',
          before: before ? auditJson(before.value) : undefined,
          after: auditJson(navigationSettings),
          ip: request.headers.get('x-real-ip'),
        },
      });
    });
    revalidateTag('site-settings', { expire: 0 });
    revalidatePath('/uz', 'layout');
    revalidatePath('/ru', 'layout');
    return NextResponse.json({ success: true, navigationSettings });
  } catch (error) {
    console.error('Admin navigation save failed:', error);
    return NextResponse.json({ error: 'Navigatsiyani saqlab bo‘lmadi' }, { status: 500 });
  }
}
