# First content-access layer

This stage implements the read boundary requested in the handoff. It selects no
final CMS, adds no database models or admin features, and changes no calculator
parameters. Existing public text, links, ordering, images and pricing statements
are preserved for comparison; preservation does not mean departmental approval.
The controlling instructions used here are those recorded in section 4 of
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

`local.js` adapts `src/content.js`. The latter remains the existing data source
and supports the unchanged staff prototype. `repository.js` accepts a local
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

Migrated consumers: announcement bar, FAQ page, header/footer grouped navigation,
homepage product cards, product pages, news hook and public careers list. Other
page copy and entity records remain in their existing components for incremental
extraction. The admin and invitation routes retain their existing service calls.

## Next stages and pre-rendering plan

After review, extract homepage sections, institutional copy, board records,
digital channels, branches, contacts and document metadata one group at a time.
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
