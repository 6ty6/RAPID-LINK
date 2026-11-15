# RapidLink Website Content Models and Governance Specification

**Version:** 1.0  
**Status:** Draft for management review  
**Prepared by:** Caleb Adom Awuah  
**Date:** 6 November 2026  
**Target progress review:** 13 November 2026  
**Website:** https://rapidlinkgh.com  

**Related implementation map:** `docs/current-content-to-model-map.md`  

**Business update, 9 November 2026:** See `docs/business-content-status.md`.
Forms/KYC materials and new board photographs/biographies/achievements are not
currently supplied; availability is being discussed. No current vacancies have
been reported, but the user explicitly instructed that existing board and
vacancy prototype displays stay unchanged. Annual reports and financial
statements are auditor-only and excluded from public publication; the earlier
proposal in section 6.16 is superseded. These updates are in this working
Markdown specification; the existing Word export predates them.

## 1. Purpose

This document defines the proposed content structures, ownership, approval controls, publishing workflow and security boundaries for the new RapidLink Microfinance website. It is intended to guide the restructuring of the current prototype into a maintainable, governed website that can support future growth into a broader banking-service platform.

The specification focuses on public website content. It does not authorise the content-management system (CMS) to store customer applications, complaint cases, account information, transactions, passwords or other sensitive customer records.

## 2. Delivery approach

The recommended approach is **rapid prototyping with controlled governance**. The existing website remains the working prototype, while content structures are introduced incrementally on the `cms-restructure` branch. The production branch remains `main` so that approved demonstrations and the live Render deployment are not affected by unfinished restructuring work.

The formal supervisor-facing version of this specification is maintained as a Microsoft Word document. This Markdown copy is the source-controlled working version used to track changes in Git.

## 3. Scope and guiding principles

The content model must:

- separate approved content from React components and page layout;
- provide one reusable content-access layer for the website;
- support draft, review, approval, publication and archiving;
- record who created, reviewed and approved sensitive content;
- ensure public users can read only published content;
- restrict content creation, editing, publication and removal to authorised staff;
- preserve a clear audit trail for regulated or customer-impacting information;
- use accessible headings, alternative text, plain language and mobile-friendly content;
- support future additions without requiring the page design to be rebuilt; and
- keep customer data and operational transactions outside the public CMS.

## 4. Proposed governance roles

The following roles are proposals and must be confirmed by RapidLink management before production use.

| Role | Proposed responsibility |
|---|---|
| Content Administrator | Maintains CMS users, content configuration and publishing access. This role does not automatically approve regulated content. |
| Marketing and Communications | Creates news, announcements, campaigns, newsletters, social content and gallery items. |
| Product Owner | Maintains factual product descriptions, eligibility, benefits, requirements and product calls to action. |
| Credit Department | Confirms loan eligibility, terms, pricing, fees and calculator inputs. |
| Finance/Treasury | Confirms savings, investment and fixed-deposit rates and related financial information. |
| Customer Service | Maintains public support guidance, frequently asked questions, branch information and complaint-channel details. |
| Human Resources | Maintains vacancies, employment details and approved staff profiles. |
| Company Secretariat | Maintains board, governance and institutional records. |
| Information Technology | Maintains technical access, integrations, security controls and service-status information. |
| Compliance/Legal | Approves regulatory wording, complaints guidance, privacy notices, security notices, pricing disclosures and other customer-impacting claims. |
| Executive Approver | Provides final approval for high-impact corporate, governance or reputational content when required. |

## 5. Shared fields for managed content

Unless a model explicitly excludes them, managed records should use the following shared fields.

| Field | Type | Required | Purpose |
|---|---|---:|---|
| `id` | UUID | Yes | Stable internal identifier. |
| `slug` | Text | Yes | Human-readable, unique URL segment. |
| `title` | Text | Yes | Public display title. |
| `summary` | Text | Usually | Short listing-card or search description. |
| `status` | Enum | Yes | `draft`, `in_review`, `approved`, `scheduled`, `published`, `archived`. |
| `is_published` | Boolean | Yes | Public visibility control; default `false`. |
| `publish_at` | Date/time | No | Scheduled publication time. |
| `unpublish_at` | Date/time | No | Optional automatic expiry time. |
| `created_by` | User ID | Yes | Author audit reference. |
| `reviewed_by` | User ID | No | Reviewer audit reference. |
| `approved_by` | User ID | No | Approver audit reference. |
| `created_at` | Date/time | Yes | Creation timestamp. |
| `updated_at` | Date/time | Yes | Most recent update timestamp. |
| `published_at` | Date/time | No | Actual publication timestamp. |
| `revision_note` | Text | No | Reason for the latest material change. |
| `seo_title` | Text | No | Search-result title where it differs from the page title. |
| `seo_description` | Text | No | Search-result summary. |
| `canonical_url` | URL | No | Preferred public URL when needed. |

