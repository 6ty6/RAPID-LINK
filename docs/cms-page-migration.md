# CMS migration by page

Work proceeds one page at a time. Each page keeps the current website layout, public wording, artwork, verified destinations and a bundled fallback. No rates, biographies, claims or applicant data are invented or imported into unrelated models.

## Studio navigation

- **Homepage** — opens the currently connected announcements directly.
- **Digital Channels** — Banner / Service cards.
- **Loan Calculator** — Page appearance & homepage card / Rates, fees & approval.
- **About RapidLink** — opens the currently connected impact numbers directly.
- **News**, **Careers**, **FAQs** — separate searchable content lists.
- **Contact & branches** — Contact numbers / Branches / Social media.
- **Shared website content** — Footer text / Footer links / App download section.

Only connected sections appear. More page sections will be added as they are migrated. Existing documents keep their IDs and content when Studio navigation changes.

## Page 1: Digital Channels

**Completed 25 November 2026.** Imported and published with Caleb's authorised GitHub-backed Sanity account. Verification matched all five cards and all six uploaded images to the bundled fallback. The live Render page was checked in Chrome: it loads the Sanity banner and service artwork, preserves ordering and flip behaviour, and displays the existing USSD instructions without runtime errors.

Studio: **Digital Channels**.

1. **Banner**: page title, search description, existing banner and accessible image description.
2. **Service cards**: five existing services, full instructions, official artwork, image descriptions, service links, visibility and drag-to-reorder display order.

The mobile app, RapidPay USSD, MTN Merchant ID, Telecel Merchant ID and MoneyQube retain their current information. The banner, folded corners, alternating colours, sheen and click-to-flip behaviour stay in website code. The app-promotion section beneath the cards uses the existing shared singleton.

The public adapter reads the published singleton `rapidlink-digital-channels-page` through the common API-first/CDN-fallback connection. A missing or invalid page uses `src/content/digitalChannels.js`. A successful page with no visible cards stays empty. To hide a service, turn off **Show this card on the website**, then Publish.

### Import current content

```powershell
cd cms/sanity/studio
npm.cmd run migrate:digital-channels:dry-run
npx.cmd sanity login
npm.cmd run migrate:digital-channels
npm.cmd run verify:digital-channels
```

The dry run needs no login and writes nothing. The importer uploads the six existing images and creates the current published page only when neither a published page nor a draft exists. It never replaces editors' changes or deletes drafts. Run verification immediately after the initial migration; later intentional edits will differ from the bundled baseline.

## Page 2: Loan calculator page & homepage card

**Completed 25 November 2026.** Imported and verified all presentation fields and both images against the current fallback. A production-build browser check using the actual Sanity content confirmed the homepage card opens the calculator, both images load from Sanity, valid amounts calculate and unchanged background refreshes preserve results. Existing pricing and approval records were not modified by the importer.

Studio: **Loan Calculator**.

- **Page appearance & homepage card**: Banner / Form labels & help / Results wording / Homepage card. Current banner, title, form labels, explanatory wording, results headings/labels, empty state and homepage card title, description and photograph. Form help retains validated placeholders for the current annual rate and repayment schedule. The card's destination remains `/loan-calculator` in application code.
- **Rates, fees & approval**: the existing pricing singleton, including the calculator introduction and estimate disclaimer. Approval, effective date and structural validation still apply.

Presentation fields do not change calculation formulas or approval status. Required dynamic calculation disclosures, error messages and numeric schedule descriptions stay in code. The current presentation fallback is `src/content/calculatorPage.js`; pricing keeps its existing separate fallback.

```powershell
cd cms/sanity/studio
npm.cmd run migrate:calculator-page:dry-run
npm.cmd run migrate:calculator-page
npm.cmd run verify:calculator-page
```

This importer creates a separate page singleton and uploads the existing banner/card images. It skips existing pages or drafts and never rewrites pricing settings or approvals.

Next proposed page: homepage slides. Products and board profiles remain in code until their own migration stage.
