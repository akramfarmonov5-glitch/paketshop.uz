import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  const params = await request.json();

  const click_trans_id = params.click_trans_id;
  const service_id = params.service_id;
  const click_paydoc_id = params.click_paydoc_id;
  const merchant_trans_id = params.merchant_trans_id;
  const amount = params.amount;
  const action = params.action;
  const error = params.error;
  const sign_time = params.sign_time;
  const sign_string = params.sign_string;

  const secret_key = process.env.CLICK_SECRET_KEY || 'sandbox_secret';

  const raw_sign = `${click_trans_id}${service_id}${click_paydoc_id}${merchant_trans_id}${amount}${action}${sign_time}${secret_key}`;
  const my_sign = crypto.createHash('md5').update(raw_sign).digest('hex');

  if (my_sign !== sign_string) {
    return NextResponse.json({ error: -1, error_note: 'Sign string mismatch' }, { status: 200 });
  }

  if (Number(error) < 0) {
    return NextResponse.json({ error: -9, error_note: 'Transaction error' }, { status: 200 });
  }

  try {
    const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('*').eq('id', merchant_trans_id).single();
    if (orderError || !order) {
      return NextResponse.json({ error: -5, error_note: 'Order not found' }, { status: 200 });
    }

    if (Math.abs(Number(order.total) - Number(amount)) > 0.01) {
      return NextResponse.json({ error: -2, error_note: 'Incorrect parameter amount' }, { status: 200 });
    }

    if (Number(action) === 0) {
      if (order.payment_status === 'Paid') {
        return NextResponse.json({ error: -4, error_note: 'Already paid' }, { status: 200 });
      }
      const { data: existingTx } = await supabaseAdmin.from('payment_transactions').select('*').eq('id', String(click_trans_id)).single();
      if (!existingTx) {
        await supabaseAdmin.from('payment_transactions').insert({ id: String(click_trans_id), order_id: merchant_trans_id, provider: 'click', amount: Number(amount), state: 1, create_time: Date.now() });
      }
      return NextResponse.json({ click_trans_id: Number(click_trans_id), merchant_trans_id: merchant_trans_id, error: 0, error_note: 'Success' }, { status: 200 });
    }

    if (Number(action) === 1) {
      const { error: updateError } = await supabaseAdmin.from('orders').update({ payment_status: 'Paid', transaction_id: String(click_trans_id), status: 'Tasdiqlandi' }).eq('id', merchant_trans_id);
      if (updateError) {
        return NextResponse.json({ error: -7, error_note: 'Failed to update order status' }, { status: 200 });
      }
      await supabaseAdmin.from('payment_transactions').update({ state: 2, perform_time: Date.now() }).eq('id', String(click_trans_id));
      return NextResponse.json({ click_trans_id: Number(click_trans_id), merchant_trans_id: merchant_trans_id, merchant_confirm_id: Number(click_paydoc_id), error: 0, error_note: 'Success' }, { status: 200 });
    }

    return NextResponse.json({ error: -3, error_note: 'Action not found' }, { status: 200 });
  } catch (err) {
    console.error('Click webhook handler error:', err);
    return NextResponse.json({ error: -8, error_note: 'Internal server error' }, { status: 200 });
  }
}