All images should additionally record an asset URL, meaningful alternative text, caption where appropriate, source/credit, copyright permission status and focal position for responsive cropping.

## 6. Content models

### 6.1 Product

**Purpose:** Stores customer-facing information for savings, investment, loan and digital-service products.

**Proposed owner:** Relevant Product Owner  
**Proposed approver:** Department Head; Compliance approval required for regulated claims  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Product name | Text | Yes | Official approved name. |
| Product category | Enum | Yes | Savings, investment, loan, digital channel or other approved category. |
| Hero image and alt text | Asset/Text | Yes | Must match the product and RapidLink brand. |
| Overview | Rich text | Yes | Plain-language product explanation. |
| Benefits | List | Yes | Verifiable benefits only. |
| Eligibility | List | Yes | Customer qualification requirements. |
| Requirements/documents | List | Yes | Documents needed to proceed. |
| Key terms | Structured list | No | Tenor, limits, frequency or other confirmed terms. |
| Risks/important notes | Rich text | No | Customer-impacting cautions. |
| Primary action | Label/URL | Yes | Apply, contact, calculate or learn more. |
| Related rates/fees | Relations | No | Links to approved rate and fee records. |
| Related FAQs | Relations | No | Product-specific help. |

**Validation:** Unconfirmed prices, rates, eligibility or promises must not be published. Loan calculator values remain unchanged until Credit provides written confirmation.

### 6.2 Loan pricing and calculator configuration

**Purpose:** Stores approved loan pricing inputs separately from interface code so rates can be reviewed and updated safely.

**Proposed owner:** Credit Department  
**Proposed approver:** Head of Credit and Compliance  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Loan product | Relation | Yes | Links to the applicable loan product. |
| Rate type | Enum | Yes | Flat, reducing balance or another approved method. |
| Interest rate | Decimal | Yes | Must state the period and calculation basis. |
| Annual percentage rate | Decimal | Pending | Populate only when confirmed by Credit/Compliance. |
| Minimum/maximum principal | Currency | Yes | Approved borrowing range. |
| Minimum/maximum tenor | Number + unit | Yes | Approved repayment period. |
| Processing and other fees | Relations | No | Links to fee records. |
| Effective date | Date | Yes | Date pricing becomes valid. |
| Expiry/review date | Date | No | Review trigger. |
| Disclosure text | Rich text | Yes | Approved explanation and limitations. |
| Source document | Asset/reference | Yes | Internal approval evidence. |

**Important:** This model is a specification only. The current calculator must not be modified until its formula, rates and disclosures are formally approved.

### 6.3 Fees and charges

**Purpose:** Provides a controlled tariff source for product fees and charges.

**Proposed owner:** Finance with the relevant Product Owner  
**Proposed approver:** Finance Head and Compliance  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Fee name | Text | Yes | Customer-readable label. |
| Applicable product | Relation | Yes | Product or service affected. |
| Amount | Currency/Percentage | Yes | Exact approved charge. |
| Calculation basis | Text | Yes | Fixed, percentage, per transaction or another basis. |
| Frequency | Text | No | Once, monthly, per transaction, etc. |
| Conditions/exemptions | Rich text | No | Important qualifications. |
| Effective date | Date | Yes | Start date. |
| Expiry date | Date | No | End date where applicable. |
| Approval reference | Text/Asset | Yes | Evidence of approval. |

### 6.4 Savings, investment and fixed-deposit rate

**Purpose:** Publishes current rates with effective dates and clear conditions.

**Proposed owner:** Finance/Treasury  
**Proposed approver:** Finance Head and Compliance  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Product | Relation | Yes | Relevant savings or investment product. |
| Balance band | Currency range | No | Minimum and maximum balance. |
| Term | Number + unit | No | Applicable investment period. |
| Rate | Decimal | Yes | Clearly state annual/monthly basis. |
| Rate basis | Text | Yes | How the published rate is expressed. |
| Effective date | Date | Yes | Must appear to customers. |
| Conditions | Rich text | No | Withdrawal, rollover or eligibility conditions. |
| Approval reference | Text/Asset | Yes | Internal approved source. |

### 6.5 Complaints procedure

**Purpose:** Publishes how customers can submit, track and escalate complaints. It must not store individual complaint cases.

