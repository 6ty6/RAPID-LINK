# RapidLink Current Content-to-Model Map

**Version:** 1.0  
**Status:** Working document for restructuring  
**Prepared by:** Caleb Adom Awuah  
**Date:** 6 November 2026  
**Controlling brief:** *RapidLink Website Project — Review of the project report and live prototype*, Edmund Nii Odoi Akogyeram, IT Officer, 6 November 2026

## 1. Verified instruction and boundary

This map implements section 7 of Edmund's review. It supports the instruction to define content models, move content out of React components, add a single content-access layer, plan for pre-rendering and work on a branch with preview deployments.

The review also says to **pause new admin features**. Therefore this document does not extend `/content-management` or `/career-management`, select a CMS, or add new database tables. Those decisions follow the CMS comparison due on 13 November 2026.

The loan calculator is recorded for visibility but must not be changed until Credit supplies the actual pricing method and product rates, results are checked against Flexibank schedules, and Compliance confirms the annual-rate and APR disclosures.

## 2. Classification used in this map

| Classification | Meaning |
|---|---|
| Public managed content | Text, media or structured information that a future CMS may manage. |
| Global setting | A controlled public value used across several pages, such as an official phone number or social URL. |
| Application configuration | Technical destinations and environment-specific settings that remain outside ordinary editorial content. |
| Interface code | Layout, interaction and accessibility behaviour that stays in React. |
| Secure backend data | Customer or operational data that must never be stored in the public CMS. |
| Pending confirmation | Content that must not be moved or published as fact until the owning department approves it. |

## 3. Current source map

### 3.1 Central content file

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/content.js` → `announcements` | Scrolling customer announcements | Announcement | `getAnnouncements()` | Marketing/Customer Service | Relevant Department Head; Compliance where regulated | Move to structured records with start/end dates and priority. Verify every current claim before migration. |
| `src/content.js` → `newsArticles` | Customer notices, product news and service updates | News Article / Security Notice where applicable | `getNews()` and `getNewsBySlug()` | Marketing/Communications | Communications lead and subject owner; Compliance for regulated notices | Already has a Supabase path. Preserve local data only as a controlled migration fallback. |
| `src/content.js` → `careerVacancies` | Deposit Mobilization Lead vacancy | Vacancy | `getVacancies()` | Human Resources | Head of HR | Already has a Supabase path. Confirm whether the vacancy remains open before migration/publication. |
| `src/content.js` → `products` | Loan, savings and investment product copy, benefits, requirements, images and some rates/fees | Product, Rate, Fee and Downloadable Document | `getProducts()`, `getProductBySlug()`, `getRatesForProduct()`, `getFeesForProduct()` | Product owner/Credit/Finance | Department Head and Compliance | Split descriptive copy from regulated rates, charges and limits. Do not carry unconfirmed figures into a CMS as approved facts. |
| `src/content.js` → `faqs` | Common product and application questions | FAQ | `getFaqs()` | Customer Service/Product Owner | Department Head; Compliance where regulated | Convert arrays into records with category, related product and review date. Several current answers explicitly require confirmation. |
| `src/content.js` → `navGroups` | Header and footer menu labels/routes | Navigation | `getNavigation()` or static navigation configuration | Marketing/IT | Communications/IT | Routes may remain application configuration initially; labels/order can become managed later if required. |

### 3.2 Homepage

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/pages/Home.jsx` → `slides` | Homepage slider headlines, images, links and calls to action | Homepage Feature / Announcement / News relation | `getHomepageFeatures()` | Marketing/Communications | Communications lead; subject owner | Move slide data out of the component. Keep animation timing, controls and pause behaviour in React. |
| `src/pages/Home.jsx` → quick-access cards | Current interest rates and loan calculator links | General Page section / Navigation | `getPage('home')` | Marketing/Product Owner | Communications/Product owner | Content can become structured page sections; destinations remain application routes. |
| `src/pages/Home.jsx` → news section | Latest-news heading and article selection | General Page settings + News Article relations | `getPage('home')` and `getNews()` | Marketing/Communications | Communications lead | Article data already comes through the news hook; move section labels and selection settings out of JSX later. |
| `src/pages/Home.jsx` → services and product selection | Service labels, links and six featured products | General Page section + Product relations | `getPage('home')` and `getProducts()` | Marketing/Product owners | Communications and department owners | Store the featured product slugs/order as structured data. |
| `src/pages/Home.jsx` → metadata | Homepage title and description | General Page / SEO fields | `getPage('home')` | Marketing/Communications | Communications lead | Include in pre-rendered page metadata. |

