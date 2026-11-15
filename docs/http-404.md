# Real HTTP 404 responses

The build now emits `dist/404.html` using the existing “We couldn’t find that
page” content, header/footer and Return home link. It is usable without
JavaScript, marked noindex and has no canonical link or public-content snapshot.
The document is an error body; the server must send status 404 for a missing URL.
Requesting the actual `/404.html` file directly can legitimately return 200.

## Routing

Generated public routes and existing assets are served normally. Only these
exact client-only routes (also with one trailing slash) receive `/spa.html`
with HTTP 200:

- `/content-management`
- `/career-management`
- `/accept-invite`
- `/loan-calculator`

The allow-list is defined in `src/prerender/routes.js`; nested URLs such as
`/content-management/not-a-route` are not valid staff routes. Invitation query
parameters remain on the browser URL. The calculator behavior is unchanged.

`tools/build.mjs` generates Netlify `_redirects` with these exact 200 rewrites
and a final `/* /404.html 404` rule. Actual files retain precedence. The local
Render blueprint removes the blanket 200 rewrite and keeps only exact valid
SPA rewrites, allowing Render's native missing-resource response. The generated
root 404 document is included for the host's error-page handling.

Vite preview mirrors file-first routing and explicitly serves the generated
error body with status 404 for missing pages and assets, including HEAD requests.
Vite development mode remains a development SPA server; use the built preview
when checking HTTP status codes.

## Deployment verification remains required

No live Render setting was changed by this implementation. When deploying to
the preview site, remove any old dashboard catch-all `/* -> /index.html` or
`/* -> /spa.html` 200 rewrite, apply the exact rules, and verify:

1. A known public route and its assets return 200.
2. Staff and invitation routes return 200 and load their existing interface.
3. A random missing page, missing article and missing asset return 404 without
   a redirect. Check both GET and HEAD.
4. The missing page displays the custom error message, keeps its missing URL
   and offers Return home. Confirm Render's deployed custom-error body as well
   as the status; local tests do not prove CDN behavior.

The change does not migrate hosting, deploy production, modify the calculator,
add admin features or prove Supabase RLS enforcement. Client-side navigation
does not make a new document request and cannot change a previous response's
HTTP status; direct requests and refreshes are the relevant verification.

## Local evidence

`npm.cmd test`: 53 tests passed. `npm.cmd run build`: passed with 26 public
routes plus the error document. `npm.cmd run test:prerender`: eight desktop/mobile
checks passed, including missing-page/asset GET and HEAD status codes, all
generated route statuses, exact client-only routes, and the no-JavaScript error
page and home link.

References: [Render static-site routing](https://render.com/docs/redirects-rewrites),
[Render static-site resource matching](https://render.com/tutorials/web-service-vs-static-site/static-sites),
and [Netlify custom 404 handling](https://docs.netlify.com/manage/routing/redirects/redirect-options/).
