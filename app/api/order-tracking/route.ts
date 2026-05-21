import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hasAdminCredentials } from '../../../lib/supabaseAdmin';
import { checkRateLimit } from '../../../lib/rateLimit';

function normalizePhone(phone: unknown): string {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.length === 9) return `998${digits}`;
  return digits;
}

function buildPhoneCandidates(phone: unknown): string[] {
  const raw = String(phone || '').trim();
  const normalized = normalizePhone(raw);
  const local = normalized.startsWith('998') ? normalized.slice(3) : normalized;
  return Array.from(new Set([
    raw,
    normalized,
    local,
    normalized ? `+${normalized}` : '',
  ].filter(Boolean)));
}

export async function POST(req: NextRequest) {
  if (!hasAdminCredentials) {
    return NextResponse.json(
      { error: 'Order tracking server credentials are missing' },
      { status: 500 }
    );
  }

  const ip = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimit = checkRateLimit(`order-tracking:${ip}`, 10, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Siz juda ko'p so'rov yubordingiz. Iltimos, birozdan keyin qayta urining." },
      { status: 429 }
    );
  }

  try {
    const { phone } = await req.json();
    const phoneCandidates = buildPhoneCandidates(phone);

    if (!phone || normalizePhone(phone).length < 9) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, customerName, total, status, date, paymentMethod, items, created_at')
      .in('phone', phoneCandidates)
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
