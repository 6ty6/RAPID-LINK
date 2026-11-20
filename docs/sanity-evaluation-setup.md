# Sanity CMS evaluation setup

This branch evaluates Sanity without changing RapidLink's production content source. The public React pages keep their existing content contract; only the repository adapter changes.

## Why this setup stays small

- The website reads Sanity's public CDN with native `fetch`, so no Sanity SDK is added to the production bundle.
- No secret token is stored in the frontend.
- News, vacancies, impact counters, FAQs, announcements, site information,
  calculator settings and shared footer content are included in the evaluation.
- Studio dependencies are not installed until a free Sanity project exists.

## Create the free project

1. Sign in at <https://www.sanity.io/manage>.
2. Create a project named **RapidLink CMS Evaluation** on the **Free** plan.
3. Keep the default public dataset named `production`.
4. The evaluation project ID is `04unhu7g`. A project ID is public configuration, not a password.

Do not add billing details, production customer data, Supabase credentials or real unpublished company information to this evaluation.

## Studio schema

The prepared document types are in `cms/sanity/schemaTypes`:

- `newsArticle`
- `careerVacancy`
- `impactCounter`
- `faq`
- `announcement`
- `siteSettings`
- `loanCalculatorSettings`
- `sharedSettings`

The standalone Studio is in `cms/sanity/studio` and imports these shared schema types. Its dependencies and build output remain isolated from the public website.

The Studio menu is grouped into **News**, **Careers**, **FAQs** and **Impact
numbers**. Each group includes an all-content view plus separate views for
content that is visible on the website and content that is hidden or still a
draft.

Run it locally from the repository root with:

```text
npm --prefix cms/sanity/studio run dev
```

The first visit asks you to sign in to the Sanity account that owns project `04unhu7g`.

## Import the existing FAQs

The FAQ migration copies all seven existing website questions into Sanity,
preserves their order, assigns editorial categories and publishes them. It uses
stable document IDs, so rerunning it updates the same questions rather than
creating duplicates.

Run these commands from the repository root after signing in to the Sanity CLI:

```text
npm.cmd --prefix cms/sanity/studio run migrate:faqs:dry-run
npm.cmd --prefix cms/sanity/studio run migrate:faqs
npm.cmd --prefix cms/sanity/studio run verify:faqs
```

For a new or edited FAQ to appear publicly, enable **Visible on website** and
then publish the Sanity document. Saving only a draft does not update the
website.

## Manage the impact counters

Open **Impact counter** in Studio and create one document per card. For the
current approved website values, enter:

| Counter description | Number | Suffix | Icon | Display order |
| --- | ---: | --- | --- | ---: |
| Branches Nationwide | 2 | | Branches | 1 |
| Happy Customers | 7000 | + | Customers | 2 |
| Years of Service | 15 | + | Years | 3 |
| Financial Products | 5 | + | Financial products | 4 |

For every record, enable **Visible on website**, add the date the figure was
last verified, then click **Publish**. Drafts and records with visibility off
are not returned to the website. Changing **Display order** rearranges the
cards without a code change.

## Connect the website preview

Set these values only on the Sanity preview service or in an uncommitted local `.env.local`:

```text
VITE_CONTENT_SOURCE=sanity
VITE_SANITY_PROJECT_ID=04unhu7g
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2026-11-14
```

In Sanity Manage, open **Settings > API settings > CORS Origins** and add the exact preview origin. Do not allow credentials for public website reads.

The evaluation branch's `render.yaml` already selects Sanity and permits the
project's CDN in the website Content Security Policy. Production remains on
Supabase because these settings exist only on `cms-evaluation/sanity`.

## Evaluation checks

1. Create an unpublished news article and confirm it does not appear publicly.
2. Publish it and enable **Visible on website**; confirm it appears on Stories and the homepage where applicable.
3. Upload an image and confirm its description is required.
4. Create, close and unpublish a vacancy and verify each public state.
5. Create impact counters, change their order and verify their animated values on the Institutional Profile page.
6. Invite a second test user and record what the Free plan's two available roles can and cannot do.
7. Record editing usability, preview experience, audit/history limitations, migration effort, ownership and estimated operating cost.

