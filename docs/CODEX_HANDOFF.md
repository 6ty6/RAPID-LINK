# RapidLink Website — Codex Handoff

**Prepared for:** Continuing this project in Codex on another computer

**Prepared by:** Caleb Adom Awuah with Codex

**Last updated:** 10 November 2026

**Active development branch:** `cms-restructure`

**Production branch:** `main`

**Working website domain:** `https://rapidlinkgh.com`

## 1. Read this first

Edmund Nii Odoi Akogyeram's final six-page review dated 6 November 2026 is the controlling brief. Its page count was confirmed in Microsoft Word on 10 November 2026. Before changing the project, verify the proposed work against:

1. `C:\Users\THEGHOST\Desktop\rapid doc\Website_Project_Review_Caleb.docx` — Edmund's original review on the current computer. This file is outside Git and must be copied securely to the work computer; its local path may change there.
2. `docs/rapidlink-content-models.md` — working content-model specification.
3. `docs/current-content-to-model-map.md` — current-content mapping and proposed access functions.
4. `docs/supabase-security-checklist.md` — Supabase verification procedure.
5. `docs/implementation-plan.md`, `docs/integration-notes.md`, `docs/site-inventory.md` and `docs/verification.md` — supporting implementation records.

Do not begin a feature merely because it appears useful. First confirm that it is within Edmund's requested scope and the user's current instructions.

## 2. Project purpose and boundary

This is the React/Vite redesign and restructuring of the public RapidLink Microfinance website. It advertises the company, explains products and services, publishes approved public information and links customers to approved external services.

The public website and public CMS must not become an internet-banking or customer-case system. Keep the following outside the public CMS and website front end:

- account balances, transactions and payments;
- loan or account applications containing customer data;
- complaint submissions and case histories;
- newsletter subscriber records;
- customer identity documents;
- credit decisions; and
- passwords, PINs and one-time codes.

Do not expose secrets in React, Git, `.env.example` or a `VITE_` variable. External links must continue to use safe new-tab handling where appropriate.

## 3. Edmund's controlling instructions

### Loan calculator blocker

Edmund identified the calculator as a blocker before any wider demonstration. Its label says the hard-coded 6% is annual, while the current formula applies it for every month.

Required later:

- obtain the pricing method and product-specific rates from Credit;
- disclose annual rates, APR and applicable fees;
- compare at least three examples with Flexibank schedules and preserve them as automated tests; and
- show visible “estimate, not an offer” wording.

**Current user instruction:** Do not touch the calculator yet. Treat it as an unresolved blocker and do not claim it is approved or ready for a wider external demonstration.

### Content-management direction

- Pause new custom admin features. Do not extend `/content-management` or `/career-management` beyond required security fixes.
- Define content models with fields, owner and approver.
- Move editable content out of React components into structured records.
- Make public pages retrieve content through one content-access layer.
- Plan pre-rendering and rebuild-on-publish behaviour.
- Keep restructuring on `cms-restructure` with preview deployments so `main` remains stable.

### CMS comparison deadline

By **Friday, 13 November 2026**, deliver a two-to-three-page comparison of at least three CMS options. Cover:

- an administration layer over the existing database;
- a self-hosted open-source headless CMS;
- a hosted/SaaS headless CMS; and
- optionally a Git-based editor.

Compare invitation/SSO, department roles, draft-review-publish workflow, revision history, activity logs, editor usability, previews, React/Supabase/Postgres fit, pre-rendering, AWS compatibility, patching, backups, monitoring, data location, three-year cost, export/exit path, security record and project maintenance. Provide a recommendation, reasons and risks. Use official sources and test data only.

### Before production

- Confirm public Supabase sign-ups are disabled.
- Provide RLS policies and evidence that anonymous writes fail.
- Return a real HTTP 404 status for unknown URLs.
- Verify absolute and page-specific social metadata on the final domain.
- Confirm the canonical production domain.
- Approve privacy/legal content before any form submits personal information.
- Select production hosting; Render free tier is preview-only.
- Run SecurityHeaders.com and a Lighthouse mobile audit and retain the results.

