import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { db } from '@/lib/server/db';
import { hasAdminCredentials, supabaseAdmin } from '@/lib/supabaseAdmin';

function normalizePhone(phone: unknown): string {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 9) return `998${digits}`;
  return digits;
}

function buildPhoneCandidates(phone: unknown): string[] {
  const raw = String(phone || '').trim();
  const normalized = normalizePhone(raw);
  const local = normalized.startsWith('998') ? normalized.slice(3) : normalized;
  return Array.from(
    new Set(
      [
        raw,
        normalized,
        local,
        normalized ? `+${normalized}` : '',
      ].filter(Boolean),
    ),
  );
}

export async function POST(req: NextRequest) {
  const ip =
    (req as any).ip ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';
  const rateLimit = checkRateLimit(`order-tracking:${ip}`, 15, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Siz juda ko'p so'rov yubordingiz. Iltimos, birozdan keyin qayta urining." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.phone || body.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Telefon raqami yoki buyurtma kodi kiritilmadi' }, { status: 400 });
    }

    const phoneCandidates = buildPhoneCandidates(query);
    const isOrderNumberQuery = query.toUpperCase().startsWith('PS-') || query.includes('-');

    // 1. Prisma PostgreSQL dan qidirish (Asosiy manba)
    const prismaOrders = await db.order.findMany({
      where: isOrderNumberQuery
        ? {
            OR: [
              { number: { equals: query, mode: 'insensitive' } },
              { id: { equals: query } },
            ],
          }
        : {
            phone: { in: phoneCandidates },
          },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    if (prismaOrders.length > 0) {
      const orders = prismaOrders.map((order) => ({
        id: order.id,
        number: order.number,
        customerName: order.customerName,
        phone: order.phone,
        total: Number(order.total || order.subtotal || 0),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        date: order.createdAt.toISOString().split('T')[0],
        paymentMethod: order.preferredPaymentMethod || 'Kelishiladi',
        deliveryMethod: order.deliveryMethod,
        region: order.region,
        address: order.address,
        items: order.items.map((item) => ({
          id: item.id,
          name: { uz: item.nameSnapshotUz, ru: item.nameSnapshotRu },
          sku: item.skuSnapshot,
          quantity: item.quantity,
          saleUnit: item.saleUnit,
          unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
          lineTotal: item.lineTotal ? Number(item.lineTotal) : null,
        })),
      }));

      return NextResponse.json({ orders });
    }

    // 2. Agar Prisma'da topilmasa va Supabase mavjud bo'lsa, legacy qidiruv
    if (hasAdminCredentials) {
      const { data: legacyData, error: legacyError } = await supabaseAdmin
        .from('orders')
        .select('id, customerName, total, status, date, paymentMethod, items, created_at')
        .in('phone', phoneCandidates)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!legacyError && legacyData && legacyData.length > 0) {
        const legacyOrders = legacyData.map((order) => ({
          id: String(order.id),
          number: String(order.id),
          customerName: order.customerName || 'Mijoz',
          total: Number(order.total || 0),
          status: order.status || 'NEW',
          createdAt: order.created_at || order.date,
          date: order.date || String(order.created_at || '').split('T')[0],
          paymentMethod: order.paymentMethod || 'Kelishiladi',
          items: Array.isArray(order.items)
            ? order.items.map((item: any) => ({
                id: item.id || 'legacy',
                name: item.name,
                quantity: Number(item.quantity || 1),
                saleUnit: 'PACK',
                unitPrice: Number(item.price || 0),
                lineTotal: Number((item.price || 0) * (item.quantity || 1)),
              }))
            : [],
        }));

        return NextResponse.json({ orders: legacyOrders });
      }
    }

    return NextResponse.json({ orders: [] });
  } catch (error: any) {
    console.error('Order tracking API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Serverda xatolik yuz berdi' },
      { status: 500 },
    );
  }
}
