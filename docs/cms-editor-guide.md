# RapidLink CMS editor guide

Updated 25 November 2026. This guide explains how to manage public website content in Sanity, how the sections connect, and which actions change the live website. Staff should publish only information approved for public release.

## Open the CMS

Run `npm.cmd run cms:dev` from the repository, open `http://127.0.0.1:3333`, and sign in with your authorised Sanity account. The website's **Content management → Open Sanity Studio** link opens the configured Studio address. Studio currently runs locally; hosting the public website does not automatically host Studio.

The information icons in the section menu describe the section on hover. Each form field also has an **i** help control: hover for an explanation, or focus/click it to read the help. Normal Sanity editing, validation and publication controls remain available.

Every image upload also shows a **Recommended upload** size/shape, where it appears and how it is cropped. **Selected image** shows the actual uploaded width and height. These are source-image recommendations, not a fixed screen size or a new upload restriction. See [CMS image upload sizes](cms-image-sizes.md) for the complete size table and measured current artwork.

## Common controls

| Control | What it does |
| --- | --- |
| Create / plus | Creates a draft record in a collection such as Products, Articles or Vacancies. It does not immediately add it to the website. |
| Publish / Publish changes | Makes the saved version public. Normally the website picks it up within five seconds plus network time. Resolve validation errors first. |
| Draft | An unpublished edit. The website continues showing the last published version. |
| Show on website / Visible on website | Includes or excludes that item when its document is published. Turn off and Publish to hide it without deleting it. |
| Unpublish | Removes the published version and keeps an editable draft. For products/news/vacancies/questions this removes the public record. Page-appearance singletons may revert to the bundled fallback; use their item visibility controls to hide individual items. |
| Delete | Removes a collection record. Check homepage and menu links first. Shared page singletons are protected from ordinary delete/duplicate actions. |
| Add item | Adds an entry inside an array: a benefit, branch, card, menu link or answer variation. Complete its required fields and enable its visibility if it has that switch. |
| Drag handle | Reorders items inside the current list. Publish the document to apply that order. Separate records use Display order where provided. |
| Display order | Lower numbers appear first. This does not choose products for the homepage. |
| Remove an array item | Removes it from this list after publication; it does not delete an independently stored product. |
| Upload / Select image or file | Uploads approved artwork or chooses an existing Sanity asset. This does not rewrite text printed inside a flyer image. |
| Image description | Describes the image for accessibility. It does not change the image itself. |
| Page address / slug | Identifies a page's URL. Keep existing addresses stable: changing a slug does not automatically redirect old links. |
| Link / destination | Where the customer goes when selecting that item. Use a site path such as `/rates`, an approved HTTPS address, or a correctly formatted telephone/email link as the field allows. |

Do not delete singleton pages to temporarily hide a section: their fallback content exists to keep the website usable during CMS outages.

## Where to edit each section

| Studio selection | What changes on the website |
| --- | --- |
| Homepage → Page content & flyers → Page title & search description | Homepage browser/search title and description. |
| Homepage → Flyer slider | Flyer images, accessible descriptions, destinations, order and visibility. The image is the clickable slide; no extra text overlay is added. Edit the artwork separately to change words printed on a flyer. |
| Homepage → Featured products | Product section headings and the chosen product cards/order. Products themselves are edited under Products. |
| Homepage → Services section | The service pathway heading, introduction, supported icons, descriptions and destinations. |
| Homepage → Rates & calculator section | Planning section headings and the Current Interest Rates card text/image. Its destination is `/rates`. The calculator card has its own editor below. |
| Homepage → News section | Homepage news heading and link labels. It does not contain the articles. |
| Homepage → Announcements | The shared announcement ticker: message, display order, visibility and optional start/expiry times. Priority is an internal editorial label; it does not change ticker position or colour. |
| Products | Product detail pages and the shared title, introduction and photograph used by selected homepage cards. |
| Digital Channels → Banner | The page title, description, banner and accessibility text. |
| Digital Channels → Service cards | App/USSD/merchant/MoneyQube artwork, instructions, official links, visibility and order. Flip behaviour and styling remain in code. |
| Loan Calculator → Page appearance & homepage card | Banner, form labels/help, result wording and the homepage calculator card text/photo. This does not set prices. |
| Loan Calculator → Rates, fees & approval | Validated limits, interest/fees, available repayment schedules, early-settlement settings, introduction, disclosures and approval metadata. |
| About RapidLink → Page content, Vision & Mission | Institutional banner, company introduction, vision, mission and impact heading. Rich text supports paragraphs, bold and emphasis. |
| About RapidLink → Impact numbers | Each verified number, label, prefix/suffix, supported icon, order and visibility. Last verified date is an editorial record. |
| Board of Directors | Portraits, names, roles and biographies. Reorder profiles or hide an individual profile, then Publish. Profile dialogs and animations remain automatic. |
| News → Page headings | Newsroom banner, section headings and search placeholder. |
| News → Articles | Article pages, newsroom listings, categories, publication dates, homepage selection and article artwork. |
| Careers → Page headings & departments | Careers banner/headings, search placeholder and department filter labels/order. |
| Careers → Vacancies | Job details, department, location, employment type, description, responsibilities, application email, visibility and open/closed status. |
| FAQs → Page banner | FAQ page banner and introduction. |
| FAQs → Questions & answers | Public answers, visibility and display order. Category currently organises records for editors; the website displays one question list. |
| Contact & branches → Page headings | Contact banner and map-section wording. |
| Contact & branches → Contact details & social profiles | Shared official email, support/loan numbers, branch information and social destinations. The first branch supplies the main-office address in the footer. |
| Rates & documents → Current rate table | Public investment rate bands, term labels and rates on `/rates`. This is separate from calculator pricing and product-benefit wording. |
| Rates & documents → Documents library | Uploads, descriptions, formats, dates/versions and public-list visibility for approved documents. |
| Rates & documents → Controller loan rates guide | Guide-page copy, dialog labels and the current document selected from the library. A library PDF uses one file for both viewing and downloading. |
| Account-opening update | The current coming-soon/unavailable notice. Editing it does not enable submission or send an email. |
| Loan application guidance | Pending/connected application guidance copy. The general application URL is configured separately by the developer. |
| Abena | Welcome, quick questions, prepared replies, supported topic variations, follow-up replies and approved contact/service links. |
| Shared website content | Footer descriptions/headings/links, company copyright wording and the app-download promotion. App-store destinations remain configuration. |
| Navigation menus | Header dropdown groups and their links; the same groups supply footer dropdowns. Visibility and order apply after publication. |

