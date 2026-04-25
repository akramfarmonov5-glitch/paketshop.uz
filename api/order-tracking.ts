import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Order tracking server credentials are missing' });
  }

  const { phone } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: 'Phone is required' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('orders')
      .select('id, customerName, phone, total, status, date, paymentMethod, items, created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    const orders = (data || []).map((order) => ({
      ...order,
      total: Number(order.total || 0),
      items: Array.isArray(order.items) ? order.items : [],
    }));

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Order tracking API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
