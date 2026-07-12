import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { LEAD_STATUSES } from '@/lib/validation/adminLead';
import type { LeadStatus, LeadType, Prisma } from '@prisma/client';

const roles = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] as const;
const LEAD_TYPES = ['CONTACT', 'WHOLESALE', 'ORGANIZATION', 'RESELLER', 'PRODUCT_REQUEST'] as const;

export async function GET(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const params = request.nextUrl.searchParams;
  const statusParam = params.get('status') || '';
  const typeParam = params.get('type') || '';
  const search = (params.get('q') || '').trim().slice(0, 100);
  const status = (LEAD_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as LeadStatus) : undefined;
  const type = (LEAD_TYPES as readonly string[]).includes(typeParam) ? (typeParam as LeadType) : undefined;

  const where: Prisma.LeadWhereInput = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  try {
    const [leads, managers, statusCounts] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          assignedTo: { select: { id: true, email: true, name: true } },
          activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
      }),
      db.user.findMany({
        where: { active: true, roles: { some: { role: { code: { in: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] } } } } },
        select: { id: true, email: true, name: true },
        orderBy: { email: 'asc' },
      }),
      db.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    return NextResponse.json({
      leads,
      managers,
      statusCounts: Object.fromEntries(statusCounts.map((entry) => [entry.status, entry._count._all])),
    });
  } catch (error) {
    console.error('Admin leads list failed:', error);
    return NextResponse.json({ error: 'Leadlarni yuklab bo‘lmadi' }, { status: 500 });
  }
}
