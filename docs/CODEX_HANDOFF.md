# RapidLink Website — Codex Handoff

**Prepared for:** Continuing this project in Codex on another computer  
**Prepared by:** Caleb Adom Awuah with Codex  
**Last updated:** 6 November 2026  
**Repository branch:** `cms-restructure`  
**Production branch:** `main`  
**Working website domain:** `https://rapidlinkgh.com`  

## 1. Read this first

Before changing any file, verify the proposed work against:

1. `C:\Users\THEGHOST\Desktop\Website_Project_Review_Caleb.docx` — Edmund's original review document. Copy it securely to the new computer because it is outside the Git repository.
2. `docs/rapidlink-content-models.md` — approved working content-model specification.
3. `docs/current-content-to-model-map.md` — map from current hard-coded content to future models and access functions.
4. `docs/supabase-security-checklist.md` — Supabase security verification instructions.

Edmund Nii Odoi Akogyeram's review dated 6 November 2026 is the controlling brief. Do not begin a new feature merely because it appears useful; first confirm that it is within the review's requested scope.

## 2. Project purpose

This is the redesign and restructuring of the public RapidLink Microfinance website. It is a React/Vite application intended to advertise the company, explain its products and services, publish approved public information and provide safe links to external services.

The public website must not become an internet-banking system. Transactions, balances, payments, customer applications, complaint cases, subscription records and other customer data require separate secure backends.

## 3. Confirmed architectural boundary

- The content-management system is for **public content only**.
- Complaints, subscriptions, account applications, loan applications and other personal data stay outside the public CMS.
- Do not expose secrets in React, Git, `.env.example` or any `VITE_` variable.
- Anonymous visitors may read only published content.
- Staff access must be invitation-only and enforced by the backend/database, not merely hidden in the interface.
- External links must open safely with `target="_blank"` and `rel="noopener noreferrer"` where appropriate.
- The website should eventually retrieve editable content through one stable content-access layer, regardless of the selected CMS.

## 4. Edmund's verified instructions

The original review was read directly through Microsoft Word before this handoff was created. The important instructions are:

### Immediate/blocking

- The current loan calculator is considered misleading because its label says 6% annually while its formula multiplies 6% by every month.
- Credit must provide the actual pricing method and product-specific rates.
- At least three sample results must be checked against Flexibank schedules and retained as automated tests.
- Results must visibly state that they are estimates, not offers.
- Annual rates and APR must be disclosed.

**Current user instruction:** Do not touch the calculator for now. Treat this as an unresolved blocker and do not present the site for a wider demo until the business supplies the required figures.

### Content-management direction

- Pause new admin features. Do not continue extending `/content-management` or `/career-management` except for the security fixes requested in the review.
- Define content models with fields, owner and approver.
- Move editable content out of React components into structured records.
- Add a single content-access layer such as `getNews()` and `getVacancies()`.
- Plan build-time fetching/pre-rendering so search engines receive complete HTML.
- Work on a branch with preview deployments so `main` remains stable.

### CMS research deliverable

By **Friday, 13 November 2026**, prepare a two-to-three-page comparison of at least three CMS options covering:

- an admin layer over the existing database;
- a self-hosted open-source headless CMS;
- a hosted/SaaS headless CMS; and
- optionally a Git-based editor.

Compare staff roles, invitations/SSO, workflow, revision history, audit log, ease of use, previews, React/Supabase/Postgres fit, pre-rendering, AWS fit, maintenance, backups, monitoring, three-year cost, data location, export/exit path, security record and project maintenance. Include a recommendation, reasons and risks. A local test-data-only demo of the preferred option is desirable if practical.

### Before production

- Confirm public Supabase sign-ups are disabled.
- Provide Row Level Security policies and a test proving anonymous writes fail.
- Return a real HTTP 404 status for unknown URLs; a client-side 404 with HTTP 200 is insufficient.
- Use absolute and page-specific social metadata.
- Confirm the canonical production domain.
- Approve privacy/legal content before any form submits personal information.
- Confirm production hosting; Render free tier is acceptable only for preview because of idle sleep/wake delay.
- Run `securityheaders.com` and a Lighthouse mobile audit and include results in the next update.

## 5. Work completed in the latest stage

### Formal content-model deliverables