## Add or update a product

1. Open **Products → Create**.
2. Enter a unique page address, name, category, introduction and section heading. Addresses use lowercase words separated by hyphens, for example `rapid-community-savings`. Reserved website addresses such as `rates` cannot be used.
3. Add the main photograph, banner photograph and image description. The main photograph is shared by its detail page and homepage card; the banner is used at the top of the product page.
4. Add approved benefits and requirements. A new product must provide its own information; it does not inherit another product's financial terms.
5. Set **Loan** on for a loan product, or off for an account/investment product. This controls the standard application action. Set **Show on website** on, then **Publish**.
6. Open the new `/<page-address>` on the website and check its content.
7. To show it on the homepage, follow the separate selection steps below. Add a navigation-menu link separately if it should be reachable from a dropdown.

Updating a product title, introduction or main photograph updates every homepage card using that record. Benefits and requirements appear on the product page only. Product-page rate wording, the public rates table and calculator pricing are separate records: editors must keep approved information consistent across them.

### Choose homepage products

Open **Homepage → Page content & flyers → Featured products → Homepage products**. Choose a published product by name from the selector. Use **Move up / Move down** to set its order, or **Remove** to remove its card. **Refresh products** reloads available published products without altering your selection. A hidden, deleted or unpublished product is labelled and will not appear publicly.

Publish the homepage document after changing its selection. Removing a card does not delete the product page. An intentionally empty selection shows no product cards.

## Publish news and choose homepage stories

Create/edit an article under **News → Articles**. Supply its title, generated slug, category, date, summary, image/description and article sections. Turn **Visible on website** on and Publish.

The homepage has up to three stories. **Feature on homepage** gives a visible published article priority. Featured articles are ordered newest first; any spare spaces are filled by the newest other published articles. The first selected story uses the large layout. If more than three are featured, only the three newest featured stories appear there. Turning the feature switch off does not hide the story from the newsroom.

The publication date controls ordering; it is not a scheduled-publication switch. Drafts are excluded regardless of their date. The newsroom has its own featured-story display and category/search filtering.

## Careers and department filters

The careers department list contains the current Credit, Finance, Human Resources, Marketing/Sales, Operations and Strategy Support labels. When adding a vacancy, use a matching department name. A department filter does not create a vacancy. **All Departments** remains available automatically.

**Open** permits the existing application action; **Closed** shows the vacancy as closed when visibility remains on. Turn visibility off and Publish to remove the listing entirely. The application email belongs to that vacancy; it is not an account-opening destination.

## Calculator controls

| Calculator area | Purpose |
| --- | --- |
| Banner / Form labels & help / Results wording / Homepage card | Presentation only. Keep required placeholders such as `{annualRate}`, `{frequency}`, `{count}` and `{instalments}` intact. |
| Loan limits | Minimum/maximum amount and allowed duration. The customer form validates these limits. |
| Interest & fees | Approved monthly flat rate, nominal annual rate and individual fee rates used in the estimate. |
| Repayment schedule | Available payment frequencies and weekly payment counts by loan duration. |
| Early settlement | Approved settlement-fee setting. Protected formula rules remain read-only. |
| Customer wording | Introduction, estimate disclaimer and verification notice. |
| Approval & dates | Active switch, approval status, effective date and approver/reference. |

Publishing alone does not activate invalid, inactive, provisional or future-effective pricing. The public adapter validates these settings and retains the approved fallback if validation fails. Unchanged five-second refreshes do not clear customer estimates; changed pricing clears a result that used previous figures. Approval metadata records the business decision; this is not a separate multi-person approval workflow or permission system.

