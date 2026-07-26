import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'WAREHOUSE_VIEWER'] as const;

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 6);

  try {
    const [orderSummary, orderCount, customerCount, productCount, recentOrders, categories] = await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      db.order.count(),
      db.customer.count(),
      db.product.count({ where: { status: { not: 'ARCHIVED' } } }),
      db.order.findMany({
        where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
        select: { createdAt: true, total: true },
      }),
      db.category.findMany({
        where: { active: true },
        select: {
          id: true,
          translations: { select: { locale: true, name: true } },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
        take: 12,
      }),
    ]);

    const salesByDate = new Map<string, number>();
    for (const order of recentOrders) {
      const date = order.createdAt.toISOString().slice(0, 10);
      salesByDate.set(date, (salesByDate.get(date) || 0) + Number(order.total || 0));
    }
    const sales = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(since);
      date.setUTCDate(since.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, sales: salesByDate.get(key) || 0 };
    });

    return NextResponse.json({
      totalSales: Number(orderSummary._sum.total || 0),
      orderCount,
      customerCount,
      productCount,
      sales,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.translations.find((translation) => translation.locale === 'uz')?.name
          || category.translations[0]?.name
          || category.id,
        count: category._count.products,
      })),
    });
  } catch (error) {
    console.error('Admin dashboard load failed:', error);
    return NextResponse.json({ error: 'Statistikani yuklab bo‘lmadi' }, { status: 500 });
  }
}