- `docs/rapidlink-content-models.md`
- `docs/RapidLink Website Content Models - Caleb Adom Awuah.docx`

The document defines public content models, proposed fields, owners, approvers, workflow, security boundaries, implementation sequence and pending departmental decisions.

### Current-content mapping

- `docs/current-content-to-model-map.md`

This maps the website's current content sources to models and proposed stable functions. It explicitly distinguishes public managed content, global settings, application configuration, interface code, secure backend data and pending content.

### Supabase security preparation

- `supabase/migrations/202611060001_harden_content_read_policies.sql`
- `supabase/tests/database/content_management_rls_test.sql`
- `docs/supabase-security-checklist.md`
- `npm run test:db` script in `package.json`
- corresponding updates in `supabase/careers.sql`

Local database testing was postponed because `supabase start` downloaded large Docker images and filled disk space. The downloaded Supabase Docker images were removed, reclaiming approximately 2.06 GB. Do not claim the database security tests passed; they remain **not run**.

## 6. Existing content-management implementation

The current prototype includes:

- `/content-management` protected staff interface;
- `/accept-invite` invitation/password setup;
- Supabase authentication;
- news and vacancy tables;
- public/draft controls;
- news image uploads;
- delete and unpublish controls; and
- automatic content-admin authorisation for invited Supabase users.

Relevant migrations:

```text
202611050001_content_management.sql
202611050002_seed_publication_ready_news.sql
202611050003_content_delete_policies.sql
202611050004_import_static_site_content.sql
202611050005_news_image_storage.sql
202611050006_auto_authorize_invited_users.sql
202611060001_harden_content_read_policies.sql
```

Do not assume every local migration has been applied to the hosted Supabase project. Verify migration state through the approved project before relying on it. Do not extend this prototype into a complete custom CMS until the CMS comparison is reviewed.

## 7. Current Git state

At handoff creation:

- Current branch: `cms-restructure`
- `main`, `origin/main` and `origin/cms-restructure` point to commit `5d971ca` (`new url`).
- The latest restructuring and security work is still uncommitted.

Known working-tree items:

```text
M  package.json
M  supabase/careers.sql
?? docs/RapidLink Website Content Models - Caleb Adom Awuah.docx
?? docs/CODEX_HANDOFF.md
?? docs/current-content-to-model-map.md
?? docs/rapidlink-content-models.md
?? docs/supabase-security-checklist.md
?? supabase/migrations/202611060001_harden_content_read_policies.sql
?? supabase/tests/
?? tools/
```

There may also be a temporary Word lock file similar to:

```text
docs/~$pidLink Website Content Models - Caleb Adom Awuah.docx
```

Close Microsoft Word and remove that temporary lock file before committing. Never commit it.

Before committing:

1. Run `git status --short`.
2. Inspect every diff.
3. Ensure no `.env`, authentication token, Supabase secret, personal document or generated temporary file is staged.
4. Run the available unit tests and production build.
5. Commit only reviewed files to `cms-restructure`.
6. Push `cms-restructure`; do not merge into `main` until the work is reviewed.

## 8. Current content sources that need restructuring

The detailed mapping is in `docs/current-content-to-model-map.md`. Important current sources include:

- `src/content.js`: announcements, news, vacancies, products, FAQs and navigation;
- `src/pages/Home.jsx`: slider, quick-access content, homepage sections and featured products;
- `src/pages/Products.jsx`: product actions, fixed-deposit rates and loan-rate document metadata;
- `src/pages/Information.jsx`: institutional profile, mission/vision, counters, board members, digital channels, newsroom, careers, FAQs, branches and contact information;
- `src/pages/Loans.jsx`: public loan guidance and the blocked calculator;
- `src/components/Shared.jsx`: app-download content and common page content;
- `src/components/Header.jsx` and `src/components/Footer.jsx`: duplicated contacts, navigation, social links and company copy;
- `src/services/careers.js`: direct Supabase news/vacancy access; and
- `src/hooks/usePublishedNews.js`: hybrid local/Supabase news loading.

## 9. First content-access implementation (completed 6 November 2026)

