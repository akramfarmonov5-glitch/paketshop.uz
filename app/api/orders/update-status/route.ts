import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSMS } from '@/lib/smsService';

export async function POST(request: NextRequest) {
  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing order id or status' }, { status: 400 });
  }

  try {
    // 1. Fetch the order details first to know the customer information
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;

    // 2. Update the status in the database using admin client
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update order status:", updateError);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // 3. Trigger SMS notification if status has changed and phone exists
    if (previousStatus !== status && order.phone) {
      const name = order.customerName || 'Mijoz';
      let message = '';

      if (status === 'Yetkazilmoqda') {
        message = `Hurmatli ${name}, sizning #${id} buyurtmangiz yo'lga chiqdi va tez orada yetkaziladi. PaketShop.uz`;
      } else if (status === 'Yakunlandi') {
        message = `Hurmatli ${name}, sizning #${id} buyurtmangiz muvaffaqiyatli topshirildi. Xaridingiz uchun rahmat! PaketShop.uz`;
      } else if (status === "To'landi") {
        message = `Hurmatli ${name}, sizning #${id} buyurtmangiz uchun to'lov qabul qilindi. PaketShop.uz`;
      }

      if (message) {
        await sendSMS(order.phone, message);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("SMS notify status update error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
