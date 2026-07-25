import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const jobs = await db.importJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      filename: true,
      status: true,
      totalRows: true,
      successRows: true,
      errorRows: true,
      rolledBackAt: true,
      createdAt: true,
      // rollbackData katta bo'lishi mumkin — ro'yxatda faqat mavjudligini bilish kifoya.
      _count: { select: { errors: true } },
    },
  });

  const rollbackable = await db.importJob.findMany({
    where: { status: 'COMPLETED', rolledBackAt: null, rollbackData: { not: Prisma.DbNull } },
    select: { id: true },
  });
  const rollbackableIds = new Set(rollbackable.map((job) => job.id));

  return NextResponse.json({
    jobs: jobs.map((job) => ({ ...job, canRollback: rollbackableIds.has(job.id) })),
  });
}