### 3.3 Product, rate and downloadable-document pages

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/pages/Products.jsx` → `ProductPage` | Product headings, section labels, application actions and loan-rate-guide relationship | Product + related actions/documents | `getProductBySlug()` | Product Owner | Department Head; Compliance where regulated | Move customer-facing labels/actions into structured content where appropriate. Keep rendering logic in React. |
| `src/pages/Products.jsx` → `Rates.rows` | Fixed-deposit rate bands and effective-date copy | Savings/Investment Rate | `getCurrentRates()` | Finance/Treasury | Finance Head and Compliance | **Pending confirmation.** Do not treat the hard-coded table as approved until Finance/Compliance sign off. |
| `src/pages/Products.jsx` → `RateChart` | Controller loan rate-guide title and PDF paths | Downloadable Document | `getDocumentBySlug('controller-loan-rates')` | Credit | Head of Credit and Compliance | Store title, version, effective date, file and preview asset as document metadata. |
| `public/downloads/rate-chart.pdf` | Customer-facing loan-rate guide | Downloadable Document asset | Asset returned by document service | Credit | Head of Credit and Compliance | Confirm that the file is current before production publication. |

### 3.4 Institutional, governance and people content

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/pages/Information.jsx` → `InstitutionalProfile` | Institutional history and profile | General Page / Institutional Profile | `getPage('institutional-profile')` | Company Secretariat/Marketing | Executive management and Compliance | Move paragraphs and hero content out of JSX; confirm licensing wording with Compliance. |
| `src/pages/Information.jsx` → purpose flip cards | Vision and mission | General Page structured sections | `getPage('institutional-profile')` | Executive management/Company Secretariat | Chief Executive Officer | Keep flip-card interaction in React; move titles and approved statements to content. |
| `src/pages/Information.jsx` → impact counters | Branches, customers, years and products | Organisational Statistic | `getOrganisationStats()` | Relevant business-data owner | Executive management | All figures require a source, “as at” date and approval before publication. |
| `src/pages/Information.jsx` → `people` | Board member names, roles, portraits and biographies | Board Member | `getBoardMembers()` | Company Secretariat | Board Chair/delegated executive and Compliance | Move records out of JSX; verify biographies and image permissions. |
| Future management page | Management profiles requested in Edmund's section 5 | Management Member | `getManagementMembers()` | Human Resources | Chief Executive Officer | Model exists in the specification; content is still required. |

### 3.5 Digital channels and official service links

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/pages/Information.jsx` → `DigitalChannels.channels` | Mobile app, USSD, merchant IDs and MoneyQube information | Digital Channel / Official Channel | `getDigitalChannels()` | Digital Banking/Operations | Department Head and Compliance | Move descriptions and public identifiers out of JSX. Verify every code, merchant ID and destination. |
| `src/components/Shared.jsx` → `AppDownload` | Mobile-app promotional copy and store buttons | Digital Channel / General Page section | `getDigitalChannel('mobile-app')` | Digital Banking/Marketing | Department Head/Communications | Reuse the same approved record on every page. Keep layout in React. |
| `src/config.js` | Site URL, portal/API origins and external service destinations | Application configuration | `getPublicConfig()` | Information Technology | IT lead | Keep environment-specific values out of editorial CMS. Public service links may be referenced by content records but configuration controls trusted origins. |

### 3.6 News and careers

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/hooks/usePublishedNews.js` | Hybrid local/Supabase news loading | News Article | Replace with the future content-access module | Marketing/Communications | Communications lead | Current hook is an interim path; pages should not know whether data came from Supabase, a CMS or build-time files. |
| `src/services/careers.js` | Supabase requests for vacancies/news and image uploads | Interim repository/integration | Wrapped by `contentRepository` | Information Technology | IT lead | Preserve for security fixes only. Do not expand it into the final hand-built CMS while CMS research is pending. |
| `src/pages/Information.jsx` → Stories/StoryArticle | Newsroom headings, filters, article presentation and related stories | General Page + News Article | `getPage('news')`, `getNews()`, `getNewsBySlug()` | Marketing/Communications | Communications lead | Keep filtering and UI in React; move page copy and article data behind the access layer. |
| `src/pages/Information.jsx` → Careers | Careers hero, vacancy search and vacancy presentation | General Page + Vacancy | `getPage('careers')`, `getVacancies()` | Human Resources | Head of HR | Keep search/UI in React; load vacancy records only through the content layer. |
| `src/pages/CareerManagement.jsx` | Existing news/vacancy editor | Existing interim admin interface | No new model/function work | Information Technology | IT lead | **Paused except for section 4 security fixes**, as instructed by Edmund. |

