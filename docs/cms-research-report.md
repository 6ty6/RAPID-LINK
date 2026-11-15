# RapidLink website: CMS research and evaluation report

**Prepared for:** Caleb Adom Awuah and Edmund Nii Odoi Akogyeram  
**Research date:** 10 November 2026, Africa/Accra  
**Status:** Sourced desk research; product trials, quotations and final selection pending  
**Review deadline:** Friday, 13 November 2026

## 1. Executive recommendation

Evaluate **Directus and Sanity first**, with **Strapi** retained as the self-hosted alternative. Directus is the closest architectural match when retaining SQL content is the priority. Sanity is the initial alternative when reducing backend operations is more important. Neither is an approved purchase: mandatory audit retention, departmental permissions, SSO, licence eligibility and editor count may change the appropriate plan or recommendation.

Contentful is a credible managed option if management accepts its higher entry cost for richer collaboration. Decap is a useful low-software-cost option for developer-assisted publishing, but repository access and approval controls deserve particular scrutiny. This ranking is a project-fit judgment, not a measured usability score or a claim that one vendor is universally safer.

The existing website need not be rebuilt in another framework. A selected CMS can feed our stable content-access layer, followed by the pre-rendering build and Render deployment. The deciding evidence should be whether an ordinary writer is actually prevented from publishing, whether approvers can review and recover changes, and whether the total operating cost is affordable.

## 2. RapidLink requirements and boundaries

The application is React/Vite, with structured local records, a public content-access layer, Supabase news/vacancy reads, pre-rendered public pages and Render hosting. The confirmed production domain is rapidlinkgh.com. AWS is a possible future hosting direction, not an authorised migration. Existing local and hosted content-security results are not automatically transferable to a new CMS permission model.

Suitable public content includes approved news, FAQs, descriptive product copy, branches, contacts, digital-channel information, page metadata and future approved documents. No new forms/KYC files, board-profile materials or current vacancies have been supplied. Existing board and vacancy prototype displays remain unchanged by explicit instruction. Annual reports and financial statements are auditor-only and excluded from the public website, CMS, asset storage and build snapshots. Customer applications, identity files, complaints, subscriber records, balances and transactions are also excluded.

Calculator pricing remains on hold. Research does not authorise new custom admin editors, schema changes to the live project, a CMS purchase or a production integration.

The business must confirm the number of staff accounts, who writes/reviews/publishes, any required separation between departments, whether two approvals or SSO are compulsory, and the retention/recovery requirements. These are selection inputs, not details to decide after purchasing.

## 3. Five approaches compared

| Candidate | Approach | Main RapidLink advantage | Main selection risk |
|---|---|---|---|
| Directus | Administration/API layer over SQL; self-hosted or cloud | Potential reuse of public SQL content | Permissions, audit coverage and licence/seat costs |
| Strapi | Separate self-hosted headless CMS; cloud hosting optional | Infrastructure and model control | Operations burden; premium workflow/audit features |
| Sanity | Hosted Content Lake with customisable Studio | Lower backend maintenance and editorial flexibility | Enterprise gates for custom access, full audit and some recovery features |
| Contentful | Hosted content platform | Managed editorial platform | Plan/Space costs and governance entitlements |
| Decap CMS | Git-backed editor | Portable content and version-controlled publishing | Git access, authentication and approval ergonomics |

The advantages/risks in this table are analytical judgments. Product facts and current plan boundaries are sourced below. No candidate has been connected to the live project or tested by staff for this report.

### 3.1 Directus

