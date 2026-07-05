-- Run this once in Supabase SQL Editor to enable practice scheduling.

create table if not exists public.practice_schedule_entries (
  id text primary key,
  parent_name text not null,
  athlete_name text not null,
  email text not null,
  phone text default '',
  visit_type text not null default 'Practice attendance',
  date_key text not null,
  date_label text not null,
  time text not null default '5:30 PM',
  message text default '',
  created_at timestamptz not null default now()
);

alter table public.practice_schedule_entries enable row level security;

drop policy if exists "Anyone can read practice schedule entries" on public.practice_schedule_entries;
create policy "Anyone can read practice schedule entries"
on public.practice_schedule_entries
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can create practice schedule entries" on public.practice_schedule_entries;
create policy "Authenticated users can create practice schedule entries"
on public.practice_schedule_entries
for insert
to authenticated
with check (auth.jwt() ->> 'email' = email);

drop policy if exists "Authenticated users can update their practice schedule entries" on public.practice_schedule_entries;
create policy "Authenticated users can update their practice schedule entries"
on public.practice_schedule_entries
for update
to authenticated
using (auth.jwt() ->> 'email' = email)
with check (auth.jwt() ->> 'email' = email);
