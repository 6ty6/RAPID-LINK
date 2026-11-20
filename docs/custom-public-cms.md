# RapidLink custom public CMS

Local implementation, 20 November 2026. CMS source branch: `feature/custom-public-cms`. Combined website/Abena test branch: `integration/cms-abena-preview` (see `docs/cms-abena-preview.md`).

## What is built

The React website now has a separate staff workspace at `/cms`. It uses a small Node service, SQLite for content and permissions, private filesystem storage for images, and the existing Supabase service for invited staff authentication. No Sanity subscription or AI API is required by this CMS. Hosting, persistent storage, backups, authentication usage and ongoing maintenance can still incur costs.

Staff land on an overview with four content groups: Website & Homepage, News & Careers, Company Information and Customer Help. Workflow totals show drafts, items awaiting review and approved items ready to publish. Select a category to browse its records; opening a record replaces the list with a focused editor, with a back button and Write → Review → Publish guidance. On mobile, **Browse sections** opens the grouped navigation. Image library, activity log and administrative tools are kept separate from everyday content editing.

The implementation is isolated in `.worktrees/custom-public-cms`, currently checked out on the combined integration branch. The CMS has not been merged into `main`, deployed, or connected to a hosted staff directory. Abena has been released separately to `main`; the integration branch combines her with the custom CMS for testing.

Features:

- Typed editors for news, vacancies, pages, products, announcements, FAQs, branches, board profiles, digital channels, approved document URLs, homepage flyers, prepared Abena answers and public site settings.
- Writers, approvers and administrators, with backend department checks using Credit, Finance, Human Resources, Marketing/Sales, Operations and Strategy Support.
- Invitation-only staff login; authenticator-based MFA required by default. Authentication sessions stay in memory, rather than local storage.
- Draft → review → approved → published. The creator and most recent editor cannot approve their own record, including administrators. Publication requires a separate approver or administrator. An administrator may publish another person's approved version.
- Draft edits leave the current release unchanged. Saving invalidates approval. Version checks reject stale edits instead of overwriting another editor.
- Return-for-changes notes, unpublishing, archiving, revision history, restore-as-draft and an append-only application audit log.
- Private image uploads, limited to PNG/JPEG/WebP, decoded and re-encoded as WebP without uploaded metadata. Draft images require staff access; only images referenced by published releases become public.
- Administrator-managed access and revocation; invitations alone do not grant CMS membership. Staff cannot change their own role or revoke the last administrator.
- Existing public copy can be imported as drafts without overwriting matching kind/slug records. Nothing is published automatically. Existing board and vacancy prototypes are retained as draft sources, following Caleb's instruction; import is not confirmation that a vacancy is current.
- JSON export, complete SQLite/media backup, checksum verification and tested restoration into a separate directory.

No customer applications, IDs, signatures, transactions, complaint cases, subscriber records, private annual reports or financial statements belong here. The calculator and its approved parameters are unchanged.

## Run the local demonstration

Use Node 24 or newer. From this worktree in PowerShell:

```powershell
cd '.worktrees/custom-public-cms'
npm.cmd install
npm.cmd run cms:install
npm.cmd run cms:dev
```

If already inside the worktree, omit the `cd` line. Open **http://127.0.0.1:5182/cms**. The API binds to **127.0.0.1:8791**. The demo enables the custom public adapter only in that process and writes to ignored `.cms-data/demo`. No real staff credentials are needed. Demonstration authentication is refused when `NODE_ENV=production`.

1. Choose **Demo writer**, create a FAQ, save it and submit for review.
2. Sign out, choose **Demo approver**, open the FAQ and approve it.
3. Publish the approved version, then open `/faqs` in another tab.
4. Edit the draft to confirm the published copy stays unchanged. Unpublish to withdraw it.
5. Choose **Demo administrator** to inspect staff access. Open **Import & export** under **Workspace tools** to import the existing site copy as drafts or export content. Imported records use their suggested owner departments; the administrator can review records across departments but cannot approve their own imports. Assign a separate approver in the relevant department.

The demo starts empty apart from its staff accounts. The public preview therefore has empty managed sections until records are published. This is intentional; it must not silently restore withdrawn content from the old static source. Test records persist across restarts. Do not use the demo database in production.

## Public website integration

The normal build defaults to `VITE_CUSTOM_CMS_ENABLED=false`; it keeps the existing content sources. Set `VITE_CMS_API_BASE_URL` to the approved HTTPS service origin when deploying the staff workspace. After migration and review, enable `VITE_CUSTOM_CMS_ENABLED=true` and rebuild to switch public content to the custom API.

Connected consumers are news listings/articles, careers, FAQs, announcements, homepage flyers, products, board profiles, digital channel cards, branch cards/directions, footer email/phone/copy, page heroes/sections and `/public-documents`. A published page with a new slug can be displayed at `/<slug>`. Existing PageHero-based routes can receive matching page metadata and additional sections. Existing specialised layouts, institutional body copy, navigation, header contact shortcuts, fixed-deposit rate tables and calculator code remain interface/local configuration; this is not a visual page builder.

The API provides only published snapshots. The browser refreshes them every 30 seconds and when returning to the tab. If the service fails, managed collections clear and an unavailable notice appears; it does not fall back to stale static news or vacancies. Search prerendering/hosting must fetch the published API at build time before a production migration if complete crawler HTML is required; this implementation does not add a prerender job.

