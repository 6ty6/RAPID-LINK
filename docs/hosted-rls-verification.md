# Hosted anonymous-write verification

This check provides the anonymous-write evidence requested in Edmund's review.
It verifies the hosted database directly and does not require Docker.

## Run the check

1. Open the production project in the Supabase SQL Editor.
2. Open `supabase/verification/verify_anonymous_writes_blocked.sql` from this
   repository and copy the complete script into a new query.
3. Run the complete script once.
4. Confirm that the result contains exactly two rows and that both results are
   `PASS`:

   - `Anonymous news creation`
   - `Anonymous vacancy creation`

5. Export the result as `Anonymous Write Protection Verification.csv`.
6. Capture the result grid as
   `05 - Anonymous Write Protection Verification.png`.

The script uses PostgreSQL's `anon` role, which is the role used by public API
requests. Every attempted insert is protected by two rollback mechanisms, so
the check does not leave test content or permanent verification functions in
the hosted database.

Do not include API keys, passwords, access tokens or unrelated browser tabs in
the evidence screenshot.
