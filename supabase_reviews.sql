-- Mahsulot izohlari va baholari (Reviews & Ratings) uchun jadval
create table public.product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) sozlamalari
-- Izohlarni hamma o'qishi (read) va yaratishi (insert) mumkin bo'lishi kerak.
alter table public.product_reviews enable row level security;

create policy "Allow public read access" 
  on public.product_reviews 
  for select using (true);

create policy "Allow public insert access" 
  on public.product_reviews 
  for insert with check (true);

-- (Ixtiyoriy) Test uchun dastlabki data:
/*
insert into public.product_reviews (product_id, user_name, rating, comment)
values 
  (1, 'Azizbek', 5, 'Juda ajoyib sifat, yetkazib berish ham tez bo''ldi!'),
  (1, 'Malika R.', 4, 'Yaxshi ekan, lekin rangi rasmdegidan sal farq qilar ekan o''ngida.');
*/