**Proposed owner:** Customer Service  
**Proposed approver:** Compliance/Legal  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Procedure title | Text | Yes | Customer-facing title. |
| Scope | Rich text | Yes | What the procedure covers. |
| Submission channels | Structured list | Yes | Phone, email, branch or approved form. |
| Information customers should provide | List | Yes | Avoid requesting unnecessary sensitive data. |
| Acknowledgement target | Duration | Pending | Confirm with Compliance. |
| Resolution target | Duration | Pending | Confirm with Compliance. |
| Escalation path | Ordered list | Yes | Internal and regulator escalation where approved. |
| Emergency/fraud guidance | Rich text | No | Direct urgent cases to the correct channel. |
| Effective/review date | Date | Yes | Governance control. |

### 6.6 Security or fraud notice

**Purpose:** Warns customers about scams, fraud, account safety or urgent security matters.

**Proposed owner:** Information Technology and Customer Service  
**Proposed approver:** Information Security lead and Compliance  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Severity | Enum | Yes | Advisory, warning or urgent. |
| Threat summary | Text | Yes | Clear non-technical description. |
| Who is affected | Text | Yes | Relevant customer group. |
| Actions customers should take | Ordered list | Yes | Safe, verified instructions. |
| Actions RapidLink will never request | List | No | E.g. passwords, PINs or one-time codes. |
| Official contact channel | Relation | Yes | Verified contact record. |
| Start/end time | Date/time | Yes/No | Notice lifecycle. |
| Source/reference | Text/Asset | Yes | Internal incident or regulator reference. |

### 6.7 News article

**Purpose:** Supports company news, customer notices, product news, service updates and community stories.

**Proposed owner:** Marketing and Communications  
**Proposed approver:** Communications lead; Compliance or department approval where content is regulated  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Category | Enum | Yes | Company News, Customer Notices, Product News, Service Updates or Community. |
| Publication date | Date | Yes | Customer-visible date. |
| Summary | Text | Yes | Listing and homepage excerpt. |
| Featured image and alt text | Asset/Text | Yes | Approved image upload. |
| Featured | Boolean | Yes | Homepage priority; default `false`. |
| Sections/body | Structured rich text | Yes | Headings and paragraphs. |
| External link and label | URL/Text | No | Opens in a new tab when outside the site. |
| Homepage visibility | Boolean | Yes | Controls homepage inclusion independently. |

### 6.8 Vacancy

**Purpose:** Supports current and future vacancies without rebuilding the careers page.

**Proposed owner:** Human Resources  
**Proposed approver:** Head of HR or delegated executive  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Job title | Text | Yes | Official position title. |
| Department | Text/Relation | Yes | Hiring department. |
| Location | Relation/Text | Yes | Branch or work location. |
| Employment type | Enum | Yes | Full-time, part-time, contract, internship, etc. |
| Summary | Text | Yes | Card description. |
| Responsibilities | List | Yes | Role duties. |
| Requirements | List | Yes | Minimum qualifications. |
| Application method | Structured field | Yes | Approved form, email or external recruitment system. |
| Opening/closing date | Date | Yes | Vacancy lifecycle. |
| Vacancy status | Enum | Yes | Open, closed or archived. |

### 6.9 Board member

**Purpose:** Publishes verified board membership and biographies.

**Proposed owner:** Company Secretariat  
**Proposed approver:** Board Chair or authorised executive, with Compliance review  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Full name | Text | Yes | Approved presentation. |
| Board role | Text | Yes | Chair or member. |
| Portrait and alt text | Asset/Text | Yes | Approved, consistently cropped image. |
| Short biography | Text | Yes | Card/modal excerpt. |
| Full biography | Rich text | Yes | Verified professional profile. |
| Qualifications | List | No | Approved credentials only. |
| Display order | Number | Yes | Controls page order. |
| Term/status | Text/Enum | No | Current, former or other approved status. |

### 6.10 Management member

**Purpose:** Provides a separate structure for executive and senior-management profiles.

**Proposed owner:** Human Resources  
**Proposed approver:** Chief Executive Officer  

Fields follow the Board Member model, replacing board role with management title and optionally adding functional responsibility. Board and management records must not be mixed unless management confirms the presentation.

### 6.11 Frequently asked question

**Purpose:** Provides reusable answers across the FAQ page and relevant product pages.

**Proposed owner:** Customer Service or relevant Product Owner  
**Proposed approver:** Department Head; Compliance for regulatory or pricing answers  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Question | Text | Yes | Written in customer language. |
| Answer | Rich text | Yes | Concise, approved response. |
| Category | Text/Enum | Yes | Product, application, support, security, etc. |
| Related products/pages | Relations | No | Reuse without duplication. |
| Display order | Number | Yes | Category order. |
| Review date | Date | Yes | Prevents outdated answers. |

