# Receipt Ops Sandbox

A small production-leaning validation app for this stack:

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Realtime)
- Drizzle ORM (schema + migrations)
- Cloudflare R2 (receipt image upload)
- Railway deploy target
- pnpm package manager

This repo is intentionally small and monolithic so you can quickly validate integration behavior before building a larger internal app.

## Features

- Email/password sign-up and sign-in with Supabase Auth
- Auth route protection with Next.js `proxy.ts`
- Role-based authorization (`admin`, `staff`) using `public.app_users` table
- Confirmation-aware auth flow via `/auth/confirm` route (works with Supabase email confirm enabled)
- Receipt CRUD:
  - Staff: create receipt + image upload, view own receipts
  - Admin: view all receipts, update status, delete receipts
- File upload to Cloudflare R2 with:
  - image-only MIME validation
  - max size enforcement (`R2_MAX_UPLOAD_SIZE_MB`)
  - client-side image preview before submit
- Realtime updates via Supabase Realtime on `public.receipts`:
  - admin sees new receipts without refresh
  - staff sees status updates without refresh

## Routes

- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/receipts/new`
- `/receipts/[id]`
- `/admin` (admin-only)

## Architecture Notes

- Uses server actions for auth and receipt mutations.
- Business logic is in `src/features/*` and `src/lib/*`, not page components.
- Authorization is centralized in `src/lib/auth.ts` with reusable `requireRole` helper.
- Supabase RLS enforces data access in the DB; app checks are an additional guard.
- R2 upload happens server-side in actions (`src/lib/r2.ts`) to keep secrets off the client.

## Local Setup

## 1) Install dependencies

```bash
pnpm install
```

## 2) Configure environment

Copy and edit local env:

```bash
cp .env.local.example .env.local
```

Required variables are documented in `.env.example`.

## 3) Configure Supabase

1. Create a Supabase project.
2. In Supabase SQL Editor, run:
   - `supabase/migrations/20260326143000_init_receipt_ops.sql`
   - Optional standalone trigger SQL: `supabase/sql_app_users_trigger.sql`
3. In Supabase project settings, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. In Supabase project settings, copy a Postgres connection string for Drizzle:
   - `DATABASE_URL` (or `SUPABASE_DB_URL`) in `.env.local`
   - Use a server-side connection string only (never `NEXT_PUBLIC_*`)
5. In Auth settings:
   - enable Email auth
   - enable/disable email confirmation based on your test case (app handles both)

## 4) Configure Cloudflare R2

1. Create an R2 bucket.
2. Create an API token with object read/write access to that bucket.
3. Add env vars:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL_BASE`
4. `R2_PUBLIC_URL_BASE` options:
   - public bucket URL (`*.r2.dev`) or
   - custom domain/CDN URL

## 5) Run app

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Drizzle Migration Commands

```bash
pnpm db:generate
pnpm db:migrate
```

You can also push directly to the DB:

```bash
pnpm db:push
```

## Promote a User to Admin

Users are created as `staff` by default.

After a user signs up, promote in Supabase SQL Editor:

```sql
update public.app_users
set role = 'admin'
where user_id = 'YOUR_USER_UUID';
```

You can get `user_id` from `auth.users` or `public.app_users`.

## Environment Strategy (Local / Preview / Production)

- `.env.local.example`: local development baseline
- `.env.preview.example`: Railway preview/staging variable template
- `.env.production.example`: production variable template

Recommended:

- Use separate Supabase projects for preview and production.
- Use separate R2 buckets for preview and production.
- Set `NEXT_PUBLIC_APP_URL` to each environment’s canonical URL.

## Railway Deployment

No `railway.json` is required for this app.

1. Push repo to GitHub.
2. In Railway, create a new project from the repo.
3. Set all environment variables from `.env.production.example`.
4. Railway will run:
   - build: `pnpm build`
   - start: `pnpm start`
5. Set `NEXT_PUBLIC_APP_URL` to your Railway/custom domain URL.
6. Re-run the SQL migration on production Supabase.

## Scripts

- `pnpm dev` - local dev
- `pnpm build` - production build
- `pnpm start` - production server
- `pnpm lint` - lint checks
- `pnpm db:generate` - generate Drizzle migration
- `pnpm db:migrate` - run Drizzle migration
- `pnpm db:push` - push schema directly

## RLS Summary

Defined in migration file:

- `app_users`
  - users can read own row
  - admins can read/update rows
  - users can insert their own row
- `receipts`
  - staff can read own and insert own receipts
  - admins can read all, update status, delete

Admin checks are backed by DB function:

- `public.is_admin(auth.uid())`

## Manual Test Checklist

1. Auth
- Sign up a new user.
- Sign in and sign out.
- Verify logged-out user is redirected to `/sign-in`.

2. Authorization
- As `staff`, confirm `/dashboard` works and `/admin` redirects away.
- Promote a user to `admin`; verify `/admin` opens.

3. CRUD
- As staff, create a receipt with image.
- Confirm receipt appears on `/dashboard` and `/receipts/[id]`.
- As admin, confirm all receipts are visible.
- As admin, change status and delete receipt.

4. Upload
- Try non-image file: should fail.
- Try oversized image > `R2_MAX_UPLOAD_SIZE_MB`: should fail.
- Verify uploaded image renders in receipt detail page.

5. Realtime
- Open staff dashboard in one browser and admin panel in another.
- Create receipt as staff -> admin list updates without refresh.
- Update status as admin -> staff dashboard/detail updates without refresh.

6. Deployment
- Deploy to Railway with production env vars.
- Run same checks on deployed URL.

## Known Simplifications

- No background jobs/queues.
- No object lifecycle retention policies in app code.
- No audit trail table (can be added later if needed).

This is intentional for fast stack validation.
