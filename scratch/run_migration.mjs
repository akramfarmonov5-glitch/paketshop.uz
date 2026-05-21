// Run SQL migration against Supabase using the Management API
// This script uses the Supabase anon key to attempt schema changes via rpc
// If that fails, we try a direct approach

import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The SQL we need to run
const migrationSQL = `
alter table public.orders 
  add column if not exists payment_status text default 'Kutilmoqda',
  add column if not exists transaction_id text;

create table if not exists public.payment_transactions (
  id text primary key,
  order_id text references public.orders(id) on delete cascade not null,
  provider text not null,
  amount bigint not null,
  state integer default 1,
  create_time bigint,
  perform_time bigint,
  cancel_time bigint,
  reason integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_transactions enable row level security;
grant all on public.payment_transactions to anon, authenticated, service_role;
`;

async function run() {
  console.log("🔧 Attempting to run payment schema migration...");
  console.log("Supabase URL:", supabaseUrl);
  
  // Try using the Supabase SQL API (if available)
  // Method 1: Try rpc endpoint
  try {
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      }
    });
    console.log("RPC endpoint status:", rpcRes.status);
  } catch(e) {
    console.log("RPC check failed:", e.message);
  }

  // The issue is that Supabase doesn't allow DDL through REST API.
  // The user needs to go to Supabase Dashboard SQL Editor.
  console.log("");
  console.log("================================================================");
  console.log("⚠️  Supabase REST API DDL ishlamaydi.");
  console.log("    Iltimos, Supabase Dashboard → SQL Editor da quyidagi SQL ni");
  console.log("    qo'l bilan ishga tushiring:");
  console.log("================================================================");
  console.log("");
  console.log(migrationSQL);
  console.log("");
  console.log("Link: https://supabase.com/dashboard/project/cuhaqoahculndvzpriuq/sql/new");
  console.log("");
  console.log("SQL ni ishga tushirgandan so'ng qaytib kelib,");
  console.log("  node scratch/simulate_webhooks.mjs");
  console.log("buyrug'ini ishga tushiring.");
}

run().catch(console.error);
