import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSMS } from '@/lib/smsService';

export async function POST(request: NextRequest) {
  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Trigger SMS notification for Cash purchases
    if (order.paymentMethod === 'Naqd' && order.phone) {
      const name = order.customerName || 'Mijoz';
      const msg = `Hurmatli ${name}, sizning #${orderId} buyurtmangiz qabul qilindi (Naqd to'lov). Tez orada menejerimiz bog'lanadi. PaketShop.uz`;
      await sendSMS(order.phone, msg);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SMS notify-order error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
