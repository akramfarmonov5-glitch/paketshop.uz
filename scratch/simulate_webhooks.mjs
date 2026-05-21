import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 1. Load env variables manually from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL or Anon Key not found in .env.local");
  process.exit(1);
}

console.log("📌 Supabase Url:", supabaseUrl);
console.log("🚀 Initializing payment integration simulation...");

// Helper for Supabase REST requests
async function supabaseRequest(endpoint, method, body = null) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error (${response.status}): ${text}`);
  }
  return response.json();
}

// MD5 Sign formula helper for Click
function generateClickSignature({ click_trans_id, service_id, click_paydoc_id, merchant_trans_id, amount, action, sign_time, secret_key }) {
  const raw_sign = `${click_trans_id}${service_id}${click_paydoc_id}${merchant_trans_id}${amount}${action}${sign_time}${secret_key}`;
  return crypto.createHash('md5').update(raw_sign).digest('hex');
}

async function runClickSimulation() {
  console.log("\n-------------------------------------------");
  console.log("🔹 STARTING CLICK WEBHOOK SIMULATION");
  console.log("-------------------------------------------");

  const orderId = `TEST-CLICK-${Date.now()}`;
  const amount = 55000;

  // 1. Create a dummy order in database
  console.log(`1. Inserting dummy order ${orderId} into Supabase...`);
  const orderData = {
    id: orderId,
    customerName: "Click Test User",
    phone: "+998991112233",
    total: amount,
    status: 'Kutilmoqda',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Click',
    payment_status: 'Kutilmoqda',
    items: [{ id: 1, name: "Simulation Product", quantity: 1, price: amount }]
  };

  await supabaseRequest('orders', 'POST', orderData);
  console.log("✅ Order created in Supabase successfully.");

  // Click parameters
  const service_id = 34262;
  const click_trans_id = 999123;
  const click_paydoc_id = 888123;
  const sign_time = '2026-05-21 12:00:00';
  const secret_key = 'sandbox_secret';

  // 2. Simulate Click Prepare (action = 0)
  console.log("2. Sending Click PREPARE webhook request (action = 0)...");
  const prepareSign = generateClickSignature({
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id: orderId,
    amount,
    action: 0,
    sign_time,
    secret_key
  });

  const prepareResponse = await fetch('http://localhost:3000/api/payment/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id: orderId,
      amount,
      action: 0,
      sign_time,
      sign_string: prepareSign,
      error: 0
    })
  });

  const prepareResult = await prepareResponse.json();
  console.log("Response:", prepareResult);

  if (prepareResult.error === 0) {
    console.log("✅ Click Prepare step was successful!");
  } else {
    throw new Error(`Click Prepare failed: ${prepareResult.error_note}`);
  }

  // 3. Simulate Click Complete (action = 1)
  console.log("3. Sending Click COMPLETE webhook request (action = 1)...");
  const completeSign = generateClickSignature({
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id: orderId,
    amount,
    action: 1,
    sign_time,
    secret_key
  });

  const completeResponse = await fetch('http://localhost:3000/api/payment/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id: orderId,
      amount,
      action: 1,
      sign_time,
      sign_string: completeSign,
      error: 0
    })
  });

  const completeResult = await completeResponse.json();
  console.log("Response:", completeResult);

  if (completeResult.error === 0) {
    console.log("✅ Click Complete step was successful!");
  } else {
    throw new Error(`Click Complete failed: ${completeResult.error_note}`);
  }

  // 4. Verify order in Supabase
  console.log("4. Verifying order state in database...");
  const [updatedOrder] = await supabaseRequest(`orders?id=eq.${orderId}`, 'GET');
  console.log(`Order status: "${updatedOrder.status}", Payment status: "${updatedOrder.payment_status}", Transaction ID: "${updatedOrder.transaction_id}"`);

  if (updatedOrder.payment_status === 'Paid' && updatedOrder.status === 'Tasdiqlandi') {
    console.log("🏆 CLICK INTEGRATION VERIFICATION SUCCESSFUL!");
  } else {
    throw new Error("Click integration failed verification in database!");
  }
}

async function runPaymeSimulation() {
  console.log("\n-------------------------------------------");
  console.log("🔹 STARTING PAYME JSON-RPC SIMULATION");
  console.log("-------------------------------------------");

  const orderId = `TEST-PAYME-${Date.now()}`;
  const amount = 85000;
  const amountInTiyins = amount * 100;

  // 1. Create a dummy order in database
  console.log(`1. Inserting dummy order ${orderId} into Supabase...`);
  const orderData = {
    id: orderId,
    customerName: "Payme Test User",
    phone: "+998994445566",
    total: amount,
    status: 'Kutilmoqda',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Payme',
    payment_status: 'Kutilmoqda',
    items: [{ id: 2, name: "Premium Service", quantity: 1, price: amount }]
  };

  await supabaseRequest('orders', 'POST', orderData);
  console.log("✅ Order created in Supabase successfully.");

  const paymeSecret = 'sandbox_secret';
  const authHeader = 'Basic ' + Buffer.from(`Paycom:${paymeSecret}`).toString('base64');
  const transId = `tx-${Date.now()}`;

  // Helper for JSON-RPC Payme calls
  async function callPayme(method, params = {}) {
    const res = await fetch('http://localhost:3000/api/payment/payme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      })
    });
    return res.json();
  }

  // 2. CheckPerformTransaction
  console.log("2. Sending Payme CheckPerformTransaction request...");
  const checkRes = await callPayme('CheckPerformTransaction', {
    amount: amountInTiyins,
    account: { order_id: orderId }
  });
  console.log("Response:", checkRes);

  if (checkRes.result?.allow === true) {
    console.log("✅ Payme CheckPerformTransaction was successful!");
  } else {
    throw new Error(`Payme CheckPerformTransaction failed: ${JSON.stringify(checkRes.error)}`);
  }

  // 3. CreateTransaction
  console.log("3. Sending Payme CreateTransaction request...");
  const createRes = await callPayme('CreateTransaction', {
    id: transId,
    time: Date.now(),
    amount: amountInTiyins,
    account: { order_id: orderId }
  });
  console.log("Response:", createRes);

  if (createRes.result?.state === 1) {
    console.log("✅ Payme CreateTransaction was successful!");
  } else {
    throw new Error(`Payme CreateTransaction failed: ${JSON.stringify(createRes.error)}`);
  }

  // 4. PerformTransaction
  console.log("4. Sending Payme PerformTransaction request...");
  const performRes = await callPayme('PerformTransaction', {
    id: transId
  });
  console.log("Response:", performRes);

  if (performRes.result?.state === 2) {
    console.log("✅ Payme PerformTransaction was successful!");
  } else {
    throw new Error(`Payme PerformTransaction failed: ${JSON.stringify(performRes.error)}`);
  }

  // 5. Verify order in Supabase
  console.log("5. Verifying order state in database...");
  const [updatedOrder] = await supabaseRequest(`orders?id=eq.${orderId}`, 'GET');
  console.log(`Order status: "${updatedOrder.status}", Payment status: "${updatedOrder.payment_status}", Transaction ID: "${updatedOrder.transaction_id}"`);

  if (updatedOrder.payment_status === 'Paid' && updatedOrder.status === 'Tasdiqlandi') {
    console.log("🏆 PAYME INTEGRATION VERIFICATION SUCCESSFUL!");
  } else {
    throw new Error("Payme integration failed verification in database!");
  }
}

async function run() {
  try {
    await runClickSimulation();
    await runPaymeSimulation();
    console.log("\n⭐️ ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("\n❌ SIMULATION RUNTIME ERROR:", err.message || err);
    process.exit(1);
  }
}

run();
