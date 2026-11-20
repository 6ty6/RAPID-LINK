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

The demo uses only local data and synthetic staff identities. Its CMS adapter is enabled in the demo process. Abena is hidden on `/cms` and other staff/invitation routes. Existing content can be imported through Workspace tools → Import & export, as drafts. It is not automatically published, so managed website sections can be empty until reviewed content is released. The original approved calculator settings remain the default until a replacement is approved and published.

Open only **http://127.0.0.1:5182/**. The integration-preview toolbar connects **View website** and **Manage content** in the same tab. Your staff session stays in memory while switching; the CMS checks it again when you return. Unsaved drafts prompt before leaving the editor. Returning to the website fetches published content again, so you can see a release without opening another browser page. The backend process still runs internally; you do not need to open its URL. This toolbar is shown only when the custom CMS adapter is enabled, and is not present on `main`.

The CMS overview includes **Loan calculator**, also available under **Workspace tools → Loan calculator**. Administrators and staff in the assigned Credit/Finance department can create or edit its single settings record. Other staff can inspect the active settings and test the calculator. The shared flat-interest, fee and settlement formulas remain in code; the original approved pricing constants have not been changed.

## Edit calculator fields

1. Choose **Demo Credit writer → Loan calculator → Create calculator settings draft** (or **Edit calculator settings** for an existing record).
2. Edit loan amount/duration limits, monthly flat interest, processing/insurance/management/settlement percentages, the approved weekly payment schedule, introduction, disclosure and effective date. The nominal annual rate is derived as monthly rate × 12; this does not calculate or assert APR. Repayment frequencies and the underlying formula are unchanged.
3. Enter the Credit approval reference and **three distinct expected repayment examples** from approved schedules. Each example specifies amount, duration, monthly/weekly frequency, instalments paid, expected total repayment, expected instalment and expected early settlement. Expected currency results are checked to two decimal places. These checks demonstrate mathematical agreement; a real business approver must verify the reference and independent schedules. Synthetic automated test examples are not business evidence.
4. Save the draft and submit for review. Invalid bounds, missing weekly counts, negative/out-of-range percentages and mismatching examples prevent review/publication. The existing public version stays active while you edit.
5. Sign out and choose **Demo administrator** as a different approver, open the settings without saving over the writer's draft, approve and publish. Real staff require the matching departmental scope or an administrator. The creator/last editor cannot approve their own version. Publication is immediate and cannot precede the specified effective date; automatic scheduled publication is not implemented.
6. Return to the website calculator. New settings update displayed rates, limits, schedules and calculations. Any displayed estimate is cleared when settings change. During loading or a service failure, calculation is disabled. Unpublishing a replacement restores the original approved code settings; revision history can restore a prior version as a new draft requiring approval again.

The approval reference and verification examples remain private staff records and are removed from the anonymous API response. The public site receives only the approved calculator fields it needs. No new pricing values have been published to the user's local preview or production as part of this implementation.

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

`npm.cmd run cms:test:e2e` uses **separate test ports 5192/8792 and `.cms-data/browser-tests`** so synthetic pricing tests do not edit the local demonstration data on 5182/8791. It includes draft/publish/withdrawal checks for Abena and calculator settings on desktop and mobile. `npm.cmd test` covers reply matching, calculator validation and the original approved calculations; `npm.cmd run cms:test` covers permissions and private-field filtering. Run `npm.cmd run build` before a hosted preview.

Latest local validation: 51 website/unit tests, 16 backend tests and 14 desktop/mobile browser tests passed; production build passed. The local demonstration has a higher request budget for automated tests; hosted production limits are unchanged. These results are not proof of business pricing approval or hosted-environment security.
