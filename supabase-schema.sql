-- Postmark: cloud storage table
-- Run this in your Supabase project's SQL Editor (SQL Editor > New query).
-- Safe to re-run: uses "if not exists" / "or replace" throughout.

create table if not exists public.postmark_trips (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Keep updated_at fresh on every write.
create or replace function public.postmark_trips_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists postmark_trips_touch on public.postmark_trips;
create trigger postmark_trips_touch
  before update on public.postmark_trips
  for each row execute function public.postmark_trips_set_updated_at();

-- Row-level security: every user can only see/edit their own rows.
alter table public.postmark_trips enable row level security;

drop policy if exists "postmark_trips_select_own" on public.postmark_trips;
create policy "postmark_trips_select_own"
  on public.postmark_trips for select
  using (auth.uid() = user_id);

drop policy if exists "postmark_trips_insert_own" on public.postmark_trips;
create policy "postmark_trips_insert_own"
  on public.postmark_trips for insert
  with check (auth.uid() = user_id);

drop policy if exists "postmark_trips_update_own" on public.postmark_trips;
create policy "postmark_trips_update_own"
  on public.postmark_trips for update
  using (auth.uid() = user_id);

drop policy if exists "postmark_trips_delete_own" on public.postmark_trips;
create policy "postmark_trips_delete_own"
  on public.postmark_trips for delete
  using (auth.uid() = user_id);

-- Notes on shape:
-- Each row is one trip (or, for one reserved row per user with
-- id = '__postmark_style_settings__', the app's global style settings).
-- The "data" jsonb column holds the app's own trip object as-is
-- (name, type, days with activities/pins/notes/sections, categories,
-- stash, coverImage, etc.) so no schema migration is needed as the
-- app's data shape evolves.
