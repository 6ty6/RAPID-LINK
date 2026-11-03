-- Run this in the approved Supabase project's SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.career_vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text not null,
  employment_type text not null default 'Full-time',
  summary text not null,
  responsibilities jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'closed')),
  is_published boolean not null default false,
  application_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.career_vacancies enable row level security;
alter table public.career_admins enable row level security;

create or replace function public.is_career_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.career_admins where user_id = auth.uid());
$$;

revoke all on function public.is_career_admin() from public;
grant execute on function public.is_career_admin() to authenticated;

drop policy if exists "Published vacancies are public" on public.career_vacancies;
create policy "Published vacancies are public" on public.career_vacancies
for select using (is_published = true or public.is_career_admin());

drop policy if exists "Career admins can insert vacancies" on public.career_vacancies;
create policy "Career admins can insert vacancies" on public.career_vacancies
for insert to authenticated with check (public.is_career_admin());

drop policy if exists "Career admins can update vacancies" on public.career_vacancies;
create policy "Career admins can update vacancies" on public.career_vacancies
for update to authenticated using (public.is_career_admin()) with check (public.is_career_admin());

-- Add authorised users only after creating/inviting them in Authentication > Users:
-- insert into public.career_admins (user_id) values ('AUTH-USER-UUID-HERE');

-- Seed the first vacancy only once after confirming it is still accepting applications.
-- The public page has a local fallback copy until this database is connected.