## Import the existing news and career records

The migration script combines the bundled website records with all managed
Supabase news and vacancy records. Supabase records take precedence where a
matching news slug or vacancy already exists. The script uploads article
images, uses stable Sanity document IDs and preserves published versus draft
status, so rerunning it updates records instead of creating duplicates.

Authenticate the Sanity CLI once. This opens the browser so the project owner
can approve access:

```powershell
Push-Location .\cms\sanity\studio
$env:NODE_OPTIONS='--require=../../../tools/node-userinfo-shim.cjs'
& '.\node_modules\.bin\sanity.cmd' login
Pop-Location
```

From the repository root, inspect what will be transferred without changing
Sanity:

```powershell
Push-Location .\cms\sanity\studio
$env:NODE_OPTIONS='--require=../../../tools/node-userinfo-shim.cjs'
& '.\node_modules\.bin\sanity.cmd' exec 'scripts/migrateExistingContent.js' --with-user-token -- --dry-run
Pop-Location
```

Then perform the transfer:

```powershell
Push-Location .\cms\sanity\studio
$env:NODE_OPTIONS='--require=../../../tools/node-userinfo-shim.cjs'
& '.\node_modules\.bin\sanity.cmd' exec 'scripts/migrateExistingContent.js' --with-user-token
Pop-Location
```

The commands use the current Sanity CLI login and the local, ignored
`.env.local` file. Never commit or paste the Supabase test credentials or a
Sanity token into the migration script.

### Migration result — 16 November 2026

The transfer completed and passed an authenticated raw-dataset verification:

- 5 news articles: 3 published and 2 drafts;
- 2 career records: 1 published and 1 draft; and
- all 5 news records have Sanity image-asset references.

Run the repeatable verification with:

```powershell
Push-Location .\cms\sanity\studio
$env:NODE_OPTIONS='--require=../../../tools/node-userinfo-shim.cjs'
& '.\node_modules\.bin\sanity.cmd' exec 'scripts/verifyMigratedContent.js' --with-user-token
Pop-Location
```

The Sanity Free plan permits public datasets only. This makes it suitable for published marketing content, but unpublished material and editorial access must be assessed carefully before recommending it for production.

## Loan calculator settings

The Studio contains one protected **Loan calculator** item near the top of the
navigation. Editors do not create separate calculator records. The singleton
uses six numbered tabs so related fields stay together:

1. Loan limits
2. Interest & fees
3. Repayment schedule
4. Early settlement
5. Customer wording
6. Approval & dates

The calculation formula, validation and currency formatting remain protected
in website code. Sanity supplies only the published settings and customer copy.
If the singleton is inactive, unavailable or not yet effective, the website
keeps using the reviewed local fallback.

Preview the initial record without changing Sanity:

```powershell
Push-Location .\cms\sanity\studio
npm.cmd run migrate:loan-calculator:dry-run
Pop-Location
```

After Credit/Compliance has reviewed the figures, create or replace the hosted
singleton and verify it:

```powershell
Push-Location .\cms\sanity\studio
npm.cmd run migrate:loan-calculator
npm.cmd run verify:loan-calculator
Pop-Location
```

The initial record remains labelled **Provisional** and explains that the
weekly schedule is awaiting operational/Flexibank verification. Do not change
the status to **Approved** without recording the approver and effective date.

## Footer and app-promotion settings

Open **Footer & app promotion** from the top level of the Studio. It is a
protected singleton, so editors update one clearly labelled record instead of
creating competing footer configurations. Three numbered tabs separate the
mobile app promotion, footer wording and footer menu links.

The website loads this record from Sanity and safely falls back to its existing
local copy if the CMS is unavailable. Store destinations and the main website
navigation remain protected in application code.

Preview, import and verify the current website content with:

```powershell
Push-Location .\cms\sanity\studio
npm.cmd run migrate:shared-settings:dry-run
npm.cmd run migrate:shared-settings
npm.cmd run verify:shared-settings
Pop-Location
```
