import pg from 'pg';

const connectionString = 'postgresql://postgres.cuhaqoahculndvzpriuq:Gisobot201415!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

const sql = `
  ALTER TABLE public.orders 
    ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Kutilmoqda',
    ADD COLUMN IF NOT EXISTS transaction_id text;

  CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id text PRIMARY KEY,
    order_id text REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    provider text NOT NULL,
    amount bigint NOT NULL,
    state integer DEFAULT 1,
    create_time bigint,
    perform_time bigint,
    cancel_time bigint,
    reason integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
  GRANT ALL ON public.payment_transactions TO anon, authenticated, service_role;
`;

async function run() {
  const client = new pg.Client({ connectionString });
  console.log("🔄 Connecting to Supabase database...");
  await client.connect();
  console.log("🚀 Executing SQL queries...");
  await client.query(sql);
  console.log("✅ SQL executed successfully!");
  await client.end();
}

run().catch(err => {
  console.error("❌ SQL execution failed:", err);
  process.exit(1);
});
