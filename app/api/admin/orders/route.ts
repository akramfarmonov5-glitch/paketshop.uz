import { OrderStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { sendSMS } from '@/lib/smsService';

const roles = ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] as const;
const updateSchema = z.object({
  id: z.string().trim().min(1).max(120),
  status: z.nativeEnum(OrderStatus).optional(),
  assignedToId: z.string().trim().min(1).max(120).nullable().optional(),
  note: z.string().trim().max(500).optional(),
}).strict().refine((value) => value.status !== undefined || value.assignedToId !== undefined, { message: 'No changes supplied' });

const orderInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  items: { select: { id: true, skuSnapshot: true, nameSnapshotUz: true, quantity: true, saleUnit: true, unitPrice: true, lineTotal: true } },
  history: { orderBy: { createdAt: 'desc' as const }, take: 8 },
};

function serializeOrder(order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>) {
  return {
    ...order,
    subtotal: order.subtotal == null ? null : Number(order.subtotal),
    deliveryAmount: order.deliveryAmount == null ? null : Number(order.deliveryAmount),
    total: order.total == null ? null : Number(order.total),
    items: order.items.map((item) => ({ ...item, unitPrice: item.unitPrice == null ? null : Number(item.unitPrice), lineTotal: item.lineTotal == null ? null : Number(item.lineTotal) })),
  };
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize') || 50)));
  const query = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 100);
  const status = request.nextUrl.searchParams.get('status');
  const where: Prisma.OrderWhereInput = {};
  if (query) where.OR = [{ number: { contains: query, mode: 'insensitive' } }, { customerName: { contains: query, mode: 'insensitive' } }, { phone: { contains: query } }];
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) where.status = status as OrderStatus;

  try {
    const [orders, total, managers] = await Promise.all([
      db.order.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      db.order.count({ where }),
      db.user.findMany({ where: { active: true, roles: { some: { role: { code: { in: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] } } } } }, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }),
    ]);
    return NextResponse.json({ orders: orders.map(serializeOrder), managers, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) {
    console.error('Admin orders list failed:', error);
    return NextResponse.json({ error: 'Buyurtmalarni yuklab bo‘lmadi' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });

  try {
    const current = await db.order.findUnique({ where: { id: parsed.data.id } });
    if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (parsed.data.assignedToId) {
      const manager = await db.user.findFirst({ where: { id: parsed.data.assignedToId, active: true, roles: { some: { role: { code: { in: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] } } } } } });
      if (!manager) return NextResponse.json({ error: 'Manager not found' }, { status: 400 });
    }

    const order = await db.$transaction(async (transaction: any) => {
      const updated = await transaction.order.update({ where: { id: current.id }, data: { status: parsed.data.status, assignedToId: parsed.data.assignedToId }, include: orderInclude });
      if (parsed.data.status && parsed.data.status !== current.status) await transaction.orderStatusHistory.create({ data: { orderId: current.id, status: parsed.data.status, note: parsed.data.note, actorId: session.user.id } });
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'ORDER_UPDATE', entityType: 'Order', entityId: current.id, before: { status: current.status, assignedToId: current.assignedToId } as Prisma.InputJsonObject, after: { status: updated.status, assignedToId: updated.assignedToId } as Prisma.InputJsonObject, ip: request.headers.get('x-real-ip') } });
      return updated;
    });

    const messages: Partial<Record<OrderStatus, string>> = {
      CONFIRMED: `Hurmatli ${current.customerName}, #${current.number} buyurtma so‘rovingiz tasdiqlandi. PaketShop.uz`,
      SHIPPED: `Hurmatli ${current.customerName}, #${current.number} buyurtmangiz yo‘lga chiqdi. PaketShop.uz`,
      DELIVERED: `Hurmatli ${current.customerName}, #${current.number} buyurtmangiz topshirildi. Rahmat! PaketShop.uz`,
    };
    const sms = parsed.data.status ? messages[parsed.data.status] : undefined;
    if (sms) { try { await sendSMS(current.phone, sms); } catch (smsError) { console.error('Order updated but SMS failed:', smsError); } }
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error('Admin order update failed:', error);
    return NextResponse.json({ error: 'Buyurtmani yangilab bo‘lmadi' }, { status: 500 });
  }
}
