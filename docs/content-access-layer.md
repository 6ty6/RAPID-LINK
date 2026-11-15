# First content-access layer

This stage implements the read boundary requested in the handoff. It selects no
final CMS, adds no database models or admin features, and changes no calculator
parameters. Existing public text, links, ordering, images and pricing statements
are preserved for comparison; preservation does not mean departmental approval.
The controlling instructions used here are those recorded in section 3 of
`CODEX_HANDOFF.md`; the original review Word file was unavailable on this computer.

## Public interface

Public components import explicitly from `src/content/index.js`. The explicit
path avoids ambiguity with the legacy `src/content.js` data file.

| Function | Result | Source in this stage |
|---|---|---|
| `getSharedContent()` | Mobile-app promotion and footer copy | `src/content/shared.js` |
| `getPage(slug)` | Existing page hero/metadata record or `undefined` | `src/content/pages.js` |
| `getDocuments({ category, pageSlug, productSlug })` | Published document records with a nonempty file path | `src/content/documents.js` |
| `getDocumentBySlug(slug)` | Public document or `undefined` | Same visibility rule as `getDocuments()` |
| `getAnnouncements()` | Array of `{ id, message }` | Bundled content |
| `getFaqs()` | Array of `{ id, question, answer }` | Bundled content |
| `getNavigation()` | Groups with `{ label, href, items: [{ label, href }] }` | Bundled content |
| `getProducts()` | Array of existing product records, each with `slug` | Bundled content |
| `getBoard()` | Board hero, members and presentation labels | `src/content/board.js` |
| `getHomepageContent()` | Homepage metadata, slider and section records | `src/content/home.js` |
| `getInstitutionalProfile()` | Hero, paragraphs, purpose and impact records | `src/content/institutionalProfile.js` |
| `getSiteInformation()` | Contacts, branches, social profiles and digital channels | `src/content/site.js` |
| `getProductBySlug(slug)` | Product or `undefined` | Bundled content |
| `getNews()` | Promise of existing public news records | Configured public adapter or bundled content |
| `getNewsBySlug(slug)` | Promise of article or `undefined` | Same source as `getNews()` |
| `getVacancies()` | Promise of existing public vacancy records | Configured public adapter or bundled content |
| `getNewsSnapshot()` / `getVacanciesSnapshot()` | `{ records, loading }` | Initial bundled records and whether a remote refresh is required |

`contracts.js` defines the page/document presentation shapes and reserved
standalone shapes for branches, contacts, board members and digital channels.
These are not new CMS schema or approved business records. No placeholder
getters publish missing content. News/vacancy/FAQ filtering remains in the UI;
document filters are supported as shown above. Local getters are synchronous
because this stage uses bundled data; news and vacancies always return promises.
Returned records are copies, so consumers cannot mutate the underlying source.
Announcement and FAQ IDs are migration identifiers based on existing order;
replace them with persisted IDs when these records move to an approved CMS.

## Adapter and behavior

`local.js` adapts the bundled-data getters in
`src/services/content/localContentRepository.js`, which read `src/content.js`
and the extracted homepage, board, institutional and site records. The legacy
data file also supports the unchanged staff prototype. `repository.js` accepts a local
adapter and an optional public remote adapter. `index.js` selects the existing
Supabase public-read functions when both current public environment values are
present. Credentials, authentication and staff writes stay outside this API.

The existing Supabase service still performs published-only reads and maps news
date/image/external-link fields. The interface preserves the established news
camel-case fields and vacancy snake-case fields to avoid changing consumers.
Database RLS remains the authority for access control; these unit tests do not
prove its enforcement.

The initial loading snapshot preserves current page behavior: local records are
shown initially, then successful remote results replace them. An empty result
stays empty. A remote error propagates to the UI, which retains its existing
error/fallback behavior. This stage does not silently repopulate successful
remote results with static articles or vacancies. Existing fallback behavior
must be reviewed before removing duplicate data after the CMS decision.

## Page and document metadata (9 November 2026)

`pages.js` now holds the existing FAQ, newsroom, careers, contact, rates,
rate-guide, digital-channels, account-opening, loan-guidance and public error
page metadata. PageHero still supplies the same SEO metadata automatically.
Explicit PageMeta records retain their existing image defaults and wording.
The calculator, protected staff routes, product descriptions, pricing tables,
application form schema and submission behavior are unchanged.