## 4. Current Git state

Merge prepared on 9 November 2026:

```text
Current branch:          cms-restructure
Local work preserved:    2d98329 (public content-access layer and tests)
Remote work preserved:   53c324d (content extraction), 64e4331 (handoff)
Local recovery branch:   backup/cms-restructure-before-sync-20261109
```

The reconciliation combines both histories in a merge commit, without rewriting
either version. Public components use `src/content/index.js`; the earlier
`src/services/content/index.js` interface delegates to it for compatibility.
Verify the final commit and sync state with `git log -1` and `git status -sb`.
Production `main` is outside this merge.

Before every commit:

1. Inspect `git status --short` and the diff.
2. Ensure no `.env`, token, secret, personal document or Word lock file is staged.
3. Run unit tests and a production build.
4. Commit and push only to `cms-restructure`.
5. Do not merge into `main` without review and approval.

## 5. Completed restructuring

### Content models and mapping

Completed documentation:

- `docs/rapidlink-content-models.md`
- `docs/RapidLink Website Content Models - Caleb Adom Awuah.docx`
- `docs/current-content-to-model-map.md`

These define the public content types, fields, proposed owners and approvers, workflow, security boundary and unresolved departmental inputs.

### Single content-access layer

Canonical interface and contract tests are under `src/content/`:

```text
contracts.js
index.js
index.test.js
local.js
repository.js
repository.test.js
```

Public components now use stable functions rather than importing storage-specific
data or calling Supabase directly. The current adapters provide bundled content
and existing Supabase news/vacancy content. The bundled-data access and Supabase
bridge from the remote branch remain under `src/services/content/`; its index
is a compatibility facade over the canonical repository, retaining its original
tuple/keyed-map return shapes. New public consumers use `src/content/index.js`.
See `docs/content-access-layer.md` for the API and reconciliation details.

The administrative authentication and mutation functions remain in `src/services/careers.js`; do not expand them while the CMS decision is pending.

### Structured content migrated

The following content is now outside the React presentation components:

- `src/content/site.js`
  - official email and support numbers;
  - loan-support numbers;
  - both branch records and map information;
  - official social profiles; and
  - digital channels.
- `src/content/home.js`
  - homepage metadata;
  - slider text, images, links and ordering;
  - quick-access cards;
  - news-section settings;
  - service links; and
  - featured-product selection.
- `src/content/institutionalProfile.js`
  - hero content;
  - institutional profile paragraphs;
  - Mission and Vision cards; and
  - impact statistics.
- `src/content/board.js`
  - Board page hero;
  - member names, roles and display order;
  - portraits and alternative text; and
  - biographies.

React still controls layout, animations, icons, responsive behaviour, accessibility, flip-card interaction, counters and profile dialogues. Customer-visible wording and appearance were intentionally preserved.

### Updated public consumers

The new access layer is used by the header, footer, announcement bar, homepage, product pages, FAQs, news hook, careers page, contact page, digital-channels page, loan-support guidance, Institutional Profile and Board of Directors page.

### Verification evidence

Latest local extension on 9 November 2026: general page hero/SEO records now live
in `src/content/pages.js`, and the existing Controller guide metadata lives in
`src/content/documents.js`. Public getters are `getPage`, `getDocuments` and
`getDocumentBySlug`. Document lists/lookups exclude drafts and records without a
file path. The guide's existing public availability is preserved while its
business verification remains pending; missing dates/versions are not invented.
See `docs/content-access-layer.md` for the future-document addition procedure.
No upload/editor features were added. Calculator logic and pricing tables are
unchanged. These latest metadata changes are local and uncommitted.

The subsequent shared-content extraction adds `src/content/shared.js` and
`getSharedContent()` for the existing mobile-app promotion and footer copy.
Store URLs remain application configuration. Both app-download consumers,
footer links, menu behavior and pending privacy wording are preserved. These
changes are also local and uncommitted.

