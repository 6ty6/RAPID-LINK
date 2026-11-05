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

create table if not exists public.content_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- A Supabase invitation is the approval step for this private portal. Users
-- created by ordinary sign-up flows are not granted content access.
create or replace function public.authorize_invited_content_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.invited_at is not null then
    insert into public.content_admins (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.authorize_invited_content_user() from public;

drop trigger if exists authorize_invited_content_user on auth.users;
create trigger authorize_invited_content_user
after insert on auth.users
for each row execute function public.authorize_invited_content_user();

insert into public.content_admins (user_id)
select id from auth.users where invited_at is not null
on conflict (user_id) do nothing;

-- Preserve previously approved vacancy administrators when upgrading an
-- existing project from the vacancy-only portal.
insert into public.content_admins (user_id, created_at)
select user_id, created_at from public.career_admins
on conflict (user_id) do nothing;

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null,
  published_at date not null default current_date,
  summary text not null,
  image text not null,
  image_alt text not null,
  featured boolean not null default false,
  is_published boolean not null default false,
  sections jsonb not null default '[]'::jsonb,
  external_link text,
  external_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_vacancies enable row level security;
alter table public.career_admins enable row level security;
alter table public.content_admins enable row level security;
alter table public.news_articles enable row level security;

create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.content_admins where user_id = auth.uid());
$$;

revoke all on function public.is_content_admin() from public;
grant execute on function public.is_content_admin() to authenticated;

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
for select using (is_published = true or public.is_content_admin());

drop policy if exists "Career admins can insert vacancies" on public.career_vacancies;
create policy "Career admins can insert vacancies" on public.career_vacancies
for insert to authenticated with check (public.is_career_admin());

drop policy if exists "Career admins can update vacancies" on public.career_vacancies;
create policy "Career admins can update vacancies" on public.career_vacancies
for update to authenticated using (public.is_career_admin()) with check (public.is_career_admin());

drop policy if exists "Published news is public" on public.news_articles;
create policy "Published news is public" on public.news_articles
for select using (is_published = true or public.is_content_admin());

drop policy if exists "Content admins can insert news" on public.news_articles;
create policy "Content admins can insert news" on public.news_articles
for insert to authenticated with check (public.is_content_admin());

drop policy if exists "Content admins can update news" on public.news_articles;
create policy "Content admins can update news" on public.news_articles
for update to authenticated using (public.is_content_admin()) with check (public.is_content_admin());

drop policy if exists "Content admins can delete news" on public.news_articles;
create policy "Content admins can delete news" on public.news_articles
for delete to authenticated using (public.is_content_admin());

-- The content-admin role also controls vacancies in the combined portal.
drop policy if exists "Content admins can insert vacancies" on public.career_vacancies;
create policy "Content admins can insert vacancies" on public.career_vacancies
for insert to authenticated with check (public.is_content_admin());

drop policy if exists "Content admins can update vacancies" on public.career_vacancies;
create policy "Content admins can update vacancies" on public.career_vacancies
for update to authenticated using (public.is_content_admin()) with check (public.is_content_admin());

drop policy if exists "Content admins can delete vacancies" on public.career_vacancies;
create policy "Content admins can delete vacancies" on public.career_vacancies
for delete to authenticated using (public.is_content_admin());

-- Add authorised users only after creating/inviting them in Authentication > Users:
-- insert into public.content_admins (user_id) values ('AUTH-USER-UUID-HERE');

-- Seed the first vacancy only once after confirming it is still accepting applications.
-- The public page has a local fallback copy until this database is connected.
