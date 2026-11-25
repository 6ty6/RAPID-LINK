# CMS migration by page

Work proceeds one page at a time. Each page keeps the current website layout, public wording, artwork, verified destinations and a bundled fallback. No rates, biographies, claims or applicant data are invented or imported into unrelated models.

## Studio navigation

- **Homepage** → Announcements.
- **Products & services** → Digital channels — page & cards; Loan calculator.
- **Company** → Institutional profile → Impact numbers; Contact page & social profiles.
- **News & careers** → News; Careers.
- **Help** → FAQs.
- **Shared website content** → Footer & app promotion.

Only connected sections appear. More page sections will be added as they are migrated. Existing documents keep their IDs and content when Studio navigation changes.

## Page 1: Digital Channels

Studio: **Products & services → Digital channels — page & cards**.

1. **Page & banner**: page title, search description, existing banner and accessible image description.
2. **Channel cards**: five existing services, full instructions, official artwork, image descriptions, service links, visibility and drag-to-reorder display order.

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

Next proposed page: homepage slides. Products and board profiles remain in code until their own migration stage.
