# CMS deployment verification

Checked 25 November 2026 against the main-branch website, Sanity project `04unhu7g` / dataset `production`, and `https://rapid-link.onrender.com`.

## Verified behavior

- Feature on homepage now affects the homepage's three news positions: featured stories first, then newest remaining stories.
- Homepage product selection uses a named-product picker with add, move up/down, remove and refresh controls. The existing stored slug array is preserved; no data migration is required.
- New products have reserved/duplicate address checks and independent content requirements. Incomplete new products cannot inherit another product's terms.
- Product-page and homepage-card content share the same public record. Publishing updates reaches both readers through the shared five-second refresh.
- Field help supports hover, focus and click. Section icons explain the major Studio areas. Unsupported legacy flyer-overlay fields are hidden, and unsupported Abena topic creation is disabled.
- Footer menu groups keep their company/product placement when another group is hidden. Abena's configured WhatsApp destination is also used for unavailable/privacy fallback links.
- Schema files now live inside the Studio package so installed dependencies resolve for CLI validation and deployment.
- Sanity PDF downloads now use the CDN download parameter so the browser saves the file instead of opening another page; see [Sanity asset downloads](https://www.sanity.io/docs/content-lake/manage-assets).
- No live product, pricing, news draft or approval data was changed during these tests.

## Test results

| Check | Result |
| --- | --- |
| `npm.cmd test` | 70 tests passed, including real HTTP response tests for the optional production server |
| `npm.cmd run test:cms-ui` | 3 editor-control tests passed |
| `npm.cmd run test:sanity` | 14 desktop/mobile browser checks passed; includes new product pages, shared updates, featured news, calculator, API/CDN fallback, visibility and refresh |
| `npm.cmd run build` | Website production build passed |
| `npm.cmd run cms:build` | Studio production build passed |
| `npx.cmd sanity schema validate` in Studio | Zero errors, zero warnings |
| `npx.cmd sanity documents validate --yes --level error` in Studio | 52 valid documents; one existing incomplete news draft failed six required-field checks. The draft was preserved and is not public. |
| Current Render CSP | Full policy and all three Sanity API/asset destinations verified after Caleb restored the header |
| Current Render unknown URL | Still HTTP 200 on the existing Static Site; production server option prepared below |
| Local production-server deployment check | All security-header, CMS-destination and real-404 checks passed |
| Actual published-data browser smoke check | Nine pages passed with no runtime errors, including the PDF preview/download and the customer-facing 404 page. Used the registered local CORS origin with responses proxied from the local production server. |

The browser and editor-control tests use fixtures and make no project writes. Builds emit the existing PDF bundle-size warning; that is not a test failure. This verification does not certify business wording, production permissions, disaster recovery or external application integrations.

## Production server option for real 404 responses

The existing `render.yaml` describes a Static Site with a catch-all rewrite. That service cannot be made to return true CMS-aware 404s by deploying JavaScript alone. Its preview behaviour was left unchanged.

`tools/serve-site.mjs` is a tested Node server for the same `dist` build. It serves normal pages and assets, returns HTTP 404 with the React application for unknown pages, and recognises newly published product/article routes through the public Sanity API with CDN fallback. Route reads refresh at most five seconds apart. During an outage it avoids incorrectly confirming an unknown page as missing and can return a retryable HTTP 503. It accepts only GET/HEAD and exposes no submission endpoint or project write token.

To test this option locally:

```powershell
npm.cmd run build
$env:PORT = '5193'
npm.cmd start
```

In another terminal:

```powershell
npm.cmd run check:deployment -- http://127.0.0.1:5193
```

`render.web.yaml` is a separate Web Service blueprint for review. It has not been applied. To enable this server on Render, create/configure the approved Web Service with:

- Build: `npm ci && npm run build`
- Start: `npm start`
- Health check: `/home`
- Public Sanity and site environment variables as in the blueprint; any approved Studio/application destination variables must also be copied deliberately.

Do not apply the Web Service configuration to the existing Static Site or change DNS until the new service is tested. Select production hosting/service terms that meet the organisation's uptime needs; a sleeping free preview service remains unsuitable for an uninterrupted production experience. Add the new service's exact public origin to Sanity CORS before testing its browser reads. The Node server supplies the full security headers itself.

## Remaining release steps

1. Use the tested Web Service option (or an equivalent approved server/edge configuration) to satisfy the real-404 requirement. The current Static Site remains suitable for preview; it has not been changed to a Web Service.
2. If staff need Studio away from this computer, host the Studio and set `VITE_SANITY_STUDIO_URL` to that approved address, then rebuild. The current default still points to local port 3333.
3. Complete or discard the unfinished news draft when its owner is ready; it does not block published content. Do not bypass its required fields to publish it.
4. Run `npm.cmd run check:deployment -- https://the-approved-host` after hosting changes, then repeat the browser checks against that origin. Confirm the new build is the deployed commit.
5. Retain the outstanding organisational approvals and security evidence separately. The account-opening notice still disables personal-data submission; this release does not enable an application backend.

The CMS code and builds are ready for deployment testing. Full production sign-off remains dependent on the actual hosting/404 and staff-access configuration above.