### 3.7 FAQs, contact details and branches

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| `src/pages/Information.jsx` → `FAQs` | FAQ-page hero and accordion presentation | General Page + FAQ | `getPage('faqs')`, `getFaqs()` | Customer Service/Product Owner | Department Head; Compliance where applicable | Keep accordion behaviour in React. |
| `src/pages/Information.jsx` → `Contact` and `branches` | Head office, Madina branch, phones, digital addresses, map queries and directions | Branch + Official Contact | `getBranches()` and `getOfficialContacts()` | Operations/Customer Service | Operations Head | Consolidate duplicated numbers/addresses into one source and verify coordinates/opening hours. |
| `src/components/Header.jsx` | Customer-support and Controller/SME telephone numbers | Official Contact | `getOfficialContacts()` | Customer Service | Customer Service Head | Header and mobile header should read from the same approved record. |
| `src/components/Footer.jsx` | Address, telephone, email and social destinations | Official Contact / Social Profile | `getOfficialContacts()` and `getSocialProfiles()` | Marketing/Customer Service | Communications/Customer Service Head | Consolidate with contact page and security-centre records. |

### 3.8 Global page content and legal information

| Current source | Current content | Target model | Proposed access function | Owner | Approver | Action/status |
|---|---|---|---|---|---|---|
| Page-level `PageHero` and `PageMeta` props across JSX files | Page title, introduction, hero image and SEO description | General Page | `getPage(slug)` | Owning department/Marketing | Communications and relevant owner | Move page-specific values out of components, then use them for pre-rendered metadata. |
| `src/components/Footer.jsx` → privacy placeholder | “Approved privacy-policy content is pending.” | Legal Policy | `getPolicy('privacy')` | Compliance/Legal | Authorised legal/compliance approver | No personal-data form may submit until approved content and secure handling are in place. |
| Missing trust/disclosure pages from review section 5 | Complaints procedure, licensing/deposit protection, annual reports, whistleblowing, terms, cookies, accessibility, security centre | Complaint Procedure, General Page, Annual Report, Legal Policy, Security Notice | Corresponding content-layer functions | Department owner | Compliance/Legal/Executive as applicable | Await approved source content; models may be prepared but wording must not be invented. |
| Missing self-service content from review section 5 | Forms, KYC checklists, opening hours, holiday notices and service status | Downloadable Document, Product requirements, Branch, Announcement, Service Status | Corresponding content-layer functions | Owning department | Department Head/Compliance | Structure can be prepared; publication waits for approved materials. |

### 3.9 Application forms and calculator boundaries