Do not change business prices merely to test a button. Use fixtures/local testing for experiments.

## Abena controls

Abena uses prepared answers, not a generative AI service. Edit an existing topic's answer variations and approved links, then Publish. Variations let her word an answer differently; follow-up variations handle supported prompts such as “tell me more”. Quick questions are shortcuts that send a question through the same matching logic.

Supported topics are fixed in code. The topic list cannot add/delete/duplicate entries in Studio; new topic recognition requires development work. Privacy protection and the response for unconfirmed information remain in code. The WhatsApp destination also applies to fallback/help links. Website chats are not submitted to Sanity or passed automatically into WhatsApp.

Replies are approved text, not a live search of every CMS field. If branch, product or contact information changes, review Abena's corresponding prepared answer as well. A link to the current page is preferable to duplicating changeable financial figures.

## Documents library and rates versions

Open **Rates & documents → Documents library → Create** to upload a public document. Enter its title, download name, description/category and optional approved date/version. Upload a PDF, Excel (`xls`, `xlsx`), Word (`doc`, `docx`), PowerPoint (`ppt`, `pptx`), CSV, TXT, RTF, ODT or ODS file. The download keeps its correct extension. PDFs have the existing on-page viewer; other formats provide a download and explain that a compatible application is needed to open them.

**Available on website** and Publish makes the record eligible for use. **List on Documents page** additionally lists it at `/documents`, where customers can search/filter and download. A link to this list is on the rates-guide page. Turning off listing does not make a file private; this library is for public information only.

The existing rates PDF has been imported without changing its file. In **Rates & documents → Controller loan rates guide → Current document & viewer**, **Current rates document from Documents library** selects the file used by the rates dialog and Deduction at Source. Replacing the selected record’s upload changes both consumers. Hiding or unpublishing that selected record makes the current viewer unavailable instead of falling back to an older rate file.

For a **new rates version**, create a separate document record, give it its own download name and version/date, then Publish. Select it as the current rates document and Publish the guide. The previous record remains intact; decide separately whether to keep it listed or turn off its listing. Version text does not automatically select the current record. Update the guide page’s heading/introduction if it mentions an old year. The viewer uses the selected document’s title/version, while the guide page retains its separately editable headings.

Uploading a rates document does not change calculator prices or the separate `/rates` investment table. A document selected by the guide is protected by its reference: select a different current document before trying to delete it.

No duplicate preview upload is needed for a library PDF: its single file supplies both viewing and downloading. The legacy standalone PDF/preview controls remain available only when no library document is selected.

## When a published change does not appear

1. Confirm you published the document, not just saved a draft.
2. Check the record/item visibility switch and any date/status/approval conditions.
3. Keep the website tab visible and allow its next five-second refresh plus connection time.
4. For homepage products, check the product is both published/visible and selected on the homepage.
5. For news, check date and feature priority. Only three stories fit on the homepage.
6. For a changed URL, update related homepage/menu links. Old slugs do not redirect automatically.
7. If requests fail, ask IT to check Sanity CORS and Render CSP. PDF previews need `https://cdn.sanity.io` under `connect-src` as well as the two Sanity API hosts.

The website reads the published API first and retries the CDN on failure. The CDN can lag during an outage. Editorial page settings retain bundled/last-known fallbacks; unavailable news, vacancies and FAQ listings are not replaced with old bundled public listings. A CMS schema or website-code change requires a new build; a normal content publication does not.

## What remains outside the CMS

Layout, card animations, cursor/loader behaviour, calculation formulas, route handling, application-backend connections, permissions and secrets are code/configuration. The CMS does not collect account applications, identification documents, signatures, customer balances or complaints. Store only approved public content here.

See [CMS deployment verification](cms-deployment-verification.md) for the current automated results, hosting requirements and outstanding release steps.

## Account opening: form wording

Open **Account opening ? Application form** in Sanity. The **Coming-soon page** entry still controls the default /open-account notice. The application form entry controls only /open-account?preview=true.

- Introduction: heading and introductory paragraph above the form.
- Step labels: progress indicator and five step headings; the order stays fixed.
- Accounts: Savings/Current card names, descriptions and selection prompts.
- Branches: optional-branch heading, default-branch explanation and Head Office caption. Accepted branch names remain Asylum Down and Madina.
- Field labels: visible labels beside personal/work fields and in the review. API keys and validation remain fixed.
- Documents: document-section introduction and photo/signature/card image labels.
- Review: review instructions, Edit wording, missing-value text and document checklist on the account cards.
- Controls: Continue, Back, Clear form and other navigation/field guidance.
- Clear popup: confirmation heading, message and both action labels.

Publish to update the test preview. Existing local wording is the fallback when the CMS cannot load. Test-mode notices, submission disabling, API options, required fields, dates and upload limits cannot be changed here. Do not enter applicant details or upload identity documents to Sanity. No application records are stored in this CMS.
