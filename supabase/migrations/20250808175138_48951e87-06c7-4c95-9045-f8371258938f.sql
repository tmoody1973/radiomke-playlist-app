
-- Create a generic API cache table for related tracks (and other API results)
create table if not exists public.api_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,                -- e.g. 'related:spotify:{track_id}' or 'related:artist:{artist}:{song}'
  payload jsonb not null,                        -- normalized response payload
  expires_at timestamptz not null,               -- TTL
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists api_cache_cache_key_idx on public.api_cache (cache_key);
create index if not exists api_cache_expires_at_idx on public.api_cache (expires_at);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_api_cache_set_updated_at on public.api_cache;
create trigger trg_api_cache_set_updated_at
before update on public.api_cache
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.api_cache enable row level security;

-- Policies:
-- 1) Anyone can read cached responses (public feature)
drop policy if exists "Anyone can view api cache" on public.api_cache;
create policy "Anyone can view api cache"
on public.api_cache
for select
using (true);

-- 2) App (edge functions/service role) can manage cache
drop policy if exists "App can manage api cache" on public.api_cache;
create policy "App can manage api cache"
on public.api_cache
for all
using (true)
with check (true);