The controller rates viewer reads the published document slug `controller-loan-rates-guide` in custom mode. Other approved public documents appear at `/public-documents`. Documents use existing approved file URLs; uploading arbitrary PDFs is not implemented. No missing form or KYC checklist is invented.

On `integration/cms-abena-preview`, Abena reads published prepared answers and FAQs through the public adapter, with published branch/product/contact guidance. Drafts are excluded. Matching uses complete example questions with normalised case and basic punctuation; this remains prepared local matching, with no AI or WhatsApp conversation API. The production `main` branch still has the original prepared replies and is not switched to the custom CMS.

The old `/content-management` portal still manages its legacy Supabase tables. It does not write to the new CMS. Choose one content source for production; do not tell staff to maintain both.

## Configure invited staff for a real environment

1. Copy `server/cms/.env.example` to `server/cms/.env`, which is ignored. Configure the exact approved HTTPS website origin, persistent `CMS_DATA_DIR`, Supabase authentication URL and **publishable** key. Never use a service-role key. Do not put server credentials in `VITE_` variables.
2. In the approved Supabase project, disable public sign-ups and configure `/cms` on the preview/production website as an allowed invitation redirect. Invite the initial administrator through the Supabase dashboard. Set their UUID as `CMS_BOOTSTRAP_ADMIN_ID` before the first start. Bootstrap runs only when the staff registry is empty; it never reactivates a revoked account.
3. Run `npm.cmd run cms:start`. The backend uses `PORT` (8791 by default); in production its private database is `CMS_DATA_DIR/cms.sqlite` and images are `CMS_DATA_DIR/media`. Do not expose this directory as static files.
4. Open the invitation, set a password and enrol an authenticator. Invite a second staff member through Supabase, then add their exact UUID, department and role under **Staff access**. Test with two different accounts. Check incorrect department access, MFA enforcement, session expiry and revocation against the actual hosted project.
5. Check redirects and MFA with the real provider before launch. Local auth tests simulate the provider response; they are not proof that the hosted project is configured correctly. No hosted sign-up setting, migration state or legacy RLS test is claimed verified by these tests.

Backend access uses the validated Supabase user response plus MFA assurance, followed by a fresh active-membership lookup for every staff request. All permission rules also run on the server. HTTPS, an exact CORS origin and bearer tokens protect staff operations; no cookie session is used. Content is plain text rendered through React, not arbitrary HTML.

## Hosting and operations

This needs a **single Node service with a persistent local disk**, in addition to the static website. Do not deploy its SQLite database on an ephemeral filesystem or a shared network disk. Do not horizontally scale this version. A process restart without the persistent disk would lose content; free static hosting alone cannot run this backend. IT must confirm the hosting plan, storage, region, access owner, monitoring and backup budget. A later AWS/Postgres adapter is a separate migration.

Configure HTTPS termination and ingress rate limiting, a health check at `/health`, service error monitoring, disk-capacity alerts, dependency updates and off-site encrypted backups. The in-process staff limit is deliberately simple and is not a replacement for an ingress abuse-control service. The application audit log rejects updates/deletes through SQLite triggers, but database/server operators can still change the database; retain external operational logs if tamper-evident auditing is required.

An API outage does not cause the health endpoint to test Supabase connectivity. Staff configuration, real invitation delivery and end-to-end MFA still require an environment acceptance test. An independent security review remains appropriate before staff production use.

## Back up and restore

JSON export is useful for an exit path, but it is **not** a complete disaster-recovery backup: it does not include image bytes or the Supabase identity service. Protect exports because they include drafts, revision notes and staff access metadata.

For a complete local content backup, stop uploads/edits during a maintenance window and run:

```powershell
node server/cms/backup.mjs 'C:\private-cms-data' 'D:\private-cms-backups\2026-11-20'
node server/cms/backup.mjs --verify 'D:\private-cms-backups\2026-11-20'
```

Use your actual approved private paths. The destination must be new and outside the live directory. The command includes the full database, audit, revisions, staff permissions and image files, plus SHA-256 checksums. Keep encrypted copies off the hosting disk, apply an IT-approved retention schedule and test recovery regularly. Do not place backups under `public`, Git or a public download link. Provider identity accounts and infrastructure configuration need their own recovery arrangements.

To recover: verify the backup; stop the service; copy `cms.sqlite` and `media` into a **new private data directory**; point a staging service's `CMS_DATA_DIR` there; check staff access, record history, private/published images and public pages; then switch production to that verified directory. Retain the previous directory for rollback. Do not copy a running database file directly or mix its old WAL files with a restored database. The automated recovery test uses a separate temporary directory and does not overwrite live data.

## Verification

```powershell
npm.cmd run cms:test
npm.cmd test
npm.cmd run cms:test:e2e
npm.cmd run build
```

The CMS backend tests cover permissions, separate approval, draft privacy, optimistic concurrency, revisions, image sanitisation and publication visibility, production authentication checks with a simulated provider, persistence, backup verification and recovery. Browser tests cover writer/approver/public workflows and responsive layout on desktop and mobile. Existing website unit tests cover default behaviour with the custom adapter disabled.

Verified on the integration branch: 14 backend tests, 47 website/unit tests and 8 desktop/mobile browser tests passed; the production build passed. The build retains the existing large PDF bundle warning. No test results here constitute a live production security audit.

Live deployment, persistent disk provisioning, real staff invitations/MFA, real-world backup scheduling and a production content migration remain deployment/integration work. They have not been performed automatically. Abena's CMS connection is implemented only on the combined preview branch.
