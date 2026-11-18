# RapidLink Website Project — Technical Debrief

**Status date:** 18 November 2026  
**Prepared for:** RapidLink project handover and technical review  
**Current working branch:** `cms-evaluation/sanity`  
**Production domain:** `https://rapidlinkgh.com`  
**GitHub repository:** `https://github.com/6ty6/RAPID-LINK`

## Executive summary

The RapidLink project is a responsive public financial-services website built
with React and Vite. It is deployed as a static site, but it can obtain approved
public content from external services. The frontend supplies the customer
experience; Supabase supplies the existing authentication, database, storage
and restricted news/career administration; and Sanity is being evaluated as a
broader content-management system.

The code deliberately separates website presentation from content storage.
Pages use one content repository interface, while adapters decide whether the
content comes from bundled local records, Supabase or Sanity. This makes it
possible to test a CMS without rewriting every page or immediately changing the
production system.

The current Sanity branch successfully builds and pre-renders 26 public routes.
On 18 November 2026, the production build passed. The full Vitest run reported
53 passing tests, but one compatibility test suite could not load because
`src/services/content/index.js` contains an incorrect relative import path. This
does not currently stop the production build because the application uses
`src/content/index.js`; it remains an immediate maintenance item.

---

## Table of contents

1. [Frontend](#1-frontend)
   1. [Purpose and responsibilities](#11-purpose-and-responsibilities)
   2. [Technology and configuration](#12-technology-and-configuration)
   3. [Pages and customer features](#13-pages-and-customer-features)
   4. [Rendering, routing and deployment output](#14-rendering-routing-and-deployment-output)
   5. [Content access and fallback behaviour](#15-content-access-and-fallback-behaviour)
   6. [Frontend security, accessibility and SEO](#16-frontend-security-accessibility-and-seo)
   7. [Current frontend limitations](#17-current-frontend-limitations)
   8. [How the frontend works with the backend and CMS](#18-how-the-frontend-works-with-the-backend-and-cms)
2. [Backend](#2-backend)
   1. [Purpose and architecture](#21-purpose-and-architecture)
   2. [Supabase database model](#22-supabase-database-model)
   3. [Authentication and administrator access](#23-authentication-and-administrator-access)
   4. [Row-level security and storage](#24-row-level-security-and-storage)
   5. [Backend API access](#25-backend-api-access)
   6. [Backend configuration](#26-backend-configuration)
   7. [Current backend limitations](#27-current-backend-limitations)
   8. [How the backend works with the frontend and CMS](#28-how-the-backend-works-with-the-frontend-and-cms)
3. [Content management system](#3-content-management-system)
   1. [Purpose and current evaluation status](#31-purpose-and-current-evaluation-status)
   2. [Sanity content types](#32-sanity-content-types)
   3. [Editor navigation and branding](#33-editor-navigation-and-branding)
   4. [Public queries and website adapter](#34-public-queries-and-website-adapter)
   5. [Migration and verification](#35-migration-and-verification)
   6. [Publishing workflow](#36-publishing-workflow)
   7. [CMS scope still outstanding](#37-cms-scope-still-outstanding)
   8. [How the CMS works with the frontend and backend](#38-how-the-cms-works-with-the-frontend-and-backend)
4. [Git, branches and worktrees](#4-git-branches-and-worktrees)
   1. [Repository model](#41-repository-model)
   2. [Current branches](#42-current-branches)
   3. [How the worktrees operate](#43-how-the-worktrees-operate)
   4. [How Git relates to Render and production](#44-how-git-relates-to-render-and-production)
   5. [Safe promotion process](#45-safe-promotion-process)
   6. [Useful Git commands](#46-useful-git-commands)
   7. [How Git supports all project sections](#47-how-git-supports-all-project-sections)
5. [End-to-end website operation](#5-end-to-end-website-operation)
6. [Configuration reference](#6-configuration-reference)
7. [Testing and verification status](#7-testing-and-verification-status)
8. [Risks, decisions and outstanding work](#8-risks-decisions-and-outstanding-work)
9. [Recommended next actions](#9-recommended-next-actions)
10. [Local development quick reference](#10-local-development-quick-reference)

---

# 1. Frontend

The frontend is the public-facing RapidLink website. It presents products,
company information, news, careers, digital channels and customer tools in a
responsive interface while keeping storage and authentication details outside
the page components.

## 1.1 Purpose and responsibilities

The frontend is responsible for:

- displaying RapidLink's public information consistently on desktop and mobile;
- providing accessible header, footer, dropdown and dialog interactions;
- presenting savings, investment and loan products;
- displaying published news, vacancies, FAQs, announcements and impact numbers;
- providing branch information, maps and official social links;
- pre-rendering public pages for search engines and fast first display;
- protecting staff-only and utility pages from search indexing;
- offering local content when a remote content source has not been configured;
- validating browser forms before any future backend connection.

It is not currently responsible for securely processing customer applications.
The account-opening form is a frontend prototype and explicitly states that its
information has not been sent.

## 1.2 Technology and configuration

The public application uses:

| Component | Current implementation | Purpose |
|---|---|---|
| UI framework | React 18.3 | Components and interactive state |
| Build tool | Vite 6 | Development server and production bundle |
| Routing | React Router | Public and restricted client routes |
| Styling | `src/styles.css` | Shared responsive RapidLink design system |
| PDF preview | PDF.js | Browser preview of the published rate guide |
| Unit/component tests | Vitest and Testing Library | Behaviour and regression checks |
| Browser tests | Playwright | End-to-end and pre-render verification |
| Hosting | Render static site | Serves the generated `dist/` directory |

The root package commands are defined in `package.json`:

```json
{
  "dev": "vite",
  "build": "node tools/build.mjs",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "test:prerender": "playwright test --config playwright.prerender.config.js"
}
```

Application-level configuration is centralised in `src/config.js`. Public URLs
come from environment variables where appropriate; verified external service
URLs are kept in one configuration object rather than repeated in components.

## 1.3 Pages and customer features

`src/App.jsx` defines the customer-facing and staff routes. The main features
currently include:

- homepage campaign slider, quick-access loan tools and connected news;
- savings, investment and loan product pages;
- institutional profile, mission, vision and impact counters;
- Board of Directors biographies;
- digital-channel information;
- current rates and a PDF loan-rate guide preview/download page;
- FAQs, news listing, individual news articles and careers;
- contact cards, two-branch map and separate directions;
- mobile and desktop header utilities;
- official social-media links in the footer;
- animated, non-clickable announcement banner;
- restricted content-management and invitation routes;
- custom animated 404 page.

The loan calculator remains a client-side estimate using the retained formula.
It must not be treated as approved pricing until Credit and Compliance provide
the required method, rates, charges and examples.

## 1.4 Rendering, routing and deployment output

The website uses a hybrid static approach:

1. Vite builds the browser application.
2. Vite builds a server-rendering entry file.
3. `tools/build.mjs` fetches the configured public content.
4. Approved public routes are rendered to static HTML.
5. A separate no-index SPA shell is created for staff and utility routes.
6. A real `404.html`, sitemap, robots file and pre-render manifest are produced.

The browser chooses between hydration and a fresh client render:

```jsx
if (root.dataset.prerendered && root.dataset.route === currentPath) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
```

Public pages therefore arrive with usable HTML. Routes such as
`/content-management`, `/accept-invite` and `/loan-calculator` receive the SPA
shell and are marked `noindex`.

The build verified on 18 November 2026 generated 26 public routes.

## 1.5 Content access and fallback behaviour

Page components do not need to know whether content is stored in Sanity,
Supabase or local files. `src/content/index.js` selects one adapter:

```js
const content = createContentRepository({
  local: localContent,
  publicSource: requestedSource === 'sanity' ? sanitySource
    : requestedSource === 'supabase' ? supabaseSource
      : null,
})
```

The repository supplies immediate bundled records and asynchronous published
records. For example, the announcement banner displays a local snapshot first,
then replaces it with published CMS records when Sanity is configured.

Contact and social settings use a shared browser request cache. This prevents
the header, footer, contact page and loan-assistance page from separately
requesting the same settings:

```js
if (!pendingRequest) {
  pendingRequest = getPublishedSiteInformation()
    .then(settings => {
      cachedSettings = settings
      return settings
    })
}
```

This fallback model keeps the website usable during evaluation, but duplicated
local and remote copies must eventually be governed carefully so staff know
which record is authoritative.

## 1.6 Frontend security, accessibility and SEO

Implemented measures include:

- semantic headings, labelled navigation and accessible buttons;
- keyboard-accessible dropdowns, dialogs and flip-card controls;
- focus handling and Escape-key behaviour for modal interactions;
- external links opened with `noopener noreferrer`;
- public snapshot validation before CMS data is serialized into HTML;
- escaping of `<`, `>`, `&` and special line separators in JSON snapshots;
- canonical URLs, descriptions and Open Graph/Twitter preview metadata;
- sitemap and robots generation;
- genuine 404 responses rather than a catch-all successful response;
- Render security headers including CSP, frame denial, MIME sniffing protection,
  referrer policy and permissions policy.

The evaluation branch CSP currently permits the exact Sanity CDN endpoint,
Supabase endpoints, Google Maps, HTTPS images and local PDF workers.

## 1.7 Current frontend limitations

1. The account-opening form is not connected to an approved backend.
2. The general loan application connection remains pending.
3. The calculator formula is not yet approved by Credit and Compliance.
4. Many product, institutional, board, navigation and digital-channel records
   are still bundled in source files rather than fully CMS-managed.
5. The production build reports large PDF.js chunks; lazy loading already limits
   initial impact, but further bundle analysis may be useful.
6. The complete test run currently has one suite-load error caused by the wrong
   relative import in `src/services/content/index.js`.

## 1.8 How the frontend works with the backend and CMS

The frontend communicates with external services only through adapters:

```text
React page/component
        |
        v
Content repository contract
        |
        +--> local bundled content (safe initial fallback)
        +--> Supabase adapter (production/main news and careers)
        +--> Sanity adapter (CMS evaluation content)
```

Supabase authentication and staff writes are kept in `src/services/careers.js`.
Public Sanity reads are kept in
`src/services/content/sanityContentRepository.js`. This separation prevents
presentation components from containing database queries or access tokens.

---

# 2. Backend

The backend supplies durable data, authentication, authorisation and media
storage. There is currently no custom Express or Node server in production; the
static React site calls hosted Supabase and Sanity HTTP APIs.

## 2.1 Purpose and architecture

Supabase currently provides:

- PostgreSQL data storage for news and vacancies;
- invitation/password authentication for authorised staff;
- the single content-administrator role;
- row-level security for public and staff operations;
- a public storage bucket for approved news images;
- REST and authentication endpoints used by the restricted content portal.

The public website can use Supabase or Sanity based on `VITE_CONTENT_SOURCE`.
The existing restricted `/content-management` interface remains connected to
Supabase even on the Sanity evaluation branch. Therefore, public CMS evaluation
and the legacy staff portal currently coexist.

## 2.2 Supabase database model

The principal tables are:

| Table | Purpose |
|---|---|
| `career_vacancies` | Vacancy details, responsibilities, status and publication state |
| `news_articles` | News metadata, content sections, images and publication state |
| `content_admins` | Approved Supabase user IDs allowed to manage content |
| `auth.users` | Supabase-managed user identities |
| `storage.objects` | Uploaded news-image records in the `news-images` bucket |

The former `career_admins` table and `is_career_admin()` function were removed
by the role-consolidation migration. Both careers and news now use one
administrator model.

Eight ordered SQL migrations currently exist under `supabase/migrations/`, from
the initial content model through read-policy hardening and administrator-role
consolidation.

## 2.3 Authentication and administrator access

The content portal sends an email/password sign-in request to Supabase Auth and
then calls `is_content_admin()`:

```js
const session = await request('/auth/v1/token?grant_type=password', {
  method: 'POST',
  body: { email, password },
})
const allowed = await request('/rest/v1/rpc/is_content_admin', {
  method: 'POST',
  token: session.access_token,
})
```

The database function is `SECURITY DEFINER` and fixes its search path:

```sql
create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.content_admins where user_id = auth.uid()
  );
$$;
```

Invited Supabase users are automatically placed in `content_admins` by a
database trigger. The invitation-acceptance page lets invited users establish a
password before entering the portal.

## 2.4 Row-level security and storage

RLS is enabled so that:

- anonymous visitors can read only published news and vacancies;
- authenticated non-admin users cannot manage content;
- authorised content administrators can read drafts and insert, update or
  delete managed records;
- the `news-images` storage bucket permits uploads, changes and deletions only
  for content administrators;
- uploaded files are limited to approved raster formats and 5 MB by the
  migration and frontend validation.

These rules are important because the Supabase publishable/anonymous key is
intentionally visible in the browser. The key identifies the project; RLS is
what protects restricted data and write operations.

## 2.5 Backend API access

`src/services/careers.js` provides the Supabase API client used by the existing
staff portal. It attaches the public key and either the public key or the staff
access token:

```js
headers: {
  apikey: anonKey,
  Authorization: `Bearer ${token || anonKey}`,
  'Content-Type': 'application/json',
}
```

Its responsibilities include:

- public news and vacancy reads;
- staff sign-in and sign-out;
- invitation verification and password creation;
- draft and published record retrieval;
- create/update/delete operations;
- image upload to Supabase Storage.

No Supabase service-role key is included in the frontend.

## 2.6 Backend configuration

The browser requires only public Supabase configuration:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Dedicated test-user credentials are local test inputs and must never be
committed:

```dotenv
HOSTED_TEST_ADMIN_EMAIL=
HOSTED_TEST_ADMIN_PASSWORD=
HOSTED_TEST_NON_ADMIN_EMAIL=
HOSTED_TEST_NON_ADMIN_PASSWORD=
```

`supabase/config.toml` defines local development ports, redirect URLs and Auth
behaviour. Hosted dashboard settings must still be checked independently; a
local configuration file does not prove the state of the hosted project.

## 2.7 Current backend limitations

1. The Supabase project is on a free plan under a non-organisational project;
   ownership must move to RapidLink or an approved alternative before launch.
2. Supabase currently manages only news, vacancies and related images—not the
   entire website.
3. The account-opening form has no approved submission API.
4. The general loan application service is not connected.
5. Hosted Auth settings, migrations, backups and RLS evidence must be rechecked
   before production promotion, even where previous evidence exists.
6. The Sanity branch creates a transitional split: some public content comes
   from Sanity while the existing staff portal still writes to Supabase.

## 2.8 How the backend works with the frontend and CMS

On `main`, public news and careers use the Supabase adapter. On the Sanity
evaluation branch, the public site uses Sanity for supported types, while the
legacy restricted portal continues to use Supabase. The content repository
keeps this difference away from most page components.

This transitional model is suitable for evaluation, but a production CMS
decision must define one authoritative editing workflow for every migrated
content type. Editors should not have to decide whether to change the same
content in Supabase, Sanity or source code.

---

# 3. Content management system

The CMS section evaluates whether authorised staff can update structured public
content without changing React source code. Sanity is integrated on the current
branch as an evaluation, not yet as an approved replacement for production.

## 3.1 Purpose and current evaluation status

Sanity consists of two related parts:

1. **Content Lake:** the hosted dataset that stores structured documents and
   images.
2. **Sanity Studio:** the staff editing interface under
   `cms/sanity/studio/`.

The current project ID is `04unhu7g`, and the configured dataset is
`production`. Public reads use the Sanity API CDN and do not place an editor
token in the website.

The Studio has its own `package.json`, React version and dependencies. It should
be installed and operated from `cms/sanity/studio`; its packages should not be
merged into the root website package unnecessarily.

## 3.2 Sanity content types

| Content type | What editors control | Website use | Status |
|---|---|---|---|
| News article | Title, slug, category, date, summary, image, sections and links | Homepage/news pages | Integrated |
| Career vacancy | Role, department, location, type, responsibilities and status | Careers page | Integrated |
| FAQ | Question, answer, category, order and visibility | FAQ page | Integrated |
| Impact counter | Number, label, prefix/suffix, icon, order and verification date | Institutional profile | Integrated |
| Announcement | Message, priority, order, start/expiry date and visibility | Site-wide banner | Integrated |
| Site settings | Email, support lines, branches and social profiles | Header, footer, contact and loan assistance | Integrated |

The next practical low-risk type is Digital Channels. Board members, homepage
slides, products, institutional copy, navigation, metadata and documents remain
future migrations.

## 3.3 Editor navigation and branding

The Studio is branded with the RapidLink name, logo and colour theme. Its
custom structure provides predictable navigation:

```js
.items([
  S.listItem()
    .title('Contact & social settings')
    .child(S.document()
      .schemaType('siteSettings')
      .documentId('rapidlink-site-settings')),
  S.divider(),
  contentSection(S, 'News', 'newsArticle', 'articles'),
  contentSection(S, 'Careers', 'careerVacancy', 'vacancies'),
  contentSection(S, 'FAQs', 'faq', 'questions'),
  contentSection(S, 'Impact numbers', 'impactCounter', 'counters'),
  contentSection(S, 'Announcements', 'announcement', 'announcements'),
])
```

Each repeating content section provides **All**, **Visible on website**, and
**Hidden or draft** lists. Contact and social information is a singleton with
three tabs: contact numbers, branches and social media. Duplicate and delete
actions are removed for that singleton to reduce editor mistakes.

## 3.4 Public queries and website adapter

The website sends read-only GROQ queries to the published perspective. Drafts
and unrelated fields are not requested. The announcement query illustrates the
pattern:

```js
*[
  _type == "announcement" &&
  isPublished == true &&
  (!defined(startDate) || dateTime(startDate) <= dateTime(now())) &&
  (!defined(expiryDate) || dateTime(expiryDate) > dateTime(now()))
] | order(displayOrder asc, _createdAt asc)
```

The adapter maps CMS field names into the stable website contract. This is why
the public pages do not need separate Sanity-specific versions.

Public configuration is:

```dotenv
VITE_CONTENT_SOURCE=sanity
VITE_SANITY_PROJECT_ID=04unhu7g
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2026-11-14
```

## 3.5 Migration and verification

Migration scripts are stored in `cms/sanity/studio/scripts/`. They use stable
document IDs and `createOrReplace`, so controlled reruns update the intended
records rather than creating repeated copies.

Examples:

```powershell
npm.cmd --prefix cms/sanity/studio run migrate:announcements:dry-run
npm.cmd --prefix cms/sanity/studio run migrate:announcements
npm.cmd --prefix cms/sanity/studio run verify:announcements

npm.cmd --prefix cms/sanity/studio run migrate:site-settings:dry-run
npm.cmd --prefix cms/sanity/studio run migrate:site-settings
npm.cmd --prefix cms/sanity/studio run verify:site-settings
```

The seven original announcements were migrated and verified. Contact settings,
two branches and five social profiles were also migrated and verified against
the bundled website source.

## 3.6 Publishing workflow

For a normal managed record:

1. An authorised editor opens Sanity Studio.
2. The editor creates or changes a document.
3. `Visible on website` is enabled where applicable.
4. The editor presses **Publish**.
5. The public adapter requests only published records.
6. A browser refresh retrieves live client-managed content.
7. A Render rebuild also embeds supported published content in static HTML.

Site settings do not use a separate visibility switch because they are one
controlled singleton. The website initially displays approved bundled values
and replaces them with the published Sanity settings after retrieval.

## 3.7 CMS scope still outstanding

- Digital channels and their images;
- Board of Directors;
- homepage slides and featured sections;
- product/service pages;
- institutional profile copy;
- header and footer navigation;
- SEO and social-preview metadata;
- downloadable documents;
- complaints, fees, security and licensing content after business approval;
- formal roles, approval workflow, audit expectations, backup/restore and
  organisation ownership;
- final management decision on Sanity versus another CMS.

## 3.8 How the CMS works with the frontend and backend

Sanity supplies public content through GROQ; React displays it through the
content repository. Supabase remains responsible for the older restricted
content portal and its authentication. Sanity Studio uses Sanity's own identity
and editing model.

```text
Sanity Studio editor --> Sanity Content Lake --> public GROQ adapter --+
                                                                    |
Supabase staff portal --> Supabase database/API --------------------+--> content repository --> React pages
                                                                    |
Bundled approved content -------------------------------------------+
```

Before production, RapidLink must decide whether Supabase remains a separate
operational backend while Sanity becomes the public CMS, or whether content
administration should be consolidated differently.

---

# 4. Git, branches and worktrees

Git protects the stable site while experiments and redesigns are developed.
The project uses one GitHub repository with several branches and local
worktrees. These are not separate repositories.

## 4.1 Repository model

The single remote is:

```text
origin  https://github.com/6ty6/RAPID-LINK.git
```

All branches share the same history and object database. A branch is an
independent line of changes. A worktree is another checked-out folder attached
to that same repository, allowing multiple branches to be opened or run at the
same time.

Sanity Content Lake, Supabase and Render are external services; they are not
additional Git repositories. Their configuration and migration code is stored
in this repository, while their live data remains in the relevant hosted
service.

## 4.2 Current branches

| Branch | Purpose | Production effect |
|---|---|---|
| `main` | Stable production line; Render production should track this branch | Deploys only when production service is configured to deploy `main` |
| `cms-evaluation/sanity` | Sanity schemas, Studio, migrations and public adapter evaluation | No effect on `main` until reviewed and merged |
| `cms-evaluation/directus` | Earlier Directus evaluation work | Isolated from `main` |
| `cms-restructure` | Content modelling and adapter restructuring | Isolated until merged |
| `design/corporate-trust` | Corporate/trust-oriented design option | Separate worktree/branch |
| `design/digital-first` | Digital-first design option | Separate worktree/branch |
| `design/human-centred` | Human-centred design option | Separate worktree/branch |

As recorded on 18 November 2026, `main` and `cms-evaluation/sanity` point to
different commits. Therefore, a commit to the Sanity branch does not change the
`main` branch or a Render service that deploys only `main`.

## 4.3 How the worktrees operate

The main workspace currently checks out `cms-evaluation/sanity`. Three design
worktrees exist below `.worktrees/`:

```text
.worktrees/corporate-trust  -> design/corporate-trust
.worktrees/digital-first    -> design/digital-first
.worktrees/human-centred    -> design/human-centred
```

Each folder has its own working files and branch pointer, but all use the same
Git repository. This allows the design previews to run together without
repeatedly switching the main workspace branch.

Changes made in one worktree are not automatically copied into another branch.
They must be committed and then deliberately merged or cherry-picked.

## 4.4 How Git relates to Render and production

Render deploys the branch selected in the Render service settings. Git itself
does not decide which branch is production.

- If production tracks `main`, commits pushed only to
  `cms-evaluation/sanity` do not change production.
- A separate Render preview service may track an evaluation or design branch.
- Render Blueprint settings are read from the selected branch's `render.yaml`.
- The current Sanity branch's `render.yaml` selects Sanity as its public content
  source and permits the Sanity CDN in CSP.
- The `main` service configuration must be checked before merging because its
  production content source may intentionally remain Supabase.

## 4.5 Safe promotion process

Recommended workflow:

1. Make and test changes on the appropriate feature/evaluation branch.
2. Commit with a clear message and push that branch.
3. Deploy or inspect a branch preview.
4. Run unit tests, build, browser checks and applicable backend/CMS tests.
5. Obtain design, content, security and management approval.
6. Open a pull request into `main`.
7. Review the complete diff, environment changes and migration requirements.
8. Merge only the approved work.
9. Verify the Render production deployment and live domain.
10. Retain rollback information for the previous successful deployment.

Database or CMS migrations are separate from a Git merge. Merging a SQL or
migration script does not automatically prove it has been applied to a hosted
database unless the deployment process explicitly runs it.

## 4.6 Useful Git commands

```powershell
# Show the current branch and pending work
git branch --show-current
git status

# Show local and remote branches
git branch -a

# Show every attached worktree
git worktree list

# Push the current feature branch without changing main
git push -u origin cms-evaluation/sanity

# Compare the current branch with production
git diff main...cms-evaluation/sanity

# Update local knowledge of remote branches
git fetch origin
```

Do not merge or push directly to `main` until the branch has been reviewed and
approved.

## 4.7 How Git supports all project sections

- Frontend code and styles are versioned and reviewable.
- Supabase SQL migrations and verification scripts are versioned, even though
  hosted database state is external.
- Sanity schemas, Studio navigation and migration scripts are versioned, while
  Sanity documents remain in Content Lake.
- Render configuration is versioned, while environment values and deployments
  remain in Render.
- Branches allow CMS and design work to progress without changing production.

---

# 5. End-to-end website operation

The following sequence explains how the complete system works:

1. A developer or Render runs `npm run build`.
2. Vite builds browser and server-rendering bundles.
3. The content adapter reads `VITE_CONTENT_SOURCE`.
4. Public news, vacancies, counters, FAQs and announcements are retrieved from
   the selected source where supported.
5. The snapshot validator rejects malformed or private records.
6. Approved routes are rendered into static HTML with SEO metadata.
7. Render publishes `dist/` and attaches security headers.
8. A customer requests `rapidlinkgh.com`.
9. The browser receives pre-rendered HTML and then React hydrates it.
10. Live client-managed settings, such as contact information, may refresh from
    Sanity while bundled values remain the safe initial display.
11. A staff member uses either Sanity Studio or the legacy Supabase content
    portal, depending on the content type and evaluation decision.
12. RLS and CMS publication state determine what is publicly visible.

---

# 6. Configuration reference

| Variable | Used by | Purpose | Secret? |
|---|---|---|---|
| `VITE_SITE_URL` | Frontend/build | Canonical production origin | No |
| `VITE_INDEXABLE` | Frontend/build | Enables production indexing | No |
| `VITE_CONTENT_SOURCE` | Content adapter | Selects `local`, `supabase` or `sanity` | No |
| `VITE_SUPABASE_URL` | Supabase adapter | Hosted Supabase API URL | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase adapter | Public browser key protected by RLS | Public, but controlled |
| `VITE_SANITY_PROJECT_ID` | Sanity adapter | Content Lake project | No |
| `VITE_SANITY_DATASET` | Sanity adapter | Dataset name | No |
| `VITE_SANITY_API_VERSION` | Sanity adapter | Stable query API date | No |
| `VITE_GENERAL_LOAN_PORTAL_URL` | Frontend | Future verified loan portal | No |
| `VITE_ACCOUNT_API_BASE_URL` | Frontend | Reserved account API location | No; currently unused |
| `HOSTED_TEST_ADMIN_EMAIL` | Hosted tests | Dedicated admin test account | Yes |
| `HOSTED_TEST_ADMIN_PASSWORD` | Hosted tests | Admin test password | Yes |
| `HOSTED_TEST_NON_ADMIN_EMAIL` | Hosted tests | Dedicated non-admin test account | Yes |
| `HOSTED_TEST_NON_ADMIN_PASSWORD` | Hosted tests | Non-admin test password | Yes |

Secrets belong in local ignored environment files or hosted environment
settings. They must not be committed to Git, printed in reports or placed in
browser-delivered code.

---

# 7. Testing and verification status

## 7.1 Current checks run on 18 November 2026

| Check | Result | Meaning |
|---|---|---|
| Production website build | Passed | Browser bundle, SSR bundle and static generation completed |
| Public route generation | 26 routes | Public pages pre-rendered with configured content |
| Full Vitest suite | 53 tests passed; 1 suite failed to load | Application behaviour passes, but compatibility import defect remains |
| Build bundle warning | Present | PDF.js-related assets exceed the default 500 kB warning threshold |

The failing suite points to this incorrect import in
`src/services/content/index.js`:

```js
// Current path is wrong from src/services/content/index.js
from '../services/content/sanityContentRepository.js'
```

The intended sibling module is under `src/services/content/`, so the path should
be corrected and the full suite rerun. This was not silently corrected during
the documentation-only review.

## 7.2 Previously retained backend and CMS evidence

Project evidence records report:

- 36/36 local Supabase pgTAP RLS checks passed;
- 22/22 hosted public-API role/write-protection checks passed;
- the consolidated content-role verification passed;
- SecurityHeaders.com previously returned an A+ result after Render headers
  were configured;
- the Sanity Studio production build passed;
- seven original announcements were migrated and verified;
- contact settings, two branches and five social profiles were migrated and
  verified.

These results should be rerun after relevant permission, migration, hosting or
content-model changes. Historical evidence is not a permanent guarantee.

---

# 8. Risks, decisions and outstanding work

## 8.1 Immediate technical items

1. Correct the compatibility import path and restore a fully green test suite.
2. Review the PDF.js bundle and confirm whether browser preview remains a
   requirement or direct PDF linking is sufficient.
3. Confirm all Render services deploy the intended branches.
4. Verify the hosted Auth sign-up setting and redirect allow-list before launch.
5. Confirm the production CSP after the final content source is selected.

## 8.2 Business and compliance blockers

1. Obtain the calculator method, approved rates, fees, APR wording and example
   schedules directly from Credit and Compliance.
2. Do not connect the account or general loan forms until an approved secure
   submission process, privacy notice, retention policy and responsible team
   exist.
3. Obtain approved complaints, fee-schedule, security-centre and licensing
   content.
4. Confirm ownership and approval responsibility for every content type.

## 8.3 Platform decisions

1. Decide whether Sanity is approved or remains an evaluation.
2. Decide whether Supabase remains the operational backend alongside a CMS.
3. Move hosted projects into RapidLink-owned organisations before production.
4. Document backup, restore, monitoring, incident response and exit procedures.
5. Treat AWS as an option requiring a separate approved architecture—not an
   automatic next step.

---

# 9. Recommended next actions

## Immediate

1. Fix the compatibility import and rerun all tests.
2. Commit and push this debrief on `cms-evaluation/sanity`.
3. Capture a current branch preview and confirm header, footer, contact, news,
   careers, FAQs, counters and announcements use the expected source.
4. Verify Render environment variables without exposing their values.

## Next CMS increment

1. Add Digital Channels as a Sanity type.
2. Support image upload, order and visibility.
3. Migrate the five current channels with stable IDs.
4. Connect the page through the repository and retain local fallback.
5. Build, test and verify published/hidden behaviour.

## Later

1. Migrate Board members and homepage slides.
2. Migrate product and institutional content after ownership review.
3. Migrate documents and metadata.
4. Move navigation last because an incorrect menu can affect every page.
5. Remove duplicated local fallback records only after the chosen CMS and
   governance process are formally approved and verified.

---

# 10. Local development quick reference

## Public website

```powershell
npm.cmd install
npm.cmd run dev
```

## Production build

```powershell
npm.cmd run build
```

## Tests

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run test:prerender
```

## Sanity Studio

```powershell
npm.cmd --prefix cms/sanity/studio install
npm.cmd --prefix cms/sanity/studio run dev
```

## Sanity schema/build validation

```powershell
npm.cmd --prefix cms/sanity/studio run build
```

## Important operating rule

Always confirm the current Git branch before changing code or deploying:

```powershell
git branch --show-current
git status
```

The production website, hosted databases and CMS datasets are separate external
states. A successful local build or Git commit does not by itself prove that a
hosted migration, environment setting or deployment has been applied.
