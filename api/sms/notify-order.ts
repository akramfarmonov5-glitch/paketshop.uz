import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { sendSMS } from '../../lib/smsService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderId } = req.body || {};

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Trigger SMS notification for Cash purchases
    if (order.paymentMethod === 'Naqd' && order.phone) {
      const name = order.customerName || 'Mijoz';
      const msg = `Hurmatli ${name}, sizning #${orderId} buyurtmangiz qabul qilindi (Naqd to'lov). Tez orada menejerimiz bog'lanadi. PaketShop.uz`;
      await sendSMS(order.phone, msg);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SMS notify-order error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
