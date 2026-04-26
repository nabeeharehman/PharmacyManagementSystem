create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid()
);

alter table public.prescriptions
  add column if not exists customer_id uuid references public.users (id) on delete cascade,
  add column if not exists file_name text,
  add column if not exists file_path text,
  add column if not exists file_size bigint,
  add column if not exists mime_type text,
  add column if not exists status text default 'pending_review',
  add column if not exists rejection_reason text,
  add column if not exists reviewed_by uuid references public.users (id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.prescriptions
set status = coalesce(status, 'pending_review')
where status is null;

update public.prescriptions
set created_at = coalesce(created_at, timezone('utc', now()))
where created_at is null;

update public.prescriptions
set updated_at = coalesce(updated_at, timezone('utc', now()))
where updated_at is null;

alter table public.prescriptions
  alter column customer_id set not null,
  alter column file_name set not null,
  alter column file_path set not null,
  alter column status set not null,
  alter column status set default 'pending_review',
  alter column created_at set not null,
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set not null,
  alter column updated_at set default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'prescriptions_status_check'
      and conrelid = 'public.prescriptions'::regclass
  ) then
    alter table public.prescriptions
      add constraint prescriptions_status_check
      check (status in ('pending_review', 'approved', 'rejected'));
  end if;
end $$;

create unique index if not exists prescriptions_file_path_idx on public.prescriptions (file_path);
create index if not exists prescriptions_customer_id_idx on public.prescriptions (customer_id);
create index if not exists prescriptions_status_idx on public.prescriptions (status);
create index if not exists prescriptions_created_at_idx on public.prescriptions (created_at desc);

alter table public.prescriptions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prescriptions'
      and policyname = 'customers can view own prescriptions'
  ) then
    create policy "customers can view own prescriptions"
    on public.prescriptions
    for select
    to authenticated
    using (customer_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prescriptions'
      and policyname = 'customers can insert own prescriptions'
  ) then
    create policy "customers can insert own prescriptions"
    on public.prescriptions
    for insert
    to authenticated
    with check (
      customer_id = auth.uid()
      and exists (
        select 1
        from public.users
        where id = auth.uid()
          and role = 'customer'
          and status = 'active'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prescriptions'
      and policyname = 'pharmacists can view all prescriptions'
  ) then
    create policy "pharmacists can view all prescriptions"
    on public.prescriptions
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.users
        where id = auth.uid()
          and role = 'pharmacist'
          and status = 'active'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'prescriptions'
      and policyname = 'pharmacists can update prescriptions'
  ) then
    create policy "pharmacists can update prescriptions"
    on public.prescriptions
    for update
    to authenticated
    using (
      exists (
        select 1
        from public.users
        where id = auth.uid()
          and role = 'pharmacist'
          and status = 'active'
      )
    )
    with check (
      exists (
        select 1
        from public.users
        where id = auth.uid()
          and role = 'pharmacist'
          and status = 'active'
      )
    );
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('prescriptions', 'prescriptions', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'customers can upload own prescription files'
  ) then
    create policy "customers can upload own prescription files"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'prescriptions'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'customers can read own prescription files'
  ) then
    create policy "customers can read own prescription files"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'prescriptions'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'pharmacists can read prescription files'
  ) then
    create policy "pharmacists can read prescription files"
    on storage.objects
    for select
    to authenticated
    using (
      bucket_id = 'prescriptions'
      and exists (
        select 1
        from public.users
        where id = auth.uid()
          and role = 'pharmacist'
          and status = 'active'
      )
    );
  end if;
end $$;
