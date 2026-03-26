-- Drizzle baseline migration for Receipt Ops Sandbox

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'staff');
  end if;

  if not exists (select 1 from pg_type where typname = 'receipt_status') then
    create type public.receipt_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

create table if not exists public.app_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'staff',
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric(12, 2) not null,
  note text,
  status public.receipt_status not null default 'pending',
  uploaded_by_user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
