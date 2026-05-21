-- ========================================================
-- PAKETSHOP - PAYMENT SYSTEM SCHEMA INTEGRATION
-- Run this in your Supabase SQL Editor
-- ========================================================

-- 1. Modify orders table to add payment-related columns
alter table public.orders 
  add column if not exists payment_status text default 'Kutilmoqda',
  add column if not exists transaction_id text;

-- 2. Create payment_transactions table for Click/Payme audits
create table if not exists public.payment_transactions (
  id text primary key, -- Click/Payme transaction ID
  order_id text references public.orders(id) on delete cascade not null,
  provider text not null, -- 'click' or 'payme'
  amount bigint not null,
  state integer default 1, -- 1: Created/Active, 2: Performed/Paid, -1/-2: Cancelled
  create_time bigint,
  perform_time bigint,
  cancel_time bigint,
  reason integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS) for security best practices
alter table public.payment_transactions enable row level security;

-- 4. Recreate RLS policies for payment_transactions
drop policy if exists "Admins manage payment transactions" on public.payment_transactions;
drop policy if exists "Users view own payment transactions" on public.payment_transactions;

-- Admin access policy
create policy "Admins manage payment transactions"
  on public.payment_transactions for all
  using (public.is_admin())
  with check (public.is_admin());

-- User access policy (viewing their own payment transactions if authenticated)
create policy "Users view own payment transactions"
  on public.payment_transactions for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = payment_transactions.order_id
      and o.user_id = auth.uid()
    )
  );

grant all on public.payment_transactions to anon, authenticated, service_role;