**How it would manage this site.** Editors would use a dashboard over mapped public-content collections, rather than editing React files. Directus documents introspection of an existing SQL database. For RapidLink this makes reuse plausible, but it does not certify compatibility with our Supabase Auth schema, triggers or existing RLS. Test a separate synthetic database and least-privilege database account before proposing a live connection. [D1](https://directus.com/features/existing-database)

**Editorial governance.** Content versioning provides separate working versions; publishing permissions and review transitions must be designed and tested against the selected version and plan. Versioning is not proof of enforced independent approval. [D2](https://directus.com/docs/guides/content/content-versioning)

**Accountability.** Directus states that direct database changes do not appear in its activity feed. Keeping the current Supabase editor as a parallel writer could therefore leave a gap. Our recommendation is one ordinary editorial write path, with any exceptional SQL maintenance governed separately. The latter is an architectural recommendation, not an automatically supplied product guarantee. [D3](https://directus.com/docs/guides/auth/accountability)

**Free/paid.** Free self-hosted Core exists under MSCL; this is not the same licence proposition as Strapi's MIT Community edition. Self-hosting also requires infrastructure and operational skills. [D4](https://directus.com/docs/self-hosting/overview) Current limits include 3 seats/25 collections/5 flows. The wider free grant requires revenue below $5 million and fewer than 50 employees; eligibility is unverified. Team software is $599/month, or $499/month annually committed; cloud adds $99/month or $89/month annually billed. Core has no SSO; Team includes it. Confirm licence scope and entitlements in writing. [D5](https://directus.com/pricing)

**Pros:** SQL alignment, configurable structured editing, self-hosting choice and a potential AWS path. **Cons:** permission integration needs care; software cost rises substantially outside limited Core/grant use; independent DB changes need separate audit arrangements. These are project-specific conclusions from the above.

**Operations/exit.** For self-hosting, IT must budget application compute, database, files, email, monitoring and backups. A Render static site cannot itself run the Directus server. AWS could later host the application, database and assets; that would still require an explicit migration plan. Back up application/configuration and system metadata as well as ordinary content; rehearse restoration with permissions intact. Data location follows the chosen hosting/storage providers; a cloud contract must specify it.

**Personally test:** writer publish denial, draft isolation, reviewed version publication, department restrictions, history, an exceptional direct-SQL change in a disposable database, and complete restore. The key decision is whether acceptable governance fits the licence RapidLink can buy.

### 3.2 Strapi

**How it would manage this site.** Define a separate set of content types and map Strapi responses into our content-access contracts. Treat this as a content migration, not as a promise to attach an editor to current tables. Editors use the admin panel for content and media; the public React website remains on Render.

**Free/paid.** MIT Community includes RBAC and APIs. Growth costs $45/month for 3 users, with $15/month for each additional user, and adds content history, releases and live preview. SSO is a paid add-on; formal Review Workflows and Audit Logs require Enterprise. The current pricing table lists 14-day Growth history retention; confirm the purchased entitlement rather than relying on older descriptions. [T1](https://strapi.io/pricing-cms)

**Approval and audit.** Enterprise Review Workflows can specify stages and a stage required for publication. Audit Logs are an Enterprise feature. Ordinary RBAC plus a draft status is not equivalent to a multi-stage approval process. [T2](https://docs.strapi.io/cms/features/review-workflows), [T3](https://docs.strapi.io/cms/features/audit-logs)

**Hosting costs are separate.** Strapi Cloud currently lists Starter at $35/month and Pro at $90/month; Pro lists weekly and manual backups. These are hosting subscriptions, not CMS feature licences. [T4](https://strapi.io/pricing-cloud), [T5](https://support.strapi.io/articles/3581379360-understanding-strapi-cloud-usage-and-billing)

**Pros:** open-source base, developer control, explicit enterprise workflow option and a practical self-hosting route. **Cons:** another backend to operate; licence plus hosting can both be payable; premium governance can change the budget considerably. These are our assessments.

**Operations/exit.** Self-hosting would need a web service, persistent database, media storage, mail, monitoring and patching; AWS deployment is possible as an infrastructure design, not a move already approved. Test exports and imports including assets and relations. Strapi's export documentation defines what the data-export tool carries; it is not a substitute for checking configuration, identities and an actual recovery procedure. [T6](https://docs.strapi.io/cms/features/data-management/export)

**Personally test:** editing ease; author/publisher restrictions; exact purchased workflow and history behavior; media links after recovery; webhook publication; and a patch upgrade in a disposable instance. If Enterprise is needed, obtain its quotation before ranking Strapi as cheap.

### 3.3 Sanity

**How it would manage this site.** Studio would provide the staff interface, while Content Lake becomes the content backend. A new adapter would transform its records into our existing public shapes. It would not reuse Supabase as the content database. Hosting Studio or the public frontend on AWS later would not move Content Lake into RapidLink's AWS account.

**Free/paid.** Free includes up to 20 seats but only Administrator/Viewer roles and public datasets. Growth is $15 per paid seat/month, supports 5 predefined roles, private/public datasets, comments and tasks. SAML SSO, custom roles/access and full audit capabilities require Enterprise entitlements; Growth's draft-change/activity history is not the same as a full audit log. [S1](https://www.sanity.io/pricing)

**Approval.** The Contributor role can create/edit without publishing. This makes simple writer/publisher separation worth testing. It does not prove department-specific restrictions, two-person approval, or prevention of self-approval under all role combinations; those requirements may need Enterprise or a different design. [S2](https://www.sanity.io/docs/content-lake/roles-concepts)

**Pros:** managed backend, adaptable editor, lower infrastructure workload. **Cons:** separate vendor datastore, recurring seats, richer governance feature gates and an exit transformation effort. These are our project-fit judgments.

**Backups/exit.** Sanity's documented managed backup feature is available on certain Enterprise plans. Do not assume Growth includes customer-triggered point-in-time recovery. Lower-tier planning should include scheduled exports, asset coverage, protected storage and a tested import/recovery process. [S3](https://www.sanity.io/docs/content-lake/backups), [S4](https://www.sanity.io/docs/content-lake/exporting-data)

**Data location.** Sanity's security page currently describes backend operation across three data centres in Belgium, with globally distributed frontend systems. Confirm the complete contract, asset/CDN locations, subprocessors and allowed cross-border processing with Compliance; this is not Ghana-only hosting. [S5](https://www.sanity.io/security)

**Personally test:** Contributor restrictions through the API as well as the UI, reviewer usability, actual plan-level history, draft preview, publish/unpublish rebuilding, and restoring a complete export. Ask sales to demonstrate any Enterprise feature that is a firm business requirement.

### 3.4 Contentful

**How it would manage this site.** Staff would edit structured entries and assets in a managed platform. Our adapter would read published content into the build; draft preview needs a separate authorised path. Supabase would not remain the source of those migrated content records.

**Free/paid.** Free provides 10 users and 2 roles. Lite is $300/month with 20 users/3 roles, collaboration and scheduled publishing. The additional Lite Space with up to five workflows is $850/month extra. Enterprise includes custom commercial/governance options. Do not interpret the $300 base fee as a quotation for every workflow, SSO or audit requirement. [C1](https://www.contentful.com/pricing/)

**Governance.** Map each business responsibility to actual role permissions, workflow restrictions and audit export capabilities in the quoted package. Enterprise positioning includes SSO, custom access and audit facilities; request written retention and delivery entitlements. [C2](https://www.contentful.com/enterprise/), [C3](https://www.contentful.com/developers/docs/tutorials/general/audit-logs/)

**Pros:** managed infrastructure and a substantial editorial platform. **Cons:** relatively high baseline paid cost; plan/Space packaging needs scrutiny; vendor-specific content models still require mapping on exit. These are our assessments.

**Location/recovery.** Contentful documents AWS US regions by default and EU residency alternatives. It also distinguishes platform disaster-recovery backups from customer-level restoration of deleted content. An AWS-hosted vendor platform is not infrastructure controlled by RapidLink's AWS account. Confirm contracted residency, recovery scope and region availability. [C4](https://www.contentful.com/help/faq/backup-security-and-hosting/)

**Exit.** Plan exports for content, assets and schema, and rebuild platform-specific configurations separately where necessary. Contentful lists export categories and exclusions; authentication secrets and some service configuration are not a portable substitute for a new identity setup. [C5](https://www.contentful.com/help/admin/data-export/)

**Personally test:** author-only behavior, required workflow stage, preview accuracy, deleted-content recovery and a representative export/import. Ask a nontechnical editor whether entry references are understandable without developer assistance.

### 3.5 Decap CMS

**How it would manage this site.** A browser editor would save structured content into Git rather than a content database. Approved merges could trigger the existing Render build. Our current JavaScript records would first need conversion into suitable editable data files; retain the public access contracts during that conversion. The core editor is open source and Git-based. [G1](https://decapcms.org/docs/)

**Workflow.** Editorial workflow with the GitHub backend creates pull requests for unpublished entries. Review enforcement must come from repository rules and permissions, not merely a visible workflow column. [G2](https://decapcms.org/docs/editorial-workflows/)

**Identity.** The normal GitHub backend requires editors to have push access and an authentication arrangement; Decap documents hosted authentication alternatives. Do not expose project code or confidential files to staff merely to make content editing convenient. Evaluate a separate content repository if appropriate. [G3](https://decapcms.org/docs/github-backend/)

**Free/paid.** Core software is free. Authentication, Git-provider subscriptions, asset hosting, support and builds may cost money. Private-repository branch protection depends on the GitHub plan; confirm it for the actual organisation. [G4](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

**Pros:** portable files, Git diffs, developer-familiar rollback and a direct build workflow. **Cons:** permissions/merges can be confusing to editors; complex relations and governance may need more developer support; Git history is not a complete staff-login/security audit. These are our assessments.

**Operations/exit.** Back up repositories and any external asset store, protect authentication secrets, maintain editor dependencies and verify restore/deploy from a clean checkout. Git portability helps only if assets, schemas and build instructions are also retained. The GitHub backend documents an LFS limitation, so large-file storage must be checked rather than assumed. [G3](https://decapcms.org/docs/github-backend/)

**Personally test:** edit/review without Git expertise, block direct publication and code changes, remove access, revert an approved edit, recover files/assets and observe the deployment build. It is strongest if developer-assisted publication is acceptable.

## 4. Cross-cutting operating and governance comparison

| Area | Directus | Strapi | Sanity | Contentful | Decap |
|---|---|---|---|---|---|
| Existing Supabase content | SQL reuse candidate; isolated permission test needed | Model/migration project | Migrate to Content Lake | Migrate to platform entries | Convert to Git data files |
| Proposed approval design | Permissions + versions/transitions; demonstrate enforcement | RBAC; formal stages on Enterprise | Contributor/publisher for simple flow; custom access may need Enterprise | Match roles/workflows to quoted plan/Space | PR reviews + protected branch rules |
| Accountability issue to verify | DB writes outside Directus are absent from activity feed | Paid audit/history entitlement | Activity/history vs full audit distinction | Audit delivery/retention and plan | Commits vs full identity/access audit |
| Infrastructure owner | IT if self-hosted; vendor for cloud infrastructure | IT if self-hosted; optional cloud | Vendor backend; IT integration | Vendor backend; IT integration | Git/auth/hosting providers plus IT |
| AWS direction | Self-host candidate | Self-host candidate | Frontend/Studio can move; datastore stays vendor-managed | Frontend can move; platform stays vendor-managed | Static build/auth placement can change; Git remains source |
| Portability test | Content + system config + assets restore | Export/import plus config/identity checks | Dataset + assets + schema conversion | Content/assets export and configuration recreation | Repo + external assets + working build |

All five need a tested public-only read path and a publish/unpublish rebuild strategy. No CMS removes the need for owners and Compliance approval. Record whether a control is observed, documented, commercially quoted or still unverified; these evidence types are not interchangeable.

### Security and maintenance desk review

This is a limited primary-source review, not a penetration test, complete incident history or certification of a version. Advisory counts cannot fairly rank products: disclosure practices and product scope differ. Before a trial, pin a currently supported release and check all applicable advisories, extensions and deployment dependencies.

- **Directus:** a published high-severity CSV-import advisory, GHSA-32cw-mf7w-gpqr, identifies versions before 12.5.0 as affected and 12.5.0 as patched. This is an example patch requirement, not a claim that 12.5.0 is the latest or sufficient release today. Restrict import privileges and verify the chosen version against the complete advisory list. [D6](https://github.com/directus/directus/security/advisories/GHSA-32cw-mf7w-gpqr), [D7](https://github.com/directus/directus/security/advisories)
- **Strapi:** GHSA-rjg2-95x7-8qmx describes a relational-filter information-disclosure issue and directs upgrades to at least 5.37.0. Treat that as one historical minimum fix and check all later advisories before deployment. [T7](https://github.com/strapi/strapi/security/advisories/GHSA-rjg2-95x7-8qmx), [T8](https://github.com/strapi/strapi/security/advisories)
- **Sanity:** the vendor publishes security information and a disclosure programme. These establish an assurance/review channel, not proof of an incident-free history. Request appropriate current assurance reports and check the Studio/plugins and account controls we would operate. [S5](https://www.sanity.io/security), [S6](https://www.sanity.io/responsible-disclosure)
- **Contentful:** its security page points customers to current assurance documentation. Review the actual reports, contract, notification commitments and API-token controls rather than inferring safety from a marketing badge. [C6](https://www.contentful.com/security/)
- **Decap:** the published maintenance update dated 4 November, updated 5 November 2026, reports ongoing releases and security work. The repository security policy identifies supported versions. Evaluate editor updates and authentication dependencies as well as repository rules. [G5](https://decapcms.org/state-of-decap/), [G6](https://github.com/decaporg/decap-cms/security)

IT must assign a maintainer, a patch-review cadence, alert ownership, backup responsibility and a recovery exercise. For SaaS, the vendor patches its backend while RapidLink still maintains its Studio/customisation, adapter, build credentials and published website. For self-hosting, infrastructure security and application upgrades are added responsibilities.

## 5. Three-year cost research

All figures are USD subscription arithmetic checked 10 November 2026, not final quotations. Five paid staff accounts are assumed unless a row says otherwise. The examples do not buy equivalent governance capabilities. All exclude tax, currency conversion, increases, implementation, training, site hosting and unlisted services; hosting is included only where explicitly named.

| Scenario | Calculation | 36-month subscription subtotal | Important limitation |
|---|---|---:|---|
| Directus Core self-hosted | Free Core software | $0 | Only 3 seats; not the five-user baseline; infrastructure extra |
| Directus Team self-hosted, monthly billing | $599 × 36 | $21,564 | Infrastructure extra; includes 10 seats |
| Directus Team Cloud, monthly billing | ($599 + $99) × 36 | $25,128 | Confirm exact hosted limits/support |
| Directus Team self-hosted, annual commitment | $499 × 36 | $17,964 | Annual commitment, infrastructure extra |
| Strapi Community self-hosted | Free software | $0 | Infrastructure extra; not an Enterprise workflow/audit package |
| Strapi Growth, five users, self-hosted | ($45 + 2 × $15) × 36 | $2,700 | Hosting, Enterprise controls and SSO extra |
| Strapi Growth, five users + Cloud Pro | ($75 + $90) × 36 | $5,940 | Still not Enterprise workflow/audit pricing |
| Sanity Growth, five paid seats | 5 × $15 × 36 | $2,700 | Usage/export storage and Enterprise controls extra |
| Contentful Lite base | $300 × 36 | $10,800 | Does not include the additional Lite Space |
| Contentful Lite plus additional Lite Space | ($300 + $850) × 36 | $41,400 | Confirm workflow and governance requirements still fit |
| Decap core software | Free software | $0 | Git/auth/media/build/support costs extra |

Licence and hosting inputs: [Directus](https://directus.com/pricing), [Directus Core](https://directus.com/docs/self-hosting/overview), [Strapi CMS](https://strapi.io/pricing-cms), [Strapi Cloud](https://strapi.io/pricing-cloud), [Sanity](https://www.sanity.io/pricing), [Contentful](https://www.contentful.com/pricing/), [Decap](https://decapcms.org/docs/).

The Directus grant could change the cost materially, but it must not be budgeted as awarded. Enterprise figures for any vendor are **quotation required**, not zero. Do not convert to Ghana cedis until management provides an appropriate dated budget exchange rate.

**Complete cost formula:** one-time discovery/model setup + migration + training + 36 × (CMS licence + compute/database + assets/bandwidth + backups + monitoring + authentication/Git + maintenance/support) + expected usage growth + tax. Separate the existing website's costs from additional CMS costs so existing expenses are not double-counted. The accompanying cost worksheet leaves unquoted amounts blank; a blank is not a zero.

Request quotations using one identical brief: five staff initially, specified author/reviewer/publisher boundaries, required SSO/department rules, audit retention, content/media volumes, preview environments, uptime/support, backup frequency and recovery targets. Ask how adding the sixth user or changing plans affects the bill.

## 6. Integration plan after approval

1. Confirm ownership, legal/public boundaries, identity requirements and budget. Choose a candidate for a disposable demonstration; a demo is not approval to migrate production.
2. Define synthetic models matching the existing public records. Implement only a trial adapter outside the production path, with a separate account/database/repository.
3. Prove public reads cannot retrieve drafts, hidden fields or write content. CMS permissions and existing Supabase RLS must each be evaluated where their routes remain reachable.
4. Configure writer/reviewer/publisher privileges. Enforce restrictions in the backend or protected repository, not merely by hiding a button.
5. Generate an authorised preview from draft content, without making draft assets public through an unrestricted URL. Protect any preview token; never place it in browser-exposed build variables.
6. After publication or withdrawal, trigger a preview rebuild using a protected server-side hook. Verify success before promoting a deployment. Notify a named operator if a content read or build fails.
7. Verify article text, structured fields, relations, metadata, sitemap, missing-page status and assets in generated output. Check removing a document also removes its public link after rebuilding.
8. Demonstrate backup/restore and export. Plan cutover, rollback and removal of duplicate editorial write paths. Retain the ability to restore the previous deployment/configuration.

The above is a proposed design, not completed integration. The current build intentionally fails on unavailable configured content; a future adapter should preserve that behavior. Static HTML can retain withdrawn content until rebuilt, so unpublish/rebuild monitoring is a necessary acceptance test.

## 7. What Caleb must test personally

Read all five summaries; perform hands-on work on a limited shortlist. First observe one nontechnical colleague, then repeat permission tests yourself. The test matrix and cost worksheet are separate editable CSV files. Every test starts **NOT RUN**; this report records no CMS trial passes.

Use synthetic news, a sample image and a dummy FAQ/document, three separate test accounts (writer, approver, administrator), a disposable public-read client and an isolated preview build. Never use real employee passwords, customer data, confidential reports or the production database. Note the CMS version, hosting region, plan/trial and identity setup in every evidence record.

### Personal test script and acceptance criteria

1. **Basic editing:** ask a colleague to draft a title, summary, body, category and image description without developer intervention. Record completion time, errors and assistance; do not invent a usability score before observing them.
2. **Validation:** omit a required field and supply an invalid slug/file. Confirm clear messages and that invalid data cannot be published through a direct API request.
3. **Invitation/access:** invite only a test account, check its assigned role, remove access and try a fresh login and an existing session/token. Record actual revocation behavior and delays.
4. **Draft isolation:** request the draft anonymously through all delivery paths being proposed. Expect no draft text, hidden fields or unrestricted draft asset exposure. A hidden list item alone is not sufficient evidence.
5. **Writer publication denial:** attempt publication in the UI and through the underlying API or Git path. Expect server/repository enforcement. Retain the response/status without credentials.
6. **Approval integrity:** use the approver to approve/publish. If the business requires independent or multiple approvals, try self-approval and stage skipping. A label saying approved is not enforcement.
7. **Department boundaries:** try editing another department's synthetic record. Expect the defined restriction. Mark this test not applicable only if management explicitly accepts shared editing rights.
8. **Live-content safety:** edit an already published item as a draft. The approved public version must remain unchanged until the permitted publication step.
9. **Preview:** verify text, media, links and metadata in desktop/mobile preview. Confirm unauthorised users cannot view restricted previews. Check which features stop working when the trial premium entitlement ends.
10. **History/audit:** change, publish and unpublish a record; find who did each action and when. Inspect previous values, export options, retention and who can alter/delete logs. Distinguish content history from account-security events.
11. **Recovery:** delete or corrupt a synthetic item, then restore it with its media and relations in a clean test environment. Record recovery duration and missing configuration. Do not equate a downloaded export with a successful restore.
12. **Publish/rebuild:** publish and withdraw a sample story/document. Verify generated HTML, links, sitemap and public API after the successful build. Record the period during which old static content remains available.
13. **Failure handling:** make a test source unavailable or revoke a test build credential. Expect a failed build and a visible operator alert, not a successful deployment of old fallback content.
14. **Security/maintenance:** record selected version, applicable advisories, backup schedule, maintainer and a trial upgrade/rollback. SaaS operators should demonstrate available customer controls rather than make unsupported backend claims.
15. **Exit and billing:** export the whole sample, verify assets/configuration limits, and price the plan required by the tests. Record any requirement that needs Enterprise or an external service.

Retain screenshots/screen recordings and sanitized request results in the test matrix. Use PASS, FAIL, NOT RUN or NOT APPLICABLE with a reason. A failure of a mandatory control blocks selection until a mitigation is proved; it should not be hidden inside an overall average score.

## 8. Questions Caleb must obtain answers to

**Management/Compliance:** how many staff, which departments, who has final publishing authority, whether writers may approve their own work, required SSO/MFA, audit retention, permitted hosting regions, maximum three-year budget and final approver.

**IT:** who owns the CMS/service account, application patching, backups, restore drills, monitoring, email, DNS, build hooks and incident response; acceptable recovery-point/recovery-time targets; and whether external content hosting or retaining Postgres is preferred.

**Vendors:** written feature/seat quotation and licence eligibility; plan-level publishing restrictions and audit retention; data/asset/backup regions and subprocessors; recovery responsibility; contract termination/export limitations; support SLA; overages and renewal increases. Ask for a demonstration using the exact quoted plan.

Technical reading, cost arithmetic and drafting can be assisted. Caleb's irreplaceable contribution is observing actual editor usability, testing the configured permissions, confirming organisational ownership and obtaining written business/vendor answers.

## 9. Decision and delivery gates

**Gate 1 — requirements:** management confirms mandatory controls and budget. **Gate 2 — evidence:** shortlisted products pass applicable tests and the restore exercise. **Gate 3 — commercial/security:** quotations, residency, maintenance owner and advisory review are accepted. **Gate 4 — decision:** Edmund/management review the recommendation and migration risks.

A weighted comparison can follow mandatory-control checks: governance 30%, editor usability 20%, fit/portability 20%, operations/security 15% and three-year cost 15%. These are proposed weights for approval, not vendor scores. Do not score untested features as passed.

The provisional recommendation remains Directus for SQL continuity or Sanity for lower backend operations, with Strapi preferred over either if its tested paid/self-hosted governance and operational ownership better satisfy the confirmed requirements. Contentful and Decap remain useful comparators. If mandatory full audit, departmental separation or SSO needs an Enterprise plan, obtain that price before choosing a cheaper-looking baseline.

This full report supports the two-to-three-page management submission due 13 November. It does not replace product trials, contractual advice, hosted security verification or management approval. No CMS has been selected, purchased or deployed by this research.
