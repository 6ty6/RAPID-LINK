-- Hosted RLS evidence: prove that anonymous visitors cannot create public
-- content. Run this entire script in the hosted Supabase SQL Editor.
--
-- Safety:
--   * Both attempts execute as the `anon` role used by the public website.
--   * A deliberately raised exception rolls back an insert if it unexpectedly
--     succeeds.
--   * The surrounding transaction is also rolled back, so this script leaves
--     no functions or test records behind.

begin;

create or replace function pg_temp.verify_anon_news_insert()
returns table (test_name text, result text, evidence text)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  begin
    insert into public.news_articles (
      slug,
      title,
      category,
      published_at,
      summary,
      image,
      image_alt,
      featured,
      is_published,
      sections
    )
    values (
      'rls-anon-news-' || txid_current()::text,
      'RLS verification record',
      'Security Test',
      current_date,
      'Temporary record used only to verify anonymous-write protection.',
      '/assets/rapidlink-logo.png',
      'RapidLink logo',
      false,
      false,
      '[]'::jsonb
    );

    -- Raising inside this block rolls back the unexpected insert before the
    -- handler reports the failure.
    raise exception 'ANONYMOUS_WRITE_UNEXPECTEDLY_SUCCEEDED';
  exception
    when insufficient_privilege then
      return query select
        'Anonymous news creation',
        'PASS',
        'Rejected by Row Level Security (' || sqlstate || ')';
    when raise_exception then
      if sqlerrm = 'ANONYMOUS_WRITE_UNEXPECTEDLY_SUCCEEDED' then
        return query select
          'Anonymous news creation',
          'FAIL',
          'The anonymous insert was accepted; review the news RLS policies';
      else
        return query select
          'Anonymous news creation',
          'ERROR',
          sqlstate || ': ' || sqlerrm;
      end if;
    when others then
      return query select
        'Anonymous news creation',
        'ERROR',
        sqlstate || ': ' || sqlerrm;
  end;
end;
$$;

create or replace function pg_temp.verify_anon_vacancy_insert()
returns table (test_name text, result text, evidence text)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  begin
    insert into public.career_vacancies (
      title,
      department,
      location,
      employment_type,
      summary,
      responsibilities,
      status,
      is_published,
      application_email
    )
    values (
      'RLS verification vacancy',
      'Security Test',
      'Accra',
      'Temporary',
      'Temporary record used only to verify anonymous-write protection.',
      '[]'::jsonb,
      'closed',
      false,
      'rls-test@example.invalid'
    );

    raise exception 'ANONYMOUS_WRITE_UNEXPECTEDLY_SUCCEEDED';
  exception
    when insufficient_privilege then
      return query select
        'Anonymous vacancy creation',
        'PASS',
        'Rejected by Row Level Security (' || sqlstate || ')';
    when raise_exception then
      if sqlerrm = 'ANONYMOUS_WRITE_UNEXPECTEDLY_SUCCEEDED' then
        return query select
          'Anonymous vacancy creation',
          'FAIL',
          'The anonymous insert was accepted; review the vacancy RLS policies';
      else
        return query select
          'Anonymous vacancy creation',
          'ERROR',
          sqlstate || ': ' || sqlerrm;
      end if;
    when others then
      return query select
        'Anonymous vacancy creation',
        'ERROR',
        sqlstate || ': ' || sqlerrm;
  end;
end;
$$;

grant execute on function pg_temp.verify_anon_news_insert() to anon;
grant execute on function pg_temp.verify_anon_vacancy_insert() to anon;

set local role anon;

select * from pg_temp.verify_anon_news_insert()
union all
select * from pg_temp.verify_anon_vacancy_insert()
order by test_name;

rollback;