The first version is now implemented on `cms-restructure`. Public consumers use
`src/content/index.js` for announcements, FAQs, grouped navigation, products,
news and vacancies. The local adapter retains the existing data; the public
Supabase news/vacancy calls are wrapped without extending the admin portal.
Record contracts and the remaining migration/pre-rendering plan are documented
in `docs/content-access-layer.md`.

Verification: all 36 unit/application tests passed and the production build
passed. The build reports a PDF chunk over 500 kB. Database RLS tests were not
run as part of this work. Calculator code, admin features and database models
were not changed. These implementation changes are included in the local
content-access refactor commit prepared on 9 November 2026; they are not deployed.
At preparation time, `origin/cms-restructure` contained two newer commits
(`53c324d` and `64e4331`) with overlapping restructuring work. Reconcile those
changes before pushing; the local verification covers this working tree only.

The original Word review was unavailable on this computer; the user directed
continuation using the verified instructions recorded in this handoff.

Next: review this first adapter, then incrementally extract homepage sections,
institutional copy, board records, digital channels, branches, contacts and
document metadata. Preserve current output and the pause on calculator/admin
work. The CMS comparison and business approvals remain pending.

Original task and migration sequence, retained for reference:

Build the first version of the **single content-access layer** without changing customer-visible output and without selecting a final CMS.

Recommended sequence:

1. Create a stable module such as `src/content/index.js`.
2. Define consistent record shapes for pages, products, announcements, FAQs, news, vacancies, branches, contacts, board members, digital channels and documents.
3. Use the existing structured local content as the first adapter.
4. Wrap existing Supabase news/vacancy calls behind the same interface.
5. Update one low-risk consumer at a time, starting with announcements or FAQs.
6. Add tests proving output is unchanged.
7. Do not move or modify the calculator parameters.
8. Do not add new admin editors or database models while the CMS decision is pending.

Proposed public functions are documented in `docs/current-content-to-model-map.md`, including:

```text
getPage(slug)
getNavigation()
getAnnouncements()
getProducts()
getProductBySlug(slug)
getCurrentRates()
getNews(filters)
getNewsBySlug(slug)
getVacancies(filters)
getFaqs(filters)
getBoardMembers()
getBranches()
getOfficialContacts()
getSocialProfiles()
getDigitalChannels()
getDocuments(filters)
```

## 10. Business information still required

Do not invent these values:

- loan pricing method, product-specific rates, APR, fees and calculator disclosures;
- sample Flexibank repayment schedules;
- current savings, investment and fixed-deposit rates;
- complete schedule of fees and charges;
- complaint acknowledgement, resolution and escalation timelines;
- approved licensing/deposit-protection wording;
- privacy policy, terms of use, cookie notice and accessibility statement;
- management profiles, annual reports/financial statements and whistleblowing channel;
- verified official branch opening hours and holiday notices;
- approved downloadable forms and KYC checklists;
- production account-opening/application integration contract; and
- final content owners and approval authority.

## 11. Environment and deployment notes

- The production branch is `main`.
- Work should continue on `cms-restructure` with preview deployments.
- Render is currently used for preview/testing.
- RapidLink uses AWS for much of its infrastructure; the CMS comparison must state what should remain on Supabase/Render and what may need AWS hosting, storage, DNS, email or database support.
- Public environment variable names are documented in `.env.example`.
- Never copy real credentials into this handoff or Git.
- On the second computer, create local environment variables securely and configure Render separately where needed.

## 12. Starting prompt for the new Codex chat

After cloning the repository and checking out `cms-restructure`, start the new chat with:

```text
Read docs/CODEX_HANDOFF.md, docs/current-content-to-model-map.md,
docs/rapidlink-content-models.md and Edmund's original review document before
doing anything. Treat Edmund's review as the controlling brief. Verify each
proposed task against it. Do not touch the loan calculator, do not extend the
admin portal, and do not add new CMS tables while the CMS comparison is
pending. Inspect the current Git state, then continue with the single
content-access layer without changing customer-visible output.
```

## 13. Definition of a safe continuation

The transfer is successful when the new computer has:

- the repository checked out on `cms-restructure`;
- the same reviewed project files from Git;
- Edmund's original review document available locally;
- no copied authentication tokens or secrets;
- a Codex chat that has read this handoff and the two content documents; and
- a verified plan that stays within the pause on admin features and the calculator instruction.

