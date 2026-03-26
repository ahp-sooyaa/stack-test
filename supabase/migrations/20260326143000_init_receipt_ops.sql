-- Receipt Ops Sandbox initial schema
-- Run with Supabase SQL editor or supabase migrations.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'staff');
create type public.receipt_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.app_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'staff',
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  status public.receipt_status not null default 'pending',
  uploaded_by_user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists receipts_uploaded_by_user_id_idx on public.receipts (uploaded_by_user_id);
create index if not exists receipts_created_at_idx on public.receipts (created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_receipts_updated_at on public.receipts;
create trigger set_receipts_updated_at
before update on public.receipts
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (user_id, role)
  values (new.id, 'staff')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users au
    where au.user_id = uid
      and au.role = 'admin'
  );
$$;

alter table public.app_users enable row level security;
alter table public.receipts enable row level security;

-- app_users policies
create policy "app_users_select_own_or_admin"
on public.app_users
for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "app_users_insert_own"
on public.app_users
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "app_users_update_admin_only"
on public.app_users
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- receipts policies
create policy "receipts_select_own_or_admin"
on public.receipts
for select
to authenticated
using (uploaded_by_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "receipts_insert_own"
on public.receipts
for insert
to authenticated
with check (uploaded_by_user_id = auth.uid());

create policy "receipts_update_admin_only"
on public.receipts
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "receipts_delete_admin_only"
on public.receipts
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- Realtime publication: add receipts if missing.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'receipts'
  ) then
    alter publication supabase_realtime add table public.receipts;
  end if;
end;
$$;
