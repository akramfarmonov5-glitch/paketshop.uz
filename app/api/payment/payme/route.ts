import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { jsonrpc, method, params, id } = body || {};

  // Basic validation of JSON-RPC format
  if (jsonrpc !== '2.0' || !method) {
    return NextResponse.json({ error: 'Invalid JSON-RPC request' }, { status: 400 });
  }

  // 1. HTTP Basic Authorization Check
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32504, message: 'Missing Authorization header' }
    }, { status: 200 });
  }

  const base64Auth = authHeader.split(' ')[1];
  const decodedAuth = Buffer.from(base64Auth, 'base64').toString('ascii');
  const [username, password] = decodedAuth.split(':');

  const paymeSecret = process.env.PAYME_SECRET_KEY || 'sandbox_secret';
  if (!safeEqual(username || '', 'Paycom') || !safeEqual(password || '', paymeSecret)) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32504, message: 'Invalid credentials' }
    }, { status: 200 });
  }

  try {
    // ----------------------------------------------------
    // Method: CheckPerformTransaction
    // ----------------------------------------------------
    if (method === 'CheckPerformTransaction') {
      const orderId = params?.account?.order_id;
      const amountInTiyins = params?.amount;

      if (!orderId) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31050, message: { uz: 'Buyurtma topilmadi', ru: 'Заказ не найден', en: 'Order not found' } }
        }, { status: 200 });
      }

      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31050, message: { uz: 'Buyurtma topilmadi', ru: 'Заказ не найден', en: 'Order not found' } }
        }, { status: 200 });
      }

      // Payme amount is in tiyins (1 UZS = 100 tiyins)
      if (Number(order.total) * 100 !== Number(amountInTiyins)) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31001, message: { uz: 'Noto\'g\'ri to\'lov miqdori', ru: 'Неверная сумма', en: 'Incorrect amount' } }
        }, { status: 200 });
      }

      if (order.payment_status === 'Paid') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31099, message: { uz: 'Buyurtma allaqachon to\'langan', ru: 'Заказ уже оплачен', en: 'Order already paid' } }
        }, { status: 200 });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: { allow: true }
      }, { status: 200 });
    }

    // ----------------------------------------------------
    // Method: CreateTransaction
    // ----------------------------------------------------
    if (method === 'CreateTransaction') {
      const transId = params?.id;
      const orderId = params?.account?.order_id;
      const amountInTiyins = params?.amount;
      const createTime = params?.time;

      if (!transId || !orderId) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Invalid parameters' }
        }, { status: 200 });
      }

      // Check if order exists
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31050, message: { uz: 'Buyurtma topilmadi', ru: 'Заказ не найден', en: 'Order not found' } }
        }, { status: 200 });
      }

      if (Number(order.total) * 100 !== Number(amountInTiyins)) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31001, message: { uz: 'Noto\'g\'ri to\'lov miqdori', ru: 'Неверная сумма', en: 'Incorrect amount' } }
        }, { status: 200 });
      }

      // Check for any existing transactions for this order
      const { data: existingTx } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (existingTx) {
        // If there's an existing transaction with a DIFFERENT ID, and it's active or performed
        if (existingTx.id !== transId) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -31099, message: { uz: 'Boshqa tranzaksiya mavjud', ru: 'Существует другая транзакция', en: 'Another transaction exists' } }
          }, { status: 200 });
        }

        // If it exists with the SAME ID, return its status
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            create_time: Number(existingTx.create_time),
            transaction: existingTx.id,
            state: existingTx.state
          }
        }, { status: 200 });
      }

      // Create new transaction in db (state = 1: Active)
      await supabaseAdmin.from('payment_transactions').insert({
        id: transId,
        order_id: orderId,
        provider: 'payme',
        amount: Number(amountInTiyins) / 100, // UZS
        state: 1,
        create_time: Number(createTime)
      });

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          create_time: Number(createTime),
          transaction: transId,
          state: 1
        }
      }, { status: 200 });
    }

    // ----------------------------------------------------
    // Method: PerformTransaction
    // ----------------------------------------------------
    if (method === 'PerformTransaction') {
      const transId = params?.id;

      if (!transId) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Invalid parameters' }
        }, { status: 200 });
      }

      const { data: transaction, error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('id', transId)
        .single();

      if (txError || !transaction) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31003, message: { uz: 'Tranzaksiya topilmadi', ru: 'Транзакция не найдена', en: 'Transaction not found' } }
        }, { status: 200 });
      }

      // If active, perform the transaction
      if (transaction.state === 1) {
        const performTime = Date.now();

        // 1. Update transaction state to 2 (Performed/Paid)
        await supabaseAdmin
          .from('payment_transactions')
          .update({
            state: 2,
            perform_time: performTime
          })
          .eq('id', transId);

        // 2. Update order payment status
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'Paid',
            transaction_id: transId,
            status: 'Tasdiqlandi'
          })
          .eq('id', transaction.order_id);

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            transaction: transId,
            perform_time: performTime,
            state: 2
          }
        }, { status: 200 });
      }

      // If already performed, return state
      if (transaction.state === 2) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            transaction: transId,
            perform_time: Number(transaction.perform_time),
            state: 2
          }
        }, { status: 200 });
      }

      // If cancelled, return error
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -31008, message: { uz: 'Tranzaksiya bekor qilingan', ru: 'Транзакция отменена', en: 'Transaction cancelled' } }
      }, { status: 200 });
    }

    // ----------------------------------------------------
    // Method: CancelTransaction
    // ----------------------------------------------------
    if (method === 'CancelTransaction') {
      const transId = params?.id;
      const reason = params?.reason;

      if (!transId || reason === undefined) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Invalid parameters' }
        }, { status: 200 });
      }

      const { data: transaction, error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('id', transId)
        .single();

      if (txError || !transaction) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31003, message: { uz: 'Tranzaksiya topilmadi', ru: 'Транзакция не найдена', en: 'Transaction not found' } }
        }, { status: 200 });
      }

      // State is active (1) - cancel it
      if (transaction.state === 1) {
        const cancelTime = Date.now();

        await supabaseAdmin
          .from('payment_transactions')
          .update({
            state: -1,
            cancel_time: cancelTime,
            reason: Number(reason)
          })
          .eq('id', transId);

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            transaction: transId,
            cancel_time: cancelTime,
            state: -1
          }
        }, { status: 200 });
      }

      // State is performed (2) - refund/cancel it
      if (transaction.state === 2) {
        const cancelTime = Date.now();

        // 1. Update transaction state to -2
        await supabaseAdmin
          .from('payment_transactions')
          .update({
            state: -2,
            cancel_time: cancelTime,
            reason: Number(reason)
          })
          .eq('id', transId);

        // 2. Update order payment status
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'To\'lanmagan',
            status: 'Bekor qilindi'
          })
          .eq('id', transaction.order_id);

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            transaction: transId,
            cancel_time: cancelTime,
            state: -2
          }
        }, { status: 200 });
      }

      // Already cancelled (state < 0)
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          transaction: transId,
          cancel_time: Number(transaction.cancel_time),
          state: transaction.state
        }
      }, { status: 200 });
    }

    // ----------------------------------------------------
    // Method: CheckTransaction
    // ----------------------------------------------------
    if (method === 'CheckTransaction') {
      const transId = params?.id;

      if (!transId) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Invalid parameters' }
        }, { status: 200 });
      }

      const { data: transaction, error: txError } = await supabaseAdmin
        .from('payment_transactions')
        .select('*')
        .eq('id', transId)
        .single();

      if (txError || !transaction) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -31003, message: { uz: 'Tranzaksiya topilmadi', ru: 'Транзакция не найдена', en: 'Transaction not found' } }
        }, { status: 200 });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          create_time: Number(transaction.create_time),
          perform_time: transaction.perform_time ? Number(transaction.perform_time) : 0,
          cancel_time: transaction.cancel_time ? Number(transaction.cancel_time) : 0,
          transaction: transaction.id,
          state: transaction.state,
          reason: transaction.reason !== null ? Number(transaction.reason) : null
        }
      }, { status: 200 });
    }

    // Unsupported method
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' }
    }, { status: 200 });

  } catch (err) {
    console.error("Payme webhook handler error:", err);
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32400, message: 'System error' }
    }, { status: 200 });
  }
}
