import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { adminRedirectUpdateSchema } from '@/lib/validation/adminRedirect';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const parsed = adminRedirectUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const existing = await db.redirect.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    const updated = await db.$transaction(async (transaction: any) => {
      const redirectRow = await transaction.redirect.update({ where: { id }, data: parsed.data });
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'REDIRECT_UPDATE',
          entityType: 'Redirect',
          entityId: id,
          before: { toPath: existing.toPath, statusCode: existing.statusCode, active: existing.active },
          after: parsed.data,
          ip: request.headers.get('x-real-ip'),
        },
      });
      return redirectRow;
    });
    return NextResponse.json({ redirect: updated });
  } catch (error) {
    console.error('Admin redirect update failed:', error);
    return NextResponse.json({ error: 'Yangilab bo‘lmadi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  try {
    const existing = await db.redirect.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    await db.$transaction(async (transaction: any) => {
      await transaction.redirect.delete({ where: { id } });
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'REDIRECT_DELETE',
          entityType: 'Redirect',
          entityId: id,
          before: { fromPath: existing.fromPath, toPath: existing.toPath },
          ip: request.headers.get('x-real-ip'),
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin redirect delete failed:', error);
    return NextResponse.json({ error: 'O‘chirib bo‘lmadi' }, { status: 500 });
  }
}
