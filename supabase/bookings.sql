-- Alpaca AI discovery-call bookings
-- Run once in the Supabase SQL editor (or via the CLI) on the project n8n will use.

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
create unique index if not exists bookings_start_at_unique
  on public.bookings (start_at)
  where status = 'confirmed';

create index if not exists bookings_start_at_idx on public.bookings (start_at);

-- Lock the table down. Only the service role (used by n8n) can read or write.
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
