import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req, res) {
  // Click sends POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse parameters from both body and query for maximum compatibility
  const params = { ...req.query, ...req.body };

  const click_trans_id = params.click_trans_id;
  const service_id = params.service_id;
  const click_paydoc_id = params.click_paydoc_id;
  const merchant_trans_id = params.merchant_trans_id; // Our Order ID
  const amount = params.amount;
  const action = params.action;
  const error = params.error;
  const sign_time = params.sign_time;
  const sign_string = params.sign_string;

  // Read Click Secret Key from environment variables
  const secret_key = process.env.CLICK_SECRET_KEY || 'sandbox_secret';

  // 1. Signature Verification
  // Sign formula: md5(click_trans_id + service_id + click_paydoc_id + merchant_trans_id + amount + action + sign_time + secret_key)
  const raw_sign = `${click_trans_id}${service_id}${click_paydoc_id}${merchant_trans_id}${amount}${action}${sign_time}${secret_key}`;
  const my_sign = crypto.createHash('md5').update(raw_sign).digest('hex');

  if (my_sign !== sign_string) {
    return res.status(200).json({
      error: -1,
      error_note: 'Sign string mismatch'
    });
  }

  // 2. Check Click Error parameter
  if (Number(error) < 0) {
    return res.status(200).json({
      error: -9,
      error_note: 'Transaction error'
    });
  }

  try {
    // 3. Retrieve the corresponding order from Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', merchant_trans_id)
      .single();

    if (orderError || !order) {
      return res.status(200).json({
        error: -5,
        error_note: 'Order not found'
      });
    }

    // 4. Validate Amount
    if (Math.abs(Number(order.total) - Number(amount)) > 0.01) {
      return res.status(200).json({
        error: -2,
        error_note: 'Incorrect parameter amount'
      });
    }

    // 5. Click Prepare Action (action = 0)
    if (Number(action) === 0) {
      // Check if order is already paid
      if (order.payment_status === 'Paid') {
        return res.status(200).json({
          error: -4,
          error_note: 'Already paid'
        });
      }

      // Check if transaction exists in payment_transactions
      const { data: existingTx } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('id', String(click_trans_id))
        .single();

      if (!existingTx) {
        // Record Click transaction in database
        await supabaseAdmin.from('payment_transactions').insert({
          id: String(click_trans_id),
          order_id: merchant_trans_id,
          provider: 'click',
          amount: Number(amount),
          state: 1, // Created
          create_time: Date.now()
        });
      }

      return res.status(200).json({
        click_trans_id: Number(click_trans_id),
        merchant_trans_id: merchant_trans_id,
        error: 0,
        error_note: 'Success'
      });
    }

    // 6. Click Complete Action (action = 1)
    if (Number(action) === 1) {
      // Update order state to Paid
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'Paid',
          transaction_id: String(click_trans_id),
          status: 'Tasdiqlandi' // Change general order status to Approved
        })
        .eq('id', merchant_trans_id);

      if (updateError) {
        console.error("Order update failed:", updateError);
        return res.status(200).json({
          error: -7,
          error_note: 'Failed to update order status'
        });
      }

      // Update click transaction state in payment_transactions to Performed
      await supabaseAdmin
        .from('payment_transactions')
        .update({
          state: 2, // Performed
          perform_time: Date.now()
        })
        .eq('id', String(click_trans_id));

      // Return success response to Click
      return res.status(200).json({
        click_trans_id: Number(click_trans_id),
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: Number(click_paydoc_id),
        error: 0,
        error_note: 'Success'
      });
    }

    return res.status(200).json({
      error: -3,
      error_note: 'Action not found'
    });

  } catch (err) {
    console.error("Click webhook handler error:", err);
    return res.status(200).json({
      error: -8,
      error_note: 'Internal server error'
    });
  }
}
