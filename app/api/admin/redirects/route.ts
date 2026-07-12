import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { adminRedirectSchema } from '@/lib/validation/adminRedirect';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const redirects = await db.redirect.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  return NextResponse.json({ redirects });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = adminRedirectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const created = await db.$transaction(async (transaction: any) => {
      const redirectRow = await transaction.redirect.create({ data: input });
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'REDIRECT_CREATE',
          entityType: 'Redirect',
          entityId: redirectRow.id,
          after: input,
          ip: request.headers.get('x-real-ip'),
        },
      });
      return redirectRow;
    });
    return NextResponse.json({ redirect: created }, { status: 201 });
  } catch (error) {
    console.error('Admin redirect create failed:', error);
    return NextResponse.json({ error: 'Bu fromPath uchun redirect allaqachon mavjud' }, { status: 409 });
  }
}
