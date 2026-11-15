# Hosted Supabase public-API security verification

## Purpose

This check answers the requirement to test the hosted content database through
the same public Supabase HTTP interface used by the website. It uses only the
publishable key. It does not use or accept a service-role secret.

The script creates temporary news and vacancy records through an approved test
administrator, verifies access as an anonymous visitor and an ordinary signed-in
user, and removes the temporary records at the end.

## Test accounts required

Create two dedicated Supabase Authentication users:

1. an approved test administrator whose UUID exists in `public.content_admins`;
2. an ordinary signed-in test user whose UUID does not exist in
   `public.content_admins`.

Do not use a real employee's password. Store test credentials only in the local
`.env.local` file or the secure CI environment. Never commit them.

## Local environment variables

```text
HOSTED_TEST_ADMIN_EMAIL=
HOSTED_TEST_ADMIN_PASSWORD=
HOSTED_TEST_NON_ADMIN_EMAIL=
HOSTED_TEST_NON_ADMIN_PASSWORD=
```

The script also reads the existing `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` values. The aliases `HOSTED_SUPABASE_URL` and
`HOSTED_SUPABASE_PUBLISHABLE_KEY` may be used instead.

## Run the verification

```powershell
npm.cmd run test:hosted-api
```

The test covers:

- public reading of published news and vacancies;
- blocking public and non-admin access to drafts;
- anonymous insert, update and delete attempts;
- signed-in non-admin insert, update and delete attempts;
- administrator-role verification through the public RPC endpoint; and
- proof that blocked operations left the temporary records unchanged.

A non-zero process exit code means at least one check failed. Save the console
output as launch evidence only after every check passes.
