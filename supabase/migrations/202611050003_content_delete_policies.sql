-- Allow only approved content administrators to delete managed content.
-- Public visitors and ordinary authenticated users remain unable to delete rows.

drop policy if exists "Content admins can delete news" on public.news_articles;
create policy "Content admins can delete news" on public.news_articles
for delete to authenticated
using (public.is_content_admin());

drop policy if exists "Content admins can delete vacancies" on public.career_vacancies;
create policy "Content admins can delete vacancies" on public.career_vacancies
for delete to authenticated
using (public.is_content_admin());