### 6.12 Announcement

**Purpose:** Controls the non-clickable scrolling announcement banner and other short notices.

**Proposed owner:** Marketing and Communications or Customer Service  
**Proposed approver:** Relevant Department Head; Compliance for regulated notices  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Message | Text | Yes | Short enough to read at accessible animation speed. |
| Priority | Number/Enum | Yes | Determines order. |
| Audience | Text/Enum | No | All customers or an approved segment. |
| Start/end time | Date/time | Yes | Automatic lifecycle. |
| Active | Boolean | Yes | Immediate visibility control. |

Announcements must remain non-clickable unless management explicitly approves a future change.

### 6.13 Branch or office location

**Purpose:** Powers the contact page, maps and future ATM/branch locator.

**Proposed owner:** Operations/Customer Service  
**Proposed approver:** Operations Head  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Branch name | Text | Yes | Official name. |
| Address | Structured address | Yes | Verified physical address. |
| Latitude/longitude | Decimal | Yes | Accurate map marker. |
| Telephone/email | Structured contact | Yes | Official channels. |
| Opening hours | Structured schedule | Yes | Include exceptions where needed. |
| Directions link | URL | Yes | Opens map service in a new tab. |
| Services available | List | No | Customer planning information. |
| Accessibility notes | Text | No | Physical access information. |
| Status | Enum | Yes | Open, temporarily closed or permanently closed. |

### 6.14 Gallery item

**Purpose:** Presents approved company achievements, events, sponsorships and organisational photographs.

**Proposed owner:** Marketing and Communications  
**Proposed approver:** Communications lead and relevant event owner  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Image/video asset | Asset | Yes | Optimised approved media. |
| Title | Text | Yes | Descriptive label. |
| Alt text | Text | Yes | Accessibility requirement. |
| Caption | Text | Yes | Identifies activity without exposing unnecessary personal data. |
| Event date | Date | No | When the activity occurred. |
| Category/album | Text/Relation | Yes | Groups related items. |
| Consent/rights confirmed | Boolean | Yes | Required before publication. |
| Photographer/source credit | Text | No | Rights attribution. |

### 6.15 Downloadable document or form

**Purpose:** Manages approved PDFs and forms that customers can view before downloading.

**Proposed owner:** Department that owns the document  
**Proposed approver:** Department Head and Compliance where regulated  

| Field | Type | Required | Notes |
|---|---|---:|---|
| Document title | Text | Yes | Customer-readable name. |
| Document type | Enum | Yes | Form, guide, tariff, policy, report, etc. |
| File | Asset | Yes | Approved PDF or permitted format. |
| File size/version | Metadata | Yes | Display and audit information. |
| Description | Text | Yes | Explains purpose. |
| Effective date | Date | Yes | Validity control. |
| Expiry/review date | Date | No | Prevents stale documents. |
| Related product/page | Relations | No | Contextual placement. |
| View before download | Boolean | Yes | Default `true` for supported PDFs. |

### 6.16 Annual report or financial statement

**Excluded from the public content scope.** On 9 November 2026, the user
confirmed that annual reports and financial statements will not be published;
only auditors may view them. Do not create public document records, links,
assets, pages or build snapshots for these materials. This decision does not
authorise an auditor portal or other private document-management feature.

### 6.17 Service-status notice

**Purpose:** Provides clear information about planned maintenance, service disruption and restoration.

**Proposed owner:** Information Technology/Operations  
**Proposed approver:** IT/Operations lead; Communications review for major public notices  

Fields include affected service, status (`planned`, `degraded`, `unavailable`, `restored`), impact, start time, expected restoration time, customer guidance, update history and final resolution time.

### 6.18 General page and legal policy

**Purpose:** Supports institutional profile, governance, privacy, terms, accessibility and other managed pages.

**Proposed owner:** Relevant business department  
**Proposed approver:** Executive management; Compliance/Legal for legal and regulatory pages  

Fields include page title, page type, hero media, introduction, ordered content sections, related links, effective date, review date, document version and approval reference.

## 7. Approval matrix

