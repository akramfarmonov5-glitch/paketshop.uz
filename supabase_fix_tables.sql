-- ========================================================
-- PAKETSHOP - SECURITY / SCHEMA MIGRATION
-- Existing project uchun yangilash skripti
-- ========================================================

create extension if not exists pgcrypto;

-- 1. Missing columns / tables
alter table if exists public.categories
  add column if not exists slug text,
  add column if not exists description text default '',
  add column if not exists "googleProductCategory" text;

alter table if exists public.products
  add column if not exists images text[] default '{}',
  add column if not exists "videoUrl" text;

alter table if exists public.products
  alter column specifications set default '[]'::jsonb;

alter table if exists public.blog_posts
  add column if not exists seo jsonb default '{}'::jsonb;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blog_posts'
      and column_name = 'seo_title'
  ) then
    update public.blog_posts
    set seo = jsonb_build_object(
      'title', coalesce(seo_title, title),
      'description', coalesce(seo_description, left(content, 160)),
      'keywords', coalesce(to_jsonb(seo_keywords), '[]'::jsonb)
    )
    where seo is null or seo = '{}'::jsonb;
  end if;
end $$;

create table if not exists public.leads (
  id text primary key,
  name text not null,
  phone text not null,
  last_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Rebuild single-row config tables into the format the app expects
drop table if exists public.hero_content_v2 cascade;
create table public.hero_content_v2 (
  id text primary key default 'main',
  badge text,
  title text,
  description text,
  "buttonText" text,
  images text[] default '{}',
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'hero_content'
  ) then
    insert into public.hero_content_v2 (id, badge, title, description, "buttonText", images, active, created_at)
    select
      'main',
      badge,
      title,
      description,
      coalesce("buttonText", 'Sotib olish'),
      coalesce(images, '{}'),
      coalesce(active, true),
      coalesce(created_at, timezone('utc'::text, now()))
    from public.hero_content
    limit 1
    on conflict (id) do update
    set
      badge = excluded.badge,
      title = excluded.title,
      description = excluded.description,
      "buttonText" = excluded."buttonText",
      images = excluded.images,
      active = excluded.active;
  else
    insert into public.hero_content_v2 (id)
    values ('main')
    on conflict (id) do nothing;
  end if;
end $$;

drop table if exists public.hero_content cascade;
alter table public.hero_content_v2 rename to hero_content;

drop table if exists public.navigation_settings_v2 cascade;
create table public.navigation_settings_v2 (
  id text primary key default 'main',
  "menuItems" jsonb default '[]'::jsonb,
  "socialLinks" jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.navigation_settings_v2 (id)
values ('main')
on conflict (id) do nothing;

drop table if exists public.navigation_settings cascade;
alter table public.navigation_settings_v2 rename to navigation_settings;

-- 3. Admin helper function
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 4. Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.wishlists enable row level security;
alter table public.blog_posts enable row level security;
alter table public.hero_content enable row level security;
alter table public.navigation_settings enable row level security;
alter table public.leads enable row level security;
alter table public.admin_users enable row level security;

-- 5. Drop old permissive policies
drop policy if exists "Public products are viewable" on public.products;
drop policy if exists "Public categories are viewable" on public.categories;
drop policy if exists "Public blogs are viewable" on public.blog_posts;
drop policy if exists "Public hero viewable" on public.hero_content;
drop policy if exists "Public nav viewable" on public.navigation_settings;
drop policy if exists "Allow all access products" on public.products;
drop policy if exists "Allow all access categories" on public.categories;
drop policy if exists "Allow all access blogs" on public.blog_posts;
drop policy if exists "Allow all access hero" on public.hero_content;
drop policy if exists "Allow all access nav" on public.navigation_settings;
drop policy if exists "Anyone can insert an order" on public.orders;
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can view their own wishlist" on public.wishlists;
drop policy if exists "Users can insert into their own wishlist" on public.wishlists;
drop policy if exists "Users can delete from their own wishlist" on public.wishlists;
drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public read products" on public.products;
drop policy if exists "Public read blog posts" on public.blog_posts;
drop policy if exists "Public read hero content" on public.hero_content;
drop policy if exists "Public read navigation settings" on public.navigation_settings;
drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Admins manage blog posts" on public.blog_posts;
drop policy if exists "Admins manage hero content" on public.hero_content;
drop policy if exists "Admins manage navigation settings" on public.navigation_settings;
drop policy if exists "Guests can create orders" on public.orders;
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Admins manage orders" on public.orders;
drop policy if exists "Users view own wishlist" on public.wishlists;
drop policy if exists "Users insert own wishlist" on public.wishlists;
drop policy if exists "Users delete own wishlist" on public.wishlists;
drop policy if exists "Public create leads" on public.leads;
drop policy if exists "Admins manage leads" on public.leads;
drop policy if exists "Users can view own admin membership" on public.admin_users;

-- 6. Recreate safe policies
create policy "Public read categories"
  on public.categories for select
  using (true);

create policy "Public read products"
  on public.products for select
  using (true);

create policy "Public read blog posts"
  on public.blog_posts for select
  using (true);

create policy "Public read hero content"
  on public.hero_content for select
  using (true);

create policy "Public read navigation settings"
  on public.navigation_settings for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage blog posts"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage hero content"
  on public.hero_content for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage navigation settings"
  on public.navigation_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Guests can create orders"
  on public.orders for insert
  with check (user_id is null or auth.uid() = user_id);

create policy "Users view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users view own wishlist"
  on public.wishlists for select
  using (auth.uid() = user_id);

create policy "Users insert own wishlist"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

create policy "Users delete own wishlist"
  on public.wishlists for delete
  using (auth.uid() = user_id);

create policy "Public create leads"
  on public.leads for insert
  with check (true);

create policy "Admins manage leads"
  on public.leads for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can view own admin membership"
  on public.admin_users for select
  using (auth.uid() = user_id or public.is_admin());
