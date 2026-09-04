-- Alpaca AI discovery-call bookings
-- Applied to project rdthgakwzdcccqtoevar (Alpaca-AI-General) on 2026-09-04 as
-- migrations create_bookings, bookings_deny_client_access, drop_redundant_bookings_index.
-- Kept here as the single source of truth for the schema.

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  name        text not null,
  email       text not null,
  company     text,
  notes       text,
  lang        text not null default 'en',
  status      text not null default 'confirmed',
  created_at  timestamptz not null default now()
);

-- One booking per slot. n8n relies on this constraint to reject double bookings.
-- It also serves the slots read, which filters on status = 'confirmed'.
create unique index if not exists bookings_start_at_unique
  on public.bookings (start_at)
  where status = 'confirmed';

-- Lock the table down. Only the service role (used by n8n) can read or write.
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;

-- Explicit deny-all policy for client roles. The service role bypasses RLS,
-- so this only documents intent and clears the "RLS enabled, no policy" lint.
create policy "bookings_no_client_access"
  on public.bookings
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