| Content type | Draft owner | Required reviewer/approver before publication |
|---|---|---|
| Product information | Product Owner | Department Head; Compliance for regulated claims |
| Loan pricing/calculator inputs | Credit | Head of Credit and Compliance |
| Fees and charges | Finance/Product Owner | Finance Head and Compliance |
| Savings/investment rates | Finance/Treasury | Finance Head and Compliance |
| Complaints procedure | Customer Service | Compliance/Legal |
| Security/fraud notice | IT/Customer Service | Information Security and Compliance |
| News and announcements | Marketing/Communications | Communications lead; subject owner as needed |
| Vacancy | Human Resources | Head of HR/delegated executive |
| Board/governance profile | Company Secretariat | Board Chair/delegated executive and Compliance |
| Management profile | Human Resources | Chief Executive Officer |
| FAQ | Customer Service/Product Owner | Department Head; Compliance where needed |
| Branch details | Operations/Customer Service | Operations Head |
| Gallery/media | Marketing/Communications | Communications lead and event owner |
| Download/report | Owning department | Department Head; Compliance where applicable |
| Service status | IT/Operations | IT/Operations lead |

## 8. Publishing workflow

1. **Draft:** An authorised owner creates or edits the record. It is not public.
2. **Internal review:** The subject-matter owner verifies facts, dates, links, images and customer instructions.
3. **Compliance review:** Required for rates, fees, complaints, security, legal, regulatory and customer-impacting disclosures.
4. **Approval:** The designated approver records approval in the CMS.
5. **Schedule or publish:** An authorised publisher sets the publication and optional expiry time.
6. **Public verification:** The publisher checks desktop/mobile layout, links, accessibility and the live public result.
7. **Review or archive:** Time-sensitive records are reviewed by their due date and archived or replaced when no longer valid.

Authors should not approve their own regulated content. Emergency security or service notices may use an expedited process, but the reason and approver must still be recorded.

## 9. Security and privacy boundaries

The CMS may store public website content and non-sensitive publishing metadata only. The following must be handled by separate, secured systems or integrations:

- loan or account applications;
- customer complaint submissions and case history;
- newsletter subscription data;
- customer identity documents;
- account balances and transactions;
- payment information;
- passwords, PINs and one-time codes;
- internal credit decisions; and
- confidential board, staff or operational records.

Supabase Row Level Security must remain enabled. Anonymous users may read only published records. Approved content administrators may create and edit records according to their role. Deletion should normally be a controlled archive/unpublish action; permanent deletion should be restricted and audited.

## 10. Implementation implications

The website should move towards a single content service that retrieves content from Supabase and supplies it to the homepage, news, careers and product pages. During migration, local content may be retained only as an explicitly controlled fallback. Once database records are verified, duplicate static data should be removed to prevent conflicting versions.

Recommended implementation sequence:

1. confirm owners, approvers and pending regulatory values;
2. approve this model specification;
3. map existing static content to the models;
4. extend the Supabase schema and Row Level Security policies;
5. add role-based CMS forms and approval states;
6. introduce one content-access layer in the React application;
7. migrate and verify current website content;
8. conduct accessibility, security and cross-device testing; and
9. merge approved work into `main` for production deployment.

## 11. Items awaiting confirmation

| Item | Required confirmation |
|---|---|
| Loan formula, interest rates, APR and calculator disclosures | Credit and Compliance |
| Full fees and charges schedule | Finance and Compliance |
| Fixed-deposit and investment rates | Finance/Treasury and Compliance |
| Complaint acknowledgement, resolution and escalation timelines | Customer Service and Compliance |
| Deposit protection and licensing wording | Compliance/Legal |
| Privacy, terms, cookie and accessibility statements | Compliance/Legal |
| Final content owners and approval authority | Executive management |
| Official branch details, coordinates and opening hours | Operations |
| Board and management biographies/images | Company Secretariat, HR and individuals concerned |
| Newsletter, complaints, application and future account-service integrations | IT, business owner, Compliance and selected service providers |

## 12. Immediate work possible before missing information arrives

The team can safely complete the content inventory, model-to-page mapping, reusable CMS form design, role and permission design, media validation, accessibility structure, archive/unpublish workflow, URL conventions and content-access-layer architecture. Fields that depend on unconfirmed rates, timelines or regulatory wording should remain marked **Pending** and must not be guessed or published.

## 13. Acceptance criteria

This specification is ready for implementation when:

- management confirms the proposed owners and approvers;
- Compliance identifies all content types requiring mandatory approval;
- each current public page is mapped to an approved model;
- required fields and validation rules are accepted by the relevant department;
- the CMS/public-data boundary is accepted by IT and Compliance; and
- unresolved regulatory or pricing values are recorded as dependencies rather than assumptions.

---

**Prepared by:** Caleb Adom Awuah  
**Review requested from:** Edmund Nii Odoi Akogyeram, IT Officer  
**Document status:** Draft for review and departmental confirmation
