import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSMS } from '@/lib/smsService';
import { checkRateLimit } from '@/lib/rateLimit';

const notifiedOrders = new Set<string>();

export async function POST(request: NextRequest) {
  // 1. Get client IP address
  const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 2. Limit to 3 requests per 60 minutes (1 hour) per IP
  const rateLimit = checkRateLimit(`sms-notify:${ip}`, 3, 60 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Siz juda ko'p so'rov yubordingiz. Iltimos, birozdan keyin qayta urining." },
      { status: 429 }
    );
  }

  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  // 3. Prevent duplicate notifications for the same order ID
  if (notifiedOrders.has(String(orderId))) {
    return NextResponse.json({ error: 'Notification already sent for this order' }, { status: 400 });
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

    notifiedOrders.add(String(orderId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SMS notify-order error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