Pre-rendering is now implemented locally. `npm.cmd run build` generates complete
HTML and absolute route metadata for public routes, including published stories.
The configured-content verification generated 26 routes. Staff/invitation routes
and the calculator remain SPA-only. Preview indexing stays disabled by default.
Public JSON snapshots support hydration; failed content retrieval stops the
build. Rebuild and deploy after publishing/unpublishing to refresh static copies.
See `docs/pre-rendering.md` for source selection, hosting fallback changes and
verification. No live deployment or rebuild webhook was configured.
These changes and the preceding extractions remain uncommitted.

The subsequent HTTP 404 implementation generates `dist/404.html`, reserves SPA
rewrites for exact valid staff/invitation/calculator routes and removes wildcard
200 fallbacks. Missing pages/articles/assets return 404 in the built local
preview; all public and allowed SPA routes still return 200. The error message
works without JavaScript. See `docs/http-404.md`; actual Render/CDN status and
custom-error-body verification remains required after preview deployment.

After the latest migrations:

```text
npm.cmd test       53/53 tests passed after HTTP 404 handling
npm.cmd run build  passed
npm.cmd run test:prerender  8/8 desktop/mobile and HTTP checks passed
```

The build still reports a non-failing large-chunk warning caused mainly by PDF.js assets. This is a later performance/code-splitting task, not a current functional failure.

Tests confirm that the existing calculator remains unchanged. This is intentional and does not mean its formula has been approved.

## 6. Supabase security status

Prepared files:

- `supabase/migrations/202611060001_harden_content_read_policies.sql`
- `supabase/migrations/202611100001_consolidate_content_admin_role.sql`
- `supabase/tests/database/content_management_rls_test.sql`
- `supabase/verification/verify_consolidated_content_role.sql`
- `tools/verify-hosted-content-api.mjs`
- `docs/supabase-security-checklist.md`
- `docs/hosted-api-security-tests.md`
- `npm run test:db`
- `npm run test:hosted-api`
- corresponding changes in `supabase/careers.sql`

The earlier Docker-backed run passed 28/28 checks on 9 November 2026. Evidence:
`docs/security-evidence/local-rls-2026-11-09.md`. After Edmund's follow-up, the
suite was expanded to **36 checks**. On 10 November 2026 the reset local
Supabase stack applied the role-consolidation migration and all **36/36 pgTAP
checks passed**. Evidence: `docs/evidence/Local RLS verification tests pass.png`.

The role-consolidation migration has also been applied to the hosted project.
Its read-only verification returned **7/7 PASS**, including one administrator
table, removal of the legacy function and policies, `SECURITY DEFINER`, the
fixed `public, pg_temp` search path, a complete vacancy policy set and
administrator access to drafts. Evidence:
`docs/evidence/Consolidated Content Role Verification - PASS.png` and
`docs/evidence/Consolidated Content Role Verification.csv`.

Two dedicated hosted test accounts have been created and their role assignment
has been verified: one content administrator and one ordinary authenticated
user. Evidence: `docs/evidence/Hosted Test User Role Verification - PASS.png`
and `docs/evidence/Hosted Test User Role Verification.csv`. On 10 November 2026
the hosted public-API runner passed **22/22 checks** using the publishable key
and the dedicated administrator and ordinary-user accounts. The accepted
terminal-only evidence contains no credentials:
`docs/evidence/Hosted Public API Security Tests - 22 of 22 PASS.png`.

### 6.1 Exact next Supabase test sequence

Steps 1-11 below were completed on 10 November 2026. The test passwords exposed
in the rejected first capture were rotated, the test was rerun, and a sanitized
terminal-only result was retained as evidence.

1. In the hosted Supabase SQL Editor, run the complete file:
   `supabase/migrations/202611100001_consolidate_content_admin_role.sql`.
2. Run the read-only evidence query:
   `supabase/verification/verify_consolidated_content_role.sql`.
