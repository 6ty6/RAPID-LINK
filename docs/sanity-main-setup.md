# Sanity on main

Sanity is the default public-content source on `main`: project `04unhu7g`, dataset `production`. The public website reads published documents with `perspective=published`, without a token or authentication cookies. No content migration or publication runs during installation, build or startup.

## Run locally

```powershell
npm.cmd run cms:install
npm.cmd run cms:dev
```

Open `http://127.0.0.1:3333` and sign in with your authorised Sanity account. The website's `/content-management` page links to Studio; `/cms` and `/career-management` lead there too. Studio is a separate process, not a website administration password form.

If Sanity requests a CORS origin, add the exact Studio address with **Allow credentials** in the project's API settings. Public frontend origins need to be allowed separately without credentials, including local preview addresses and the actual production website origins. Do not allow wildcard origins with credentials.

The frontend host's Content Security Policy must also allow `https://04unhu7g.apicdn.sanity.io` and `https://04unhu7g.api.sanity.io` in `connect-src`. These are separate from Sanity CORS permissions. `render.yaml` includes the full policy. On a Render service managed through dashboard settings, update the existing `Content-Security-Policy` header there; deploying JavaScript alone does not change a dashboard-managed header. Do not add a second conflicting CSP header.

## Hosting later

Set `VITE_SANITY_STUDIO_URL` to the approved hosted Studio URL and rebuild the website. Localhost remains the default until then; it points to the computer running the browser. Production visitors cannot use someone else's local Studio.

Public defaults are documented in `.env.example`. Existing hosting overrides must select `VITE_CONTENT_SOURCE=sanity`, `VITE_SANITY_PROJECT_ID=04unhu7g`, `VITE_SANITY_DATASET=production`. `VITE_CONTENT_SOURCE=local` explicitly selects bundled content for offline work and deterministic tests. Never put an API write token in a `VITE_` variable.

## Connected content

- News, vacancies, FAQs and announcements respect published visibility and successful empty results. Vacancies/news/FAQs show an unavailable state on failures instead of resurrecting bundled listings.
- Contact details, branch information and social profiles connect to header, footer, contact and loan guidance pages.
- Footer and app-promotion copy use the existing singleton. Until it is published, the current reviewed copy remains available.
- Institutional counters read the published counter records.
- Calculator settings must be active, approved, effective and structurally valid. Incomplete or provisional records retain the approved bundled settings. Formula changes remain code changes; edits to live settings clear previous results.

Every public read tries the uncached Sanity API first. Network errors, HTTP failures, malformed responses or a five-second API timeout trigger a CDN retry, with its own five-second timeout. A successful empty API result is authoritative and never triggers CDN fallback. If both fail, the existing unavailable/fallback behaviour applies.

Open pages recheck every five seconds while visible, and immediately when returning to the tab or focusing the window. Readers of the same content type share one request and timer. There is no 30-second completed-response cache. Unchanged settings retain their identity, so background checks do not clear calculator results. New published settings clear estimates calculated with the previous figures. Updates normally appear within the next five-second check plus network time; CDN fallback may be older during an API outage. Unpublished drafts remain excluded. Direct API polling uses more Sanity API requests than CDN-first reading.

Products, board biographies, page banners, homepage sections, rates documents, navigation and Abena's prepared answers now have connected Sanity models. Layout, animations, calculation formulas and Abena's intent matching remain in website code. The custom CMS experiment is not enabled on main. Customer account/loan submissions are not stored in Sanity. See `docs/cms-page-migration.md` for the completed page groups and import commands.

The existing migration scripts are retained for deliberate operator use only. Do not run them as part of a routine publish or deployment; some scripts write records.

## Verification on 25 November 2026

Public reads succeeded for the existing dataset. Caleb enabled CORS for `https://rapidlinkgh.com`, `https://www.rapidlinkgh.com` and `http://127.0.0.1:5190`; subsequent HTTP checks returned 200 with the matching allowed origin and three published news records. The CLI is now authenticated through the authorised GitHub account. Read-only validation found 52 valid documents and one incomplete news draft, which remains unpublished and unchanged.

Validation commands: `npm test`, `npm run build`, `npm run cms:build`, `npm run test:sanity`. Browser tests use isolated published-content fixtures and perform no writes to the live project.

Editors: see [CMS editor guide](cms-editor-guide.md). Release operators: see [CMS deployment verification](cms-deployment-verification.md), including the optional Node server for real HTTP 404s. The existing Static Site remains unchanged until the separate Web Service configuration is deliberately deployed.
