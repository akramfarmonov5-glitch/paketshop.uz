import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
const seoSchema = z.object({
  title: z.string().max(5_000),
  description: z.string().max(10_000),
  keywords: z.string().max(5_000),
}).strict();
const blogSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().min(2).max(5_000),
  slug: z.string().min(2).max(2_000),
  image: z.string().max(2_048),
  content: z.string().min(2).max(500_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seo: seoSchema,
}).strict();

function keywordArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    const source = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object'
        ? Object.values(parsed)
        : [];
    return source
      .filter((keyword): keyword is string => typeof keyword === 'string')
      .map((keyword) => keyword.trim().slice(0, 200))
      .filter(Boolean)
      .slice(0, 50);
  } catch {
    return [];
  }
}

function serializePost(row: Record<string, unknown>) {
  return {
    ...row,
    id: Number(row.id),
    seo: {
      title: row.seo_title,
      description: row.seo_description,
      keywords: row.seo_keywords,
    },
  };
}

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const rows = await db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      SELECT *
      FROM public.blog_posts
      ORDER BY date DESC, id DESC
      LIMIT 200
    `);
    return NextResponse.json({ posts: rows.map(serializePost) });
  } catch (error) {
    console.error('Admin blog load failed:', error);
    return NextResponse.json({ error: 'Maqolalarni yuklab bo‘lmadi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = blogSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const keywords = keywordArray(input.seo.keywords);

  try {
    const post = await db.$transaction(async (transaction) => {
      const beforeRows = input.id
        ? await transaction.$queryRaw<Array<Record<string, unknown>>>(
          Prisma.sql`SELECT * FROM public.blog_posts WHERE id = ${input.id} LIMIT 1`,
        )
        : [];

      const rows = input.id
        ? await transaction.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
            UPDATE public.blog_posts
            SET title = ${input.title},
                slug = ${input.slug},
                image = ${input.image},
                content = ${input.content},
                date = ${input.date},
                seo_title = ${input.seo.title},
                seo_description = ${input.seo.description},
                seo_keywords = ${keywords}
            WHERE id = ${input.id}
            RETURNING *
          `)
        : await transaction.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
            INSERT INTO public.blog_posts
              (title, slug, image, content, date, seo_title, seo_description, seo_keywords)
            VALUES
              (${input.title}, ${input.slug}, ${input.image}, ${input.content}, ${input.date},
               ${input.seo.title}, ${input.seo.description}, ${keywords})
            RETURNING *
          `);

      if (!rows[0]) throw new Error('BLOG_NOT_FOUND');
      const saved = serializePost(rows[0]);
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: input.id ? 'BLOG_UPDATE' : 'BLOG_CREATE',
          entityType: 'blog_posts',
          entityId: String(saved.id),
          before: beforeRows[0] ? serializePost(beforeRows[0]) as Prisma.InputJsonObject : undefined,
          after: saved as Prisma.InputJsonObject,
          ip: request.headers.get('x-real-ip'),
        },
      });
      return saved;
    });

    revalidatePath('/uz/blog');
    revalidatePath('/ru/blog');
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ post }, { status: input.id ? 200 : 201 });
  } catch (error) {
    console.error('Admin blog save failed:', error);
    return NextResponse.json({ error: 'Maqolani saqlab bo‘lmadi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = z.coerce.number().int().positive().safeParse(request.nextUrl.searchParams.get('id'));
  if (!id.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const deleted = await db.$transaction(async (transaction) => {
      const rows = await transaction.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.sql`DELETE FROM public.blog_posts WHERE id = ${id.data} RETURNING *`,
      );
      if (!rows[0]) return null;
      const before = serializePost(rows[0]);
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'BLOG_DELETE',
          entityType: 'blog_posts',
          entityId: String(id.data),
          before: before as Prisma.InputJsonObject,
          ip: request.headers.get('x-real-ip'),
        },
      });
      return before;
    });
    if (deleted) {
      revalidatePath('/uz/blog');
      revalidatePath('/ru/blog');
      revalidatePath('/sitemap.xml');
    }
    return deleted
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Admin blog delete failed:', error);
    return NextResponse.json({ error: 'Maqolani o‘chirib bo‘lmadi' }, { status: 500 });
  }
}
