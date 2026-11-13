# Supabase content security checklist

This checklist covers the public news and careers content system. It does not
approve Supabase for complaints, applications, payments, subscriptions or any
other customer data.

## Hosted project settings

Complete these checks in the Supabase dashboard before production:

- Authentication > Configuration > General: **Allow new users to sign up** is off.
- **Allow anonymous sign-ins** is off.
- Authentication > URL Configuration: Site URL is the currently active site.
- Redirect allow-list contains only approved `/accept-invite` URLs.
- Staff are added through **Authentication > Users > Send invitation**.
- The browser receives only the publishable/anonymous key. A secret or
  service-role key must never use a `VITE_` environment variable.
- Each approved staff UUID is present in `public.content_admins` or was added by
  the approved invitation trigger.
- Remove staff from `public.content_admins` and disable their Auth user when
  their access is withdrawn.

## Database guarantees

The migrations and tests are intended to prove:

- Anonymous and ordinary authenticated visitors see published news and
  vacancies only.
- Draft content is visible only to approved content administrators.
- Anonymous visitors cannot insert, update or delete news or vacancies.
- Ordinary authenticated users cannot manage content.
- Approved content administrators can create, update and delete both content
  types.
- A single `content_admins` role controls both news and vacancies; the legacy
  `career_admins` table and `is_career_admin()` function are absent.
- `is_content_admin()` is `SECURITY DEFINER` with the fixed search path
  `public, pg_temp`.
- The `content_admins` membership list is not readable through the public API.
- Row-level security remains enabled on both public content tables.

## Run the automated tests

The previous local result was **28/28 passed on 9 November 2026**. The suite now
contains **36 checks** after the single-role consolidation and the additional
ordinary-user update/delete cases. The expanded suite still requires a fresh
Docker-backed run before it can be reported as passed. See
`docs/security-evidence/local-rls-2026-11-09.md` for the earlier result.

If `npm.cmd run test:db` reports that `supabase` is not recognized, restore the
project dependencies with `npm.cmd ci` before retrying; the CLI is already
declared in the project's development dependencies.

The tests require Docker Desktop and the local Supabase stack:

```powershell
npx supabase start
npx supabase db reset
npm run test:db
```

`supabase db reset` deletes data in the local Supabase instance only. Do not run
it against the hosted production database. The pgTAP test itself runs inside a
transaction and rolls back its test users and records.

Expected final output:

```text
All tests successful.
Result: PASS
```

Save the successful output with the project review evidence. If a policy is
changed later, rerun this suite before merging into `main`.

## Run the hosted public-API tests

After applying the consolidation migration, follow
`docs/hosted-api-security-tests.md` and run:

```powershell
npm.cmd run test:hosted-api
```

This check uses the publishable key and real HTTP endpoints. It requires a
dedicated approved administrator and a dedicated signed-in non-administrator.
It creates only temporary records and removes them after the run.

Run `supabase/verification/verify_consolidated_content_role.sql` in the hosted
SQL Editor to capture read-only evidence that the old role was removed and that
the remaining security function and policies are configured correctly.

## Manual evidence for the supervisor

Provide the following without exposing secrets or customer data:

1. Screenshot showing public and anonymous sign-ups disabled.
2. The RLS migration files and this checklist.
3. Successful expanded `npm run test:db` output.
4. A screenshot of the Tables view showing RLS enabled for `news_articles` and
   `career_vacancies`.
5. Confirmation that no service-role key exists in Render's public build
   environment.
6. Successful `npm run test:hosted-api` output with secrets and tokens excluded.
7. Exported results from `verify_consolidated_content_role.sql`.
