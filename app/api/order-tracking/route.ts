import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hasAdminCredentials } from '../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  if (!hasAdminCredentials) {
    return NextResponse.json(
      { error: 'Order tracking server credentials are missing' },
      { status: 500 }
    );
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, customerName, phone, total, status, date, paymentMethod, items, created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const orders = (data || []).map((order) => ({
      ...order,
      total: Number(order.total || 0),
      items: Array.isArray(order.items) ? order.items : [],
    }));

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Order tracking API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