3. Confirm every result is `PASS`. Export the result as CSV and take a screenshot
   without exposing unrelated tabs, keys or personal data.
4. Create two dedicated Authentication users:
   - one approved test administrator whose UUID is in `public.content_admins`;
   - one ordinary signed-in test user whose UUID is not in that table.
5. Do not use a real employee password. Put the dedicated test credentials only
   in `.env.local` on the test computer:

```text
HOSTED_TEST_ADMIN_EMAIL=
HOSTED_TEST_ADMIN_PASSWORD=
HOSTED_TEST_NON_ADMIN_EMAIL=
HOSTED_TEST_NON_ADMIN_PASSWORD=
```

6. Keep the existing `VITE_SUPABASE_URL` and public
   `VITE_SUPABASE_ANON_KEY` values in `.env.local`. Never add a service-role key.
7. Run:

```powershell
npm.cmd run test:hosted-api
```

8. Expect **22/22 hosted public-API checks passed**. The script tests public
   reads, draft restrictions, anonymous insert/update/delete, signed-in
   non-admin insert/update/delete and administrator-role recognition. It creates
   temporary records and attempts to remove them in `finally` cleanup.
9. Save the successful console output as evidence. Never include passwords,
   access tokens or the full contents of `.env.local`.
10. When Docker disk space is available, run the expanded local suite:

```powershell
npx.cmd supabase start
npx.cmd supabase db reset
npm.cmd run test:db
```

11. Expect all **36/36** pgTAP checks to pass. Stop the local Supabase stack
    after retaining the evidence if disk space is limited.

The anonymous storage-upload restriction still requires a separate public-API
test. Do not represent the 36 database checks, the seven hosted schema checks,
or the 22 content-table API checks as proof of storage-bucket write
protection.

## 7. Existing content-management prototype

The prototype already includes:

- `/content-management` staff interface;
- `/accept-invite` invitation/password setup;
- Supabase authentication;
- news and vacancy management;
- publish/unpublish and delete controls; and
- news image uploads.

Existing migrations run from `202611050001_content_management.sql` through `202611050006_auto_authorize_invited_users.sql`, followed by the hardening migration dated `202611060001` and the applied single-role migration dated `202611100001`.

The new migration copies all legacy `career_admins` members into
`content_admins`, replaces overlapping vacancy policies, recreates
`is_content_admin()` as `SECURITY DEFINER` with
`search_path = public, pg_temp`, and then removes `is_career_admin()` and the
legacy table. It has been applied to the hosted project and its seven
consolidation checks have passed.

Do not assume every migration exists in the hosted project. Verify it. Do not build more custom CMS features until Edmund reviews the CMS comparison.

## 8. Exact next priority

The next priority is the CMS comparison due **Friday, 13 November 2026**. Do not start another large custom-admin feature first.

Recommended work sequence:

1. Research current CMS capabilities and pricing using official primary sources.
2. Compare at least three categories, including existing-database admin, self-hosted and SaaS.
3. Calculate and explain three-year costs and operational responsibility.
4. Assess AWS fit, Supabase/Postgres fit, pre-rendering and exit/export options.
5. Recommend one option with reasons, risks and mitigations.
6. Produce a two-to-three-page Word document that remains searchable and accessible.
7. Optionally prepare a local test-data-only demonstration if it can be completed safely.

After the CMS comparison, continue low-risk content restructuring in this order unless Edmund changes direction:

1. product descriptions and images, excluding rates and calculator parameters;
2. review the latest local common-page/document metadata and shared-content extractions;
3. review the local pre-rendering build and plan an approved rebuild-on-publish trigger;
4. preview deployment configuration;
5. verify the implemented 404 routing on the deployed preview and complete production security headers;
6. Lighthouse, accessibility and security-header evidence; and
7. approved regulatory content after departmental sign-off.

Social metadata now uses page-specific absolute `rapidlinkgh.com` images for the
homepage, About pages, Digital Channels and individual stories. Application
tests increased to 54/54 passed and the build still pre-renders 26 public routes.

