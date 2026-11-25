# Sanity on main

Sanity is the default public-content source on `main`: project `04unhu7g`, dataset `production`. The public website reads published documents with `perspective=published`, without a token or authentication cookies. No content migration or publication runs during installation, build or startup.

## Run locally

```powershell
npm.cmd run cms:install
npm.cmd run cms:dev
```

Open `http://127.0.0.1:3333` and sign in with your authorised Sanity account. The website's `/content-management` page links to Studio; `/cms` and `/career-management` lead there too. Studio is a separate process, not a website administration password form.

If Sanity requests a CORS origin, add the exact Studio address with **Allow credentials** in the project's API settings. Public frontend origins need to be allowed separately without credentials, including local preview addresses and the actual production website origins. Do not allow wildcard origins with credentials.

## Hosting later

Set `VITE_SANITY_STUDIO_URL` to the approved hosted Studio URL and rebuild the website. Localhost remains the default until then; it points to the computer running the browser. Production visitors cannot use someone else's local Studio.

Public defaults are documented in `.env.example`. Existing hosting overrides must select `VITE_CONTENT_SOURCE=sanity`, `VITE_SANITY_PROJECT_ID=04unhu7g`, `VITE_SANITY_DATASET=production`. `VITE_CONTENT_SOURCE=local` explicitly selects bundled content for offline work and deterministic tests. Never put an API write token in a `VITE_` variable.

## Connected content

- News, vacancies, FAQs and announcements respect published visibility and successful empty results. Vacancies/news/FAQs show an unavailable state on failures instead of resurrecting bundled listings.
- Contact details, branch information and social profiles connect to header, footer, contact and loan guidance pages.
- Footer and app-promotion copy use the existing singleton. Until it is published, the current reviewed copy remains available.
- Institutional counters read the published counter records.
- Calculator settings must be active, approved, effective and structurally valid. Incomplete or provisional records retain the approved bundled settings. Formula changes remain code changes; edits to live settings clear previous results.

The site reuses public requests for 30 seconds and rechecks when returning to a browser tab or reopening a page. CDN propagation may add a short delay after publishing. Refresh to retrieve published changes; unpublished drafts never appear through this connection.

Products, board biographies, hero banners and layout remain in website code: the current Studio has no models for these. Abena's prepared answer library also remains in code. The custom CMS experiment is not enabled on main. Customer account/loan submissions are not stored in Sanity.

The existing migration scripts are retained for deliberate operator use only. Do not run them as part of a routine publish or deployment; some scripts write records.

## Verification on 25 November 2026

Public reads succeeded for the existing dataset. Caleb enabled CORS for `https://rapidlinkgh.com`, `https://www.rapidlinkgh.com` and `http://127.0.0.1:5190`; subsequent HTTP checks returned 200 with the matching allowed origin and three published news records. The local CLI is not authenticated, so those project settings were changed by Caleb in Sanity, not by a migration or deployment script.

Validation commands: `npm test`, `npm run build`, `npm run cms:build`, `npm run test:sanity`. Browser tests use isolated published-content fixtures and perform no writes to the live project.
