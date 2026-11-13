-- Hosted evidence for the single content-administrator role.
-- Run after 202611100001_consolidate_content_admin_role.sql.
-- This query is read-only.

with content_admin_function as (
  select
    p.prosecdef,
    p.proconfig
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'is_content_admin'
    and p.pronargs = 0
),
checks as (
  select
    1 as check_order,
    'Single administrator table'::text as check_name,
    (to_regclass('public.content_admins') is not null
      and to_regclass('public.career_admins') is null) as passed,
    'content_admins exists; career_admins does not exist'::text as evidence

  union all

  select
    2,
    'Legacy role function removed',
    not exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'is_career_admin'
        and p.pronargs = 0
    ),
    'is_career_admin() is absent'

  union all

  select
    3,
    'Content role is SECURITY DEFINER',
    coalesce((select prosecdef from content_admin_function), false),
    'is_content_admin() uses SECURITY DEFINER'

  union all

  select
    4,
    'Content role has fixed search_path',
    coalesce((
      select 'search_path=public, pg_temp' = any(proconfig)
      from content_admin_function
    ), false),
    'search_path is fixed to public, pg_temp'

  union all

  select
    5,
    'No career-admin vacancy policies',
    not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'career_vacancies'
        and policyname ilike 'Career admins%'
    ),
    'No career-admin policy names remain'

  union all

  select
    6,
    'One complete vacancy policy set',
    (select count(*) = 5
      from pg_policies
      where schemaname = 'public'
        and tablename = 'career_vacancies'),
    'Expected: one public SELECT plus four content-admin policies'

  union all

  select
    7,
    'Content admins can read vacancy drafts',
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'career_vacancies'
        and policyname = 'Content admins can read all vacancies'
        and cmd = 'SELECT'
    ),
    'Authenticated content-admin SELECT policy exists'
)
select
  lpad(check_order::text, 2, '0') || ' — ' || check_name as verification,
  case when passed then 'PASS' else 'FAIL' end as result,
  evidence
from checks
order by check_order;
