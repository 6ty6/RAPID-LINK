-- Consolidate the legacy vacancy-only administrator model into the single
-- content-administrator role used by the combined news and careers portal.
--
-- Existing career administrators are copied before the legacy role, function
-- and table are removed. This migration is safe to rerun after completion.

begin;

-- Preserve every previously approved career administrator. Dynamic SQL keeps
-- this step rerunnable after the legacy table has already been removed.
do $$
begin
  if to_regclass('public.career_admins') is not null then
    execute $copy$
      insert into public.content_admins (user_id, created_at)
      select user_id, created_at
      from public.career_admins
      on conflict (user_id) do nothing
    $copy$;
  end if;
end;
$$;

-- Keep the only remaining role check isolated from caller-controlled schemas.
create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.content_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_content_admin() from public;
grant execute on function public.is_content_admin() to authenticated;

-- Remove both legacy and duplicate vacancy policies before recreating one
-- consistent permission set.
drop policy if exists "Career admins can insert vacancies" on public.career_vacancies;
drop policy if exists "Career admins can update vacancies" on public.career_vacancies;
drop policy if exists "Content admins can read all vacancies" on public.career_vacancies;
drop policy if exists "Content admins can insert vacancies" on public.career_vacancies;
drop policy if exists "Content admins can update vacancies" on public.career_vacancies;
drop policy if exists "Content admins can delete vacancies" on public.career_vacancies;

create policy "Content admins can read all vacancies"
on public.career_vacancies
for select
to authenticated
using ((select public.is_content_admin()));

create policy "Content admins can insert vacancies"
on public.career_vacancies
for insert
to authenticated
with check ((select public.is_content_admin()));

create policy "Content admins can update vacancies"
on public.career_vacancies
for update
to authenticated
using ((select public.is_content_admin()))
with check ((select public.is_content_admin()));

create policy "Content admins can delete vacancies"
on public.career_vacancies
for delete
to authenticated
using ((select public.is_content_admin()));

drop function if exists public.is_career_admin();
drop table if exists public.career_admins;

commit;
