# RapidLink site inventory

Audit date: 2 November 2026. Source: public pages on `https://rapidlinkgh.com`, inspected through direct HTTP retrieval and indexed-page inspection. No real application or personal information was submitted.

## Sitemap and disposition

| Existing route | Published content | Disposition in rebuild |
|---|---|---|
| `/home` | Notices, promotions, service overview, app downloads, navigation | Preserve and improve |
| `/personal-loan` | Personal-loan introduction, benefits and requirements | Preserve and improve |
| `/group-loan` | Group-loan introduction, benefits and requirements | Preserve and improve |
| `/deduct-at-source-loan` | Salary-deduction loan information | Preserve and improve |
| `/business-loan` | Business-loan introduction, benefits and requirements | Preserve and improve |
| `/rapid-savings` | 6% published rate, access and opening requirements | Preserve and improve; rate needs business confirmation |
| `/rapid-susu` | Daily collection, benefits and requirements | Preserve and improve |
| `/rapid-edu-grow` | 8% published rate, withdrawal limits and requirements | Preserve and improve; rate needs business confirmation |
| `/rapid-target-savings` | Treasury-bill-linked rate and withdrawal terms | Preserve and improve |
| `/fixed-deposit` | Terms, “up to 31%” claim and requirements | Preserve and improve; rates accepted |
| `/advantage-investment` | Flexible investment information and “up to 31%” claim | Preserve and improve; rates accepted |
| `/institutional-profile` | History, licence statement, services and published metrics | Preserve; unverified marketing metrics not repeated |
| `/board-of-directors` | Three published names and roles | Preserve |
| `/senior-management` | Same three names and board roles as board page | Preserve pending correction; discrepancy disclosed |
| `/what-drives-us` | Vision and mission | Preserve and improve |
| `/rapidlink-careers` | “No openings” plus a conflicting old role listing | Preserve current no-openings message; old role marked unresolved |
| `/digital-channels` | Mobile app, USSD, MTN/Telecel merchant steps and MoneyQube | Preserve and improve |
| `/stories` | Full dud-cheque sanctions article | Preserve and improve |
| `/faqs` | Seven account, loan and investment answers | Preserve and improve with accessible accordions |
| `/contact` | Head office and Madina branch contacts and addresses | Preserve and improve |
| `/rates` | Fixed-deposit rates dated 19 October 2026 | Preserve and improve |
| `/rate-chart` | 2025 Controller-loan document viewer/download | Preserve route and `/document-viewer` destination |
| `/loan-calculator` | Principal, fixed 6% rate and duration inputs | Preserve original calculation and functionality in redesigned layout |
| `/open-account` | Four-step account form with documents and signature | Preserve and improve; live submission BLOCKED |
| `/apply-loan` | Explicit “Feature Coming Soon” state | Exclude unfinished processing; replace with honest guidance |

## Navigation and external services

- Desktop navigation published Loans, Savings, Investments, SMEs, About, Digital Channels, account opening, MoneyQube, Stories, FAQs and Contact.
- Mobile “Create Account” incorrectly linked to `/digital-channels`; rebuilt link correctly opens `/open-account`.
- Product “Apply Now” links led to `/apply-loan`, which says the feature is coming soon.
- MoneyQube (`https://lendqubegh.loan`) is verified only as a one-month nano-loan product, not a general loan portal.
- App Store and Google Play destinations were preserved in central configuration.
- Existing footer social links and the privacy-policy link used placeholders. They are not represented as working links in the rebuild.
- Existing app links: iOS app ID `6450372073`; Android package `com.borderlessmobile.rlinkmfi`.

## Forms and interactions

- Account form fields, required states, field names, three image uploads, consent and signature were inventoried.
- Existing JavaScript POSTs to `account-creation`; the HTML itself declares `action="#"`.
- A rendered CSRF token was present but was not copied or reused.
- Source JavaScript enforced a 1.5 MB image limit.
- Exact CSRF acquisition, cookie/session rules, cross-origin behaviour, success schema and error schema remain unverified.
- Existing calculator labels its fixed 6% percentage “Annual Interest Rate” and applies it for every month. This original behaviour was explicitly approved for retention.

## Assets and published notices

- The original RapidLink logo was retained without redrawing.
- Published hero and in-page product images for Loans, Savings and Investments were verified against their original routes and bundled locally with the same page assignments.
- Notices preserved: MoneyQube, dud-cheque sanctions, Controller/SME contacts, complaints contact, SME maximum GH¢20,000 / six months, Controller term up to 60 months, and Police loan term up to 30 months / maximum GH¢20,000.

## Unresolved questions

1. What is the official general loan-application portal URL and supported product mapping?
2. What is the current account-submission API contract and authorised test environment?
3. Who belongs on the Senior Management page, and are biographies/headshots approved?
4. Is the old Deposit Mobilization Lead vacancy still open?
5. What approved privacy policy and social-media destinations should replace the placeholders?

