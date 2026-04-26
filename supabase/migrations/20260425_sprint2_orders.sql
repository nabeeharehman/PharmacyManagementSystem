-- ── Sprint 2 Migration: Orders, Order Items, Medicine catalogue fields ─────────

-- 1. Add price and prescription flag to medicines table
alter table public.medicines
  add column if not exists price_per_unit numeric(10,2) not null default 0.00,
  add column if not exists requires_prescription boolean not null default false;

-- 2. Orders table
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.users(id) on delete cascade,
  prescription_id   uuid references public.prescriptions(id) on delete set null,
  status            text not null default 'pending_review',
  total_amount      numeric(10,2) not null default 0,
  delivery_address  text,
  pharmacist_notes  text,
  reviewed_by       uuid references public.users(id) on delete set null,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default timezone('utc', now()),
  updated_at        timestamptz not null default timezone('utc', now())
);

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending_review',
    'prescription_required',
    'approved',
    'dispensed',
    'rejected',
    'cancelled'
  ));

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- 3. Order items table
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  medicine_id   uuid not null references public.medicines(id) on delete restrict,
  medicine_name text not null,
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(10,2) not null
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- 4. Row Level Security

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers: view own orders
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'customers view own orders'
  ) then
    create policy "customers view own orders"
    on public.orders for select to authenticated
    using (customer_id = auth.uid());
  end if;
end $$;

-- Customers: insert own orders
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'customers insert own orders'
  ) then
    create policy "customers insert own orders"
    on public.orders for insert to authenticated
    with check (customer_id = auth.uid());
  end if;
end $$;

-- Pharmacists: view all orders
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'pharmacists view all orders'
  ) then
    create policy "pharmacists view all orders"
    on public.orders for select to authenticated
    using (
      exists (
        select 1 from public.users
        where id = auth.uid() and role = 'pharmacist' and status = 'active'
      )
    );
  end if;
end $$;

-- Pharmacists: update orders
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'pharmacists update orders'
  ) then
    create policy "pharmacists update orders"
    on public.orders for update to authenticated
    using (
      exists (
        select 1 from public.users
        where id = auth.uid() and role = 'pharmacist' and status = 'active'
      )
    );
  end if;
end $$;

-- Admins: view all orders
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'admins view all orders'
  ) then
    create policy "admins view all orders"
    on public.orders for select to authenticated
    using (
      exists (
        select 1 from public.users
        where id = auth.uid() and role = 'admin' and status = 'active'
      )
    );
  end if;
end $$;

-- order_items: customers view own
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items'
      and policyname = 'customers view own order items'
  ) then
    create policy "customers view own order items"
    on public.order_items for select to authenticated
    using (
      exists (
        select 1 from public.orders
        where id = order_items.order_id and customer_id = auth.uid()
      )
    );
  end if;
end $$;

-- order_items: customers insert
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items'
      and policyname = 'customers insert order items'
  ) then
    create policy "customers insert order items"
    on public.order_items for insert to authenticated
    with check (
      exists (
        select 1 from public.orders
        where id = order_items.order_id and customer_id = auth.uid()
      )
    );
  end if;
end $$;

-- order_items: pharmacists view all
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items'
      and policyname = 'pharmacists view all order items'
  ) then
    create policy "pharmacists view all order items"
    on public.order_items for select to authenticated
    using (
      exists (
        select 1 from public.users
        where id = auth.uid() and role in ('pharmacist', 'admin') and status = 'active'
      )
    );
  end if;
end $$;

-- 5. Prescriptions table: add file_url alias if missing (Sprint 1 used file_url vs file_path)
alter table public.prescriptions
  add column if not exists file_url text,
  add column if not exists uploaded_at timestamptz;

-- Sync file_url from file_path if needed
update public.prescriptions
set file_url = file_path
where file_url is null and file_path is not null;

-- Sync uploaded_at from created_at if needed
update public.prescriptions
set uploaded_at = created_at
where uploaded_at is null and created_at is not null;