`documents.js` holds the existing Controller guide's title, description, PDF
path, preview path and product/page relations. Its existing public visibility
is preserved, but approval verification remains pending. Its 2025 display title
is not treated as a verified version or effective date; those fields remain
null. The PDF and preview bytes are unchanged.

To add a document later:

1. Add a record in `src/content/documents.js` with a unique slug, title,
   description, category and related page/product slugs. Start with
   `publicationStatus: 'draft'`, `approvalStatus: 'pending-verification'`,
   `file: null`, `version: null` and `effectiveDate: null` until supplied.
2. Obtain the actual file, its version/effective date and departmental approval.
   Keep unapproved files out of `public/`. This is public website content;
   neither the static registry nor `public/` is a private document store.
3. Add the approved file under `public/downloads/`, set its public path and
   approved metadata, then change approval/publication status after review.
   Do not invent approval dates or create empty placeholder files.
4. Use `getDocuments({ pageSlug })` or `getDocumentBySlug(slug)` in the intended
   page. Adding a relation does not create a new route or document listing by
   itself. New layouts remain a separate reviewed change.
5. Run tests and the build before publishing. Lists and direct lookups exclude
   drafts, archived records and records with no file path. Removing the existing
   guide from public content also removes its product link and preview/download
   controls; the guide route uses the existing not-found page.

This is a source-controlled addition path, not an admin uploader or chosen CMS.
Future CMS editing must implement the approved workflow. Static filtering is
not a replacement for backend access controls. A client-side not-found page
is now backed by the generated error document and local HTTP 404 handling
described in `docs/http-404.md`; deployed-host verification remains required.

## Shared content (9 November 2026)

The mobile-app promotion and remaining footer copy now come from
`src/content/shared.js` through `getSharedContent()`. This includes the existing
app heading, description, image/alt text and button labels; footer description,
section headings, menu descriptions, secondary links, company name and existing
privacy placeholder. The same app record is used on the homepage and digital
channels page. Store destinations remain in `src/config.js`, separate from
editable copy. CSS classes, menu behavior, new-tab protections and dynamic
copyright year are unchanged. The placeholder remains pending legal approval.
This extraction does not verify new app capabilities or enable any transactions.

Migrated consumers include the announcement bar, FAQs, header/footer, homepage,
product pages, news hook, careers, board, institutional profile, contact page,
digital channels and loan-support guidance. The admin and invitation routes
retain their existing service calls. Calculator logic and parameters are unchanged.

## Reconciliation on 9 November 2026

Local commit `2d98329` and remote commits `53c324d`/`64e4331` independently added
content interfaces. Their merge retains the remote structured data and page
extractions alongside local record contracts, defensive copies, parity tests
and remote-result/error tests. Public components use `src/content/index.js`.
The earlier `src/services/content/index.js` path remains a compatibility facade
that delegates to that same repository while preserving its tuple and keyed-map
return shapes. It no longer selects or fetches content independently. A backup
branch preserves the complete pre-merge local commit.

## Next stages and pre-rendering plan

The remote branch already extracted homepage sections, institutional copy,
board records, digital channels, branches and contacts. After review, continue
with remaining common page and document metadata one group at a time.
Add the corresponding getters only with real source records and parity checks.
Keep unconfirmed rates, legal wording and governance approvals pending.

Once the CMS decision is approved, use the same public read contracts in a
build-time content loader. It should await news/vacancy reads, validate the public
records and fail the build on unavailable or invalid managed content rather
than publishing stale fallback data. Feed that snapshot into route pre-rendering
and the initial client state, with page-specific absolute metadata. An approved
publish webhook can then trigger a preview/build. Real HTTP 404 behavior must
also be configured for the selected host; client rendering alone is insufficient.
The subsequent local pre-renderer is now implemented; see
`docs/pre-rendering.md` for the actual build and hydration behavior. It consumes
these same public read contracts and fails on content retrieval errors. No
webhook, live deployment or infrastructure change has been performed. The
subsequent local HTTP 404 implementation is documented in `docs/http-404.md`;
verify the actual host's error response before production.

## Verification

Run `npm.cmd test` for record parity, mutation isolation, local/remote selection,
empty/error responses, the configured Supabase read mapping, and existing page
behavior. Run `npm.cmd run build` for production bundling. Database security tests
are separate (`npm.cmd run test:db`) and are not part of this restructuring check.
