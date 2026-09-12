-- SAVORÉ LIVE CMS — Supabase setup
create extension if not exists pgcrypto;

create table if not exists public.restaurant_settings (
  id bigint primary key check (id=1),
  brand_name text not null default 'SAVORÉ',
  tagline text default '',
  logo_url text default '',
  whatsapp_number text default ''
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_name text not null,
  price numeric not null default 0,
  offer_price numeric,
  image_url text not null,
  badge text default '',
  description text default '',
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.restaurant_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "public read settings" on public.restaurant_settings;
create policy "public read settings" on public.restaurant_settings for select using (true);
drop policy if exists "owner write settings" on public.restaurant_settings;
create policy "owner write settings" on public.restaurant_settings for all to authenticated using (true) with check (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "owner write categories" on public.categories;
create policy "owner write categories" on public.categories for all to authenticated using (true) with check (true);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "owner write products" on public.products;
create policy "owner write products" on public.products for all to authenticated using (true) with check (true);

insert into public.restaurant_settings(id,brand_name,tagline)
values(1,'SAVORÉ','Chinese • Thai • Fine Dining')
on conflict(id) do nothing;

-- Add your owner account in Supabase Dashboard > Authentication > Users.
-- Then only give that email/password to the restaurant owner.
