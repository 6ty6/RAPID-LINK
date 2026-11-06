begin;

create extension if not exists pgtap with schema extensions;
select plan(28);

-- Test identities and records use reserved, deterministic UUIDs and are
-- rolled back when this file finishes.
insert into auth.users (id, email)
values
  ('10000000-0000-0000-0000-000000000001', 'content-admin@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'ordinary-user@example.test');

insert into public.content_admins (user_id)
values ('10000000-0000-0000-0000-000000000001');

insert into public.news_articles (
  id, slug, title, category, summary, image, image_alt, is_published
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'rls-published-news',
    'Published RLS test news',
    'Test',
    'Published test content.',
    '/test/published.jpg',
    'Published test image',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'rls-draft-news',
    'Draft RLS test news',
    'Test',
    'Draft test content.',
    '/test/draft.jpg',
    'Draft test image',
    false
  );

insert into public.career_vacancies (
  id, title, department, location, summary, is_published, application_email
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'Published RLS vacancy',
    'Test',
    'Accra',
    'Published test vacancy.',
    true,
    'jobs@example.test'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Draft RLS vacancy',
    'Test',
    'Accra',
    'Draft test vacancy.',
    false,
    'jobs@example.test'
  );

select ok(
  (select relrowsecurity from pg_class where oid = 'public.news_articles'::regclass),
  'RLS is enabled on news_articles'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.career_vacancies'::regclass),
  'RLS is enabled on career_vacancies'
);

-- Anonymous website visitor.
set local role anon;

select results_eq(
  $$select slug from public.news_articles where id = '20000000-0000-0000-0000-000000000001'::uuid$$,
  array['rls-published-news'::text],
  'Anonymous visitors can read published news'
);

select is_empty(
  $$select slug from public.news_articles where id = '20000000-0000-0000-0000-000000000002'::uuid$$,
  'Anonymous visitors cannot read draft news'
);

select results_eq(
  $$select title from public.career_vacancies where id = '30000000-0000-0000-0000-000000000001'::uuid$$,
  array['Published RLS vacancy'::text],
  'Anonymous visitors can read published vacancies'
);

select is_empty(
  $$select title from public.career_vacancies where id = '30000000-0000-0000-0000-000000000002'::uuid$$,
  'Anonymous visitors cannot read draft vacancies'
);

select is_empty(
  $$select user_id from public.content_admins$$,
  'Anonymous visitors cannot read the administrator list'
);

select throws_ok(
  $$insert into public.news_articles (slug, title, category, summary, image, image_alt)
    values ('anon-news-write', 'Blocked', 'Test', 'Blocked', '/test.jpg', 'Blocked')$$,
  '42501',
  'new row violates row-level security policy for table "news_articles"',
  'Anonymous visitors cannot create news'
);

select is_empty(
  $$update public.news_articles set title = 'Anonymous update'
    where id = '20000000-0000-0000-0000-000000000001'::uuid returning id$$,
  'Anonymous visitors cannot update news'
);

select is_empty(
  $$delete from public.news_articles
    where id = '20000000-0000-0000-0000-000000000001'::uuid returning id$$,
  'Anonymous visitors cannot delete news'
);

select throws_ok(
  $$insert into public.career_vacancies (title, department, location, summary, application_email)
    values ('Blocked', 'Test', 'Accra', 'Blocked', 'jobs@example.test')$$,
  '42501',
  'new row violates row-level security policy for table "career_vacancies"',
  'Anonymous visitors cannot create vacancies'
);

select is_empty(
  $$update public.career_vacancies set title = 'Anonymous update'
    where id = '30000000-0000-0000-0000-000000000001'::uuid returning id$$,
  'Anonymous visitors cannot update vacancies'
);

select is_empty(
  $$delete from public.career_vacancies
    where id = '30000000-0000-0000-0000-000000000001'::uuid returning id$$,
  'Anonymous visitors cannot delete vacancies'
);

-- Signed-in user who is not an approved content administrator.
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select results_eq(
  $$select slug from public.news_articles where id = '20000000-0000-0000-0000-000000000001'::uuid$$,
  array['rls-published-news'::text],
  'Ordinary signed-in users can read published news'
);

select is_empty(
  $$select slug from public.news_articles where id = '20000000-0000-0000-0000-000000000002'::uuid$$,
  'Ordinary signed-in users cannot read draft news'
);

select results_eq(
  $$select title from public.career_vacancies where id = '30000000-0000-0000-0000-000000000001'::uuid$$,
  array['Published RLS vacancy'::text],
  'Ordinary signed-in users can read published vacancies'
);

select is_empty(
  $$select title from public.career_vacancies where id = '30000000-0000-0000-0000-000000000002'::uuid$$,
  'Ordinary signed-in users cannot read draft vacancies'
);

select is_empty(
  $$select user_id from public.content_admins$$,
  'Ordinary signed-in users cannot read the administrator list'
);

select throws_ok(
  $$insert into public.news_articles (slug, title, category, summary, image, image_alt)
    values ('ordinary-user-news-write', 'Blocked', 'Test', 'Blocked', '/test.jpg', 'Blocked')$$,
  '42501',
  'new row violates row-level security policy for table "news_articles"',
  'Ordinary signed-in users cannot create news'
);

select throws_ok(
  $$insert into public.career_vacancies (title, department, location, summary, application_email)
    values ('Blocked', 'Test', 'Accra', 'Blocked', 'jobs@example.test')$$,
  '42501',
  'new row violates row-level security policy for table "career_vacancies"',
  'Ordinary signed-in users cannot create vacancies'
);

-- Approved content administrator.
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

select results_eq(
  $$select slug from public.news_articles where id = '20000000-0000-0000-0000-000000000002'::uuid$$,
  array['rls-draft-news'::text],
  'Content administrators can read draft news'
);

select results_eq(
  $$select title from public.career_vacancies where id = '30000000-0000-0000-0000-000000000002'::uuid$$,
  array['Draft RLS vacancy'::text],
  'Content administrators can read draft vacancies'
);

select results_eq(
  $$insert into public.news_articles (slug, title, category, summary, image, image_alt)
    values ('admin-news-write', 'Admin news', 'Test', 'Allowed', '/test.jpg', 'Allowed')
    returning slug$$,
  array['admin-news-write'::text],
  'Content administrators can create news'
);

select results_eq(
  $$update public.news_articles set title = 'Admin news updated'
    where slug = 'admin-news-write' returning title$$,
  array['Admin news updated'::text],
  'Content administrators can update news'
);

select results_eq(
  $$delete from public.news_articles where slug = 'admin-news-write' returning slug$$,
  array['admin-news-write'::text],
  'Content administrators can delete news'
);

select results_eq(
  $$insert into public.career_vacancies (title, department, location, summary, application_email)
    values ('Admin vacancy', 'Test', 'Accra', 'Allowed', 'jobs@example.test')
    returning title$$,
  array['Admin vacancy'::text],
  'Content administrators can create vacancies'
);

select results_eq(
  $$update public.career_vacancies set title = 'Admin vacancy updated'
    where title = 'Admin vacancy' returning title$$,
  array['Admin vacancy updated'::text],
  'Content administrators can update vacancies'
);

select results_eq(
  $$delete from public.career_vacancies where title = 'Admin vacancy updated' returning title$$,
  array['Admin vacancy updated'::text],
  'Content administrators can delete vacancies'
);

select * from finish();
rollback;
