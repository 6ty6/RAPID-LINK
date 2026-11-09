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

`contracts.js` defines the presentation shapes, including reserved shapes for
later extraction of pages, branches, contacts, board members, digital channels
and documents. These are not new CMS schema or approved business records. No
placeholder getters publish missing content. Filtering remains in the existing
UI; filters are not yet arguments to these getters. Local getters are synchronous
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
No pre-renderer, webhook, deployment or hosting change is included in this stage.

## Verification

Run `npm.cmd test` for record parity, mutation isolation, local/remote selection,
empty/error responses, the configured Supabase read mapping, and existing page
behavior. Run `npm.cmd run build` for production bundling. Database security tests
are separate (`npm.cmd run test:db`) and are not part of this restructuring check.
