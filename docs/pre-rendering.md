# Public-page pre-rendering

`npm.cmd run build` now builds the browser assets, creates a temporary server
bundle under ignored `.prerender/`, retrieves public news/vacancy records and
renders allow-listed routes into `dist/<route>/index.html`. The root also gets
its own HTML. No running Node server or new production dependency is required
to serve the result; build dependencies must be installed as before.

The current configured-content build generated 26 public routes. The route
count changes with published articles. Products and article slugs are validated
before use as output paths. Staff routes, invitation setup, the legacy staff
alias and the calculator are excluded and use `dist/spa.html` instead. The
calculator formula, parameters and UI remain unchanged and unapproved.

## Effect on visitors and editors

Visitors receive complete page content and route-specific, absolute metadata
before JavaScript loads. React then hydrates that same content so navigation,
menus, the homepage slider, public form steps and document dialogs keep working.
The app still cannot submit account-opening data. The small mobile-slider
initialization change lets the server render without a browser; mobile behavior
is applied immediately after hydration. Impact figures appear in initial HTML
and keep their existing browser animation behavior.

The public records used for generation are embedded as escaped JSON so the first
browser render matches the HTML. Only whitelisted presentation fields are
included; complete API rows, staff attribution and sessions are not serialized.
Client news/careers refreshes still run after hydration. A fresh publication,
unpublication or article edit requires a successful rebuild/deployment to update
the static HTML, sitemap and link previews. Static copies do not disappear just
because a database record was unpublished. Trigger a rebuild when publishing or
withdrawing content; automated publish webhooks remain a later CMS decision.

## Content source and failure behavior

The default build uses the existing content-access layer and configured public
Supabase reads. With no Supabase configuration, it uses bundled content. Partial
configuration, API failures, timeouts, duplicate/unsafe article slugs, draft
records or invalid required data fail the build instead of silently publishing
bundled replacements. Empty published results are valid and stay empty.

For an explicitly offline, test-data build only, PowerShell can select bundled
records without changing stored credentials:

```powershell
$env:PRERENDER_SOURCE = 'bundled'
try { npm.cmd run build } finally { Remove-Item Env:PRERENDER_SOURCE }
```

Do not use that override as a workaround for failed production content reads.
`npm.cmd run build:client` builds browser assets alone for diagnostics; it does
not produce a deployable pre-rendered site or its required SPA shell.

## Search and hosting

`VITE_INDEXABLE` defaults to false. Preview HTML and its client metadata use
`noindex, nofollow`; generated robots.txt disallows crawling. Only after the
domain and production release are approved should `VITE_INDEXABLE=true` be
configured and the site rebuilt. Generated sitemap.xml lists the public
canonical URLs, including current article routes, without duplicating `/home`
for `/`. Staff and calculator paths remain excluded.

The local Render blueprint and generated Netlify `_redirects` now reserve
`/spa.html` for exact staff/invitation/calculator paths. Other missing URLs use
404 handling rather than a catch-all 200 rewrite. The Vite preview middleware
mirrors file-first routing and serves the generated error document with status
404. Existing deployments must have their
actual fallback configuration verified when this change is deployed; editing
the blueprint does not update live dashboard settings automatically.

The subsequent 404 implementation generates `dist/404.html` and verifies real
404 responses locally. See `docs/http-404.md` for exact routing and remaining
deployed-host verification; live CDN status/body behavior is not yet verified.
This work performs no live deployment, production-domain change or CMS webhook
configuration, and it does not prove hosted RLS enforcement.

## Validation

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:prerender
```

The last command requires locally installed Chrome. It starts a local Vite
preview and checks desktop/mobile output without JavaScript, metadata, excluded
staff output, hydration, slider controls, institutional flip cards, account-form
steps and document dialogs. API responses in the browser test are isolated from
live content changes. `dist/prerender-manifest.json` records the generated routes.

Implementation references: [Vite SSR](https://vite.dev/guide/ssr.html),
[React renderToString and hydration](https://react.dev/reference/react-dom/server/renderToString),
and [Render file precedence and rewrites](https://render.com/docs/redirects-rewrites).