| Current source | Current content/data | Classification | Future handling | Status |
|---|---|---|---|---|
| `src/pages/OpenAccount.jsx` | Form steps, field definitions, uploads, signature and consent copy | UI schema plus secure customer data | Interface labels may use approved structured content, but submitted customer data must go to a separate secure backend—not the CMS. | Submission remains disabled until privacy content and an approved backend contract exist. |
| `src/pages/Loans.jsx` → loan application guidance | General-loan guidance and MoneyQube link | General Page + Digital Channel | Move public guidance behind the content layer; keep destinations verified. | General-loan integration depends on the confirmed portal/configuration. |
| `src/pages/Loans.jsx` → `LoanCalculator` | Hard-coded `rate = 6`, labels and calculation | Loan Pricing / Calculator Configuration | Record the dependency but do not migrate or alter it until Credit confirms the actual method and product rates. | **Blocker before wider demo according to Edmund's review. User has instructed that the calculator should not be touched for now.** |
| Any future complaint, subscription or application submission | Personal/customer information | Secure backend data | Separate secured service with consent, retention, access control, audit and processor review. | Explicitly outside the public CMS. |

## 4. Content that remains in React

The restructuring removes editable public content from components, not the interface itself. The following remain in React:

- routes and route guards;
- menus, accordions, modal dialogs and keyboard behaviour;
- slider timing, focus management and pause controls;
- responsive page layouts and styling;
- filtering, search and pagination behaviour;
- form state and client-side validation;
- PDF rendering behaviour;
- accessible labels that describe controls, where they are part of the component contract;
- formatting helpers; and
- error, loading and empty-state components, with approved customer-facing wording supplied through the content layer where practical.

## 5. Proposed single content-access layer

Pages should import from one public module rather than importing `src/content.js`, calling Supabase directly or defining page data inside JSX.

```text
React pages and components
          |
          v
src/content/index.js (stable public interface)
          |
          v
content repository selected by environment/build
    |                 |                  |
structured files   Supabase adapter   future CMS adapter
```

Proposed public functions:

```text
getPage(slug)
getNavigation()
getAnnouncements()
getProducts()
getProductBySlug(slug)
getRatesForProduct(productSlug)
getCurrentRates()
getFeesForProduct(productSlug)
getNews(filters)
getNewsBySlug(slug)
getVacancies(filters)
getFaqs(filters)
getBoardMembers()
getManagementMembers()
getBranches()
getOfficialContacts()
getSocialProfiles()
getDigitalChannels()
getDocuments(filters)
getServiceStatus()
```

The function names and returned shapes remain stable even if the selected CMS changes. This is the key protection Edmund requested: only the adapter changes when the CMS decision is made.

## 6. Safe migration order

1. Create the content-access module and TypeScript/JSDoc-style record contracts without changing page output.
2. Move `announcements`, navigation, FAQs and product descriptions behind the module using the current structured file as the first adapter.
3. Wrap the existing news and vacancy Supabase calls behind the same module.
4. Move homepage slides, institutional copy, board members, digital channels, branches, contacts and global page metadata into structured records.
5. Add contract tests proving each page receives the same content during the move.
6. Complete the CMS comparison and choose the future adapter.
7. After departmental approval, migrate regulated rates, fees, complaints, legal and security content.
8. Add build-time fetching and a publish webhook/build hook so public pages can be pre-rendered and rebuilt after approved content is published.

## 7. Immediate dependencies and risks

| Dependency/risk | Required action |
|---|---|
| CMS product has not been selected | Complete the two-to-three-page comparison by 13 November 2026 before expanding admin functionality. |
| Current content includes unverified rates and claims | Mark records pending; obtain written confirmation from Credit, Finance and Compliance. |
| Calculator is misleading according to the review | Keep it isolated and do not widen the demo until the pricing issue is resolved. |
| Static and Supabase copies can conflict | Define one precedence rule during migration and remove fallbacks only after records are verified. |
| Client-only metadata is weaker for some crawlers | Plan pre-rendering and build-time content retrieval. |
| Personal data must not enter the CMS | Maintain a separate secure-backend boundary for applications, complaints and subscriptions. |
| Existing admin work may influence the CMS decision | Treat it as an interim prototype and security-fix surface, not the final architecture. |

## 8. Completion test for this mapping stage

This stage is complete when:

- every current content source has a target model or explicit non-CMS classification;
- owners and approvers are proposed and awaiting confirmation;
- regulated values are clearly marked pending rather than assumed;
- the calculator and admin-feature pause are documented;
- a stable content-access interface is defined; and
- the next code change can begin without committing the project to a particular CMS.

