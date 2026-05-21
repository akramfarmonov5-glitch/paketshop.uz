// Run SQL migration against Supabase
const supabaseUrl = 'https://cuhaqoahculndvzpriuq.supabase.co';
const anonKey = 'sb_publishable_of4dsH5QvlGKU3Xvn5k34A_WG9L4ZOU';

async function run() {
  // Try to insert a test row to see if columns exist
  console.log("Checking if payment_status column exists on orders table...");
  
  // Attempt to read with select on payment_status
  const checkRes = await fetch(supabaseUrl + '/rest/v1/orders?select=id,payment_status&limit=1', {
    headers: {
      'apikey': anonKey,
      'Authorization': 'Bearer ' + anonKey,
    }
  });

  if (checkRes.ok) {
    const data = await checkRes.json();
    console.log("✅ payment_status column exists! Sample:", data);
  } else {
    const errText = await checkRes.text();
    console.log("❌ payment_status column NOT found:", errText);
    console.log("");
    console.log("==============================================");
    console.log("⚠️  MANUAL ACTION REQUIRED:");
    console.log("==============================================");
    console.log("Please run the following SQL in your Supabase SQL Editor:");
    console.log("(Dashboard → SQL Editor → New Query → Paste & Run)");
    console.log("");
    console.log(`-- 1. Add payment columns to orders table
alter table public.orders 
  add column if not exists payment_status text default 'Kutilmoqda',
  add column if not exists transaction_id text;

-- 2. Create payment_transactions table for Click/Payme audits
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

-- 3. Enable RLS
alter table public.payment_transactions enable row level security;

-- 4. Grant access
grant all on public.payment_transactions to anon, authenticated, service_role;`);
  }
}

run().catch(e => console.error(e));
