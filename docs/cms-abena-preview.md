# CMS and Abena integration preview

Branch: `integration/cms-abena-preview`. This combines `feature/custom-public-cms` and `feature/animated-help-assistant` for testing. It does not change `main` or either source feature branch. The local worktree remains `.worktrees/custom-public-cms`; its checked-out branch is now the integration branch.

## Start locally

From the repository root in PowerShell:

```powershell
cd '.worktrees/custom-public-cms'
npm.cmd install
npm.cmd run cms:install
npm.cmd run cms:dev
```

- Website with Abena: http://127.0.0.1:5182/
- Staff CMS: http://127.0.0.1:5182/cms
- Local content API: http://127.0.0.1:8791/api/cms/public

The demo uses only local data and synthetic staff identities. Its CMS adapter is enabled in the demo process. Abena is hidden on `/cms` and other staff/invitation routes. Existing content can be imported through Workspace tools → Import & export, as drafts. It is not automatically published, so managed website sections can be empty until reviewed content is released. The calculator stays unchanged.

Open only **http://127.0.0.1:5182/**. The integration-preview toolbar connects **View website** and **Manage content** in the same tab. Your staff session stays in memory while switching; the CMS checks it again when you return. Unsaved drafts prompt before leaving the editor. Returning to the website fetches published content again, so you can see a release without opening another browser page. The backend process still runs internally; you do not need to open its URL. This toolbar is shown only when the custom CMS adapter is enabled, and is not present on `main`.

## Test an answer in Abena

1. Choose Demo writer, open Customer help → Abena answers and create a draft. Enter a title, an example question, a prepared reply and its approved information source. Save and submit it.
2. Sign out and choose Demo approver. Open the record, approve it and publish it. For this demonstration, the writer's record is owned by Marketing/Sales, which matches the demo approver's department.
3. Open the website in a second tab, open Abena and type the example question. Refresh the page after publication, or allow the public content refresh (up to 30 seconds).
4. Confirm that an edited draft leaves the released answer unchanged. Unpublish, refresh and ask again: the removed answer must be unavailable.

Matching normalises case and basic punctuation but requires the whole example question or FAQ title to match. Add several example questions for common variations. This is still prepared, local matching, not AI. A matched approved reply may have several wording variations and approved links. Basic greetings and privacy responses remain prepared interface replies; CMS content cannot override the private-information safeguard. No typed questions or transcript are sent to the CMS API.

In custom CMS mode, Abena uses published FAQ answers, prepared Abena records, branch/product records and site contacts. Missing information and service failures get an unavailable response. Verified existing assistance contacts remain available as a fallback. In normal mode (`VITE_CUSTOM_CMS_ENABLED=false`), the original Abena behaviour is retained.

## Render preview

Select **this branch on a separate preview service**, keeping the production service on `main`. Branch selection alone does not provision the CMS backend. A hosted test requires a configured HTTPS CMS API, persistent disk, real invited staff and verified MFA, as described in `docs/custom-public-cms.md`.

For that preview frontend, set `VITE_CUSTOM_CMS_ENABLED=true` and `VITE_CMS_API_BASE_URL` to the approved hosted test API origin. Set the backend's `CMS_WEBSITE_ORIGIN` to the exact preview website origin. Never set the browser API URL to localhost on Render and never expose demo accounts on a hosted service. Keep `CMS_DEMO=false` for hosted tests. Do not change production environment variables to test this branch.

No Render service, hosted database, production environment or live authentication settings were changed by this integration.

## Verification

`npm.cmd run cms:test:e2e` includes desktop/mobile checks that a draft is unavailable in Abena, a separately approved publication answers the question, and withdrawal removes that answer. `npm.cmd test` covers CMS-aware reply matching and the original fallback behaviour; `npm.cmd run cms:test` covers backend permissions. Run `npm.cmd run build` before a hosted preview.
