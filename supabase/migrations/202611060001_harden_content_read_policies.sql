-- Keep public reads independent from administrator checks.
-- Anonymous visitors may read published content only. Authenticated content
-- administrators receive a separate policy that also exposes drafts.

drop policy if exists "Published vacancies are public" on public.career_vacancies;
drop policy if exists "Content admins can read all vacancies" on public.career_vacancies;

create policy "Published vacancies are public"
on public.career_vacancies
for select
to anon, authenticated
using (is_published = true);

create policy "Content admins can read all vacancies"
on public.career_vacancies
for select
to authenticated
using ((select public.is_content_admin()));

drop policy if exists "Published news is public" on public.news_articles;
drop policy if exists "Content admins can read all news" on public.news_articles;

create policy "Published news is public"
on public.news_articles
for select
to anon, authenticated
using (is_published = true);

create policy "Content admins can read all news"
on public.news_articles
for select
to authenticated
using ((select public.is_content_admin()));
