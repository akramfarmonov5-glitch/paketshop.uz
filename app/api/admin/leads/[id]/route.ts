import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { adminLeadActivitySchema, adminLeadUpdateSchema } from '@/lib/validation/adminLead';

const roles = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] as const;

type RouteParams = { params: Promise<{ id: string }> };

const LOST_REASON_LABELS: Record<string, string> = {
  narx: 'Narx to‘g‘ri kelmadi',
  mahsulot_yoq: 'Mahsulot yo‘q',
  yetkazish: 'Yetkazish shartlari',
  javob_bermadi: 'Mijoz javob bermadi',
  raqobatchi: 'Raqobatchidan oldi',
  boshqa: 'Boshqa sabab',
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const parsed = adminLeadUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Lead topilmadi' }, { status: 404 });

    if (input.assignedToId) {
      const manager = await db.user.findUnique({ where: { id: input.assignedToId } });
      if (!manager?.active) return NextResponse.json({ error: 'Menejer topilmadi' }, { status: 400 });
    }

    const updated = await db.$transaction(async (transaction: any) => {
      const lead = await transaction.lead.update({
        where: { id },
        data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.status === 'LOST' ? { lostReason: input.lostReason } : input.status ? { lostReason: null } : {}),
          ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId } : {}),
        },
        include: {
          assignedTo: { select: { id: true, email: true, name: true } },
          activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
      });

      const notes: string[] = [];
      if (input.status && input.status !== existing.status) {
        notes.push(`Status: ${existing.status} → ${input.status}${input.status === 'LOST' && input.lostReason ? ` (${LOST_REASON_LABELS[input.lostReason] || input.lostReason})` : ''}`);
      }
      if (input.assignedToId !== undefined && input.assignedToId !== existing.assignedToId) {
        notes.push(input.assignedToId ? 'Mas‘ul menejer biriktirildi' : 'Mas‘ul menejer olib tashlandi');
      }
      for (const note of notes) {
        await transaction.leadActivity.create({ data: { leadId: id, type: 'STATUS', note } });
      }

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'LEAD_UPDATE',
          entityType: 'Lead',
          entityId: id,
          before: { status: existing.status, assignedToId: existing.assignedToId, lostReason: existing.lostReason },
          after: input,
          ip: request.headers.get('x-real-ip'),
        },
      });
      return lead;
    });

    return NextResponse.json({ lead: updated });
  } catch (error) {
    console.error('Admin lead update failed:', error);
    return NextResponse.json({ error: 'Leadni yangilab bo‘lmadi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const parsed = adminLeadActivitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Lead topilmadi' }, { status: 404 });

    const activity = await db.leadActivity.create({
      data: { leadId: id, type: 'NOTE', note: `${session.user.email || 'admin'}: ${parsed.data.note}` },
    });
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Admin lead activity failed:', error);
    return NextResponse.json({ error: 'Izoh saqlanmadi' }, { status: 500 });
  }
}