The production demo passes the repository security-header verifier. The branch
preview was directly observed missing CSP, Permissions-Policy, Referrer-Policy
and X-Frame-Options even though `render.yaml` defines them. Resolve the Render
preview service configuration before accepting preview security evidence. See
`docs/security-header-verification.md`.

PDF.js remains lazy-loaded and is retained for now because direct PDF links
previously downloaded instead of reliably previewing. The final Lighthouse
performance score is 99 with this implementation. See
`docs/pdf-preview-assessment.md`.

## 9. Business information still required

### Availability decisions confirmed on 9 November 2026

- No current downloadable forms or KYC checklist have been supplied; future
  availability is being discussed.
- No new photographs, board biographies or achievements have been supplied;
  obtaining them is being discussed.
- Annual reports and financial statements are **not for public publication**;
  only auditors may view them. Keep them outside the public website/CMS/assets.
- There are no current vacancies; Caleb will be informed of future openings.
- Caleb explicitly instructed **“keep them as they are”** when asked about the
  existing three board profiles and Deposit Mobilization Lead vacancy. Preserve
  those prototype displays; this is not new verification or publication approval.

See `docs/business-content-status.md`. These are documentation updates only;
no hosted records or visible page content were changed.

Do not invent or publish:

- loan pricing method, product-specific rates, APR, fees or calculator disclosures;
- Flexibank comparison schedules;
- current savings, investment or fixed-deposit rates;
- complete fees and charges;
- complaint acknowledgement, resolution or escalation timelines;
- licensing and deposit-protection wording;
- privacy, terms, cookie or accessibility statements;
- management profiles or whistleblowing details;
- branch opening hours and holiday notices;
- downloadable forms or KYC checklists;
- production application integrations; or
- final content owners and approval authority.

Obtain written confirmation from the relevant department and Compliance before publishing these items.

## 10. Deployment and environment notes

- Production branch: `main`.
- Restructuring branch: `cms-restructure`.
- The user confirmed Render as the current hosting choice, including production for now. The production plan is not yet confirmed; the review treats the free tier as preview-only.
- AWS is a possible future hosting direction, not a confirmed migration. The CMS comparison should still assess AWS needs for hosting, database, object storage, DNS, email, monitoring and backups.
- The user confirmed the production domain as `https://rapidlinkgh.com`.
- Never place real credentials in this handoff or Git.
- Create environment variables securely on each computer and in each deployment environment.

## 11. Starting prompt for the work-computer Codex chat

After pulling the repository and checking out `cms-restructure`, use:

```text
Read docs/CODEX_HANDOFF.md, docs/current-content-to-model-map.md,
docs/rapidlink-content-models.md and Edmund's original review before doing
anything. Edmund's review is the controlling brief. Verify every task against
it. Do not touch the loan calculator, do not extend the custom admin portal,
and do not add CMS tables while the CMS comparison is pending. Inspect Git and
confirm cms-restructure is active. The content-access layer and the site,
homepage, Institutional Profile and Board content migrations are complete.
Continue with the CMS comparison due 13 November 2026, using official sources.
The single-role migration is applied and its seven hosted verification checks
passed. The reset local Supabase suite passed 36/36 checks and the hosted
public-API runner passed 22/22 checks with dedicated admin/non-admin users. A
sanitized terminal-only screenshot is stored in `docs/evidence`. Do not present
any content-table result as proof of storage upload restrictions. Follow
section 6.1 exactly.
```

## 12. Safe transfer checklist

The work computer should have:

- the repository pulled on `cms-restructure`;
- this updated handoff commit;
- Edmund's Word review copied securely outside Git;
- no copied Supabase secret, authentication token or production customer data;
- Node dependencies installed locally;
- local environment variables created securely if needed; and
- a fresh `npm.cmd test` and `npm.cmd run build` result before further edits.

The transfer is complete only when the work computer verifies the branch, reads the controlling documents and continues without modifying `main`.
