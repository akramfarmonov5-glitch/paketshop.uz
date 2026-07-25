import fs from 'node:fs';
import path from 'node:path';
import { db } from './db';
import { E2E_ADMIN_EMAIL, E2E_MARKER, E2E_REDIRECT_FROM } from './fixtures';

/**
 * Dev server hali ishlab turgan bo'lsa Supabase pooler ulanishlari band bo'ladi —
 * tozalash bo'sh ulanish paydo bo'lguncha bir necha marta urinadi.
 */
async function withRetry<T>(operation: () => Promise<T>, attempts = 6): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!String(error).includes('EMAXCONNSESSION')) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
  }
  throw lastError;
}

export default async function globalTeardown(): Promise<void> {
  // Testlar yaratgan buyurtma va leadlarni o'chiramiz — haqiqiy ma'lumotlarga tegilmaydi.
  const orders = await withRetry(() =>
    db.order.findMany({ where: { customerName: { contains: E2E_MARKER } }, select: { id: true } }));
  if (orders.length) {
    const orderIds = orders.map((order) => order.id);
    await db.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
    await db.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await db.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  const leads = await db.lead.findMany({ where: { name: { contains: E2E_MARKER } }, select: { id: true } });
  if (leads.length) {
    const leadIds = leads.map((lead) => lead.id);
    await db.leadActivity.deleteMany({ where: { leadId: { in: leadIds } } });
    await db.lead.deleteMany({ where: { id: { in: leadIds } } });
  }

  await db.redirect.deleteMany({ where: { fromPath: E2E_REDIRECT_FROM } });
  await db.searchQuery.deleteMany({ where: { query: { contains: E2E_MARKER.toLowerCase() } } });

  await db.auditLog.deleteMany({ where: { actor: { email: E2E_ADMIN_EMAIL } } });
  await db.userRole.deleteMany({ where: { user: { email: E2E_ADMIN_EMAIL } } });
  await db.user.deleteMany({ where: { email: E2E_ADMIN_EMAIL } });

  fs.rmSync(path.join(process.cwd(), 'e2e', '.auth'), { recursive: true, force: true });

  console.log(`E2E teardown: ${orders.length} buyurtma, ${leads.length} lead va test admin o'chirildi.`);
  await db.$disconnect();
}
