# RapidLink CMS comparison: management summary

**Prepared:** 10 November 2026 · **Review due:** 13 November 2026  
**Author:** Caleb Adom Awuah with research assistance  
**Status:** Desk-research draft; no product trial or purchase approved

## 1. Scope and recommendation

The CMS should manage approved public content while the React/Vite website stays on Render. Our existing content-access layer and pre-rendering build can receive a new adapter. Customer applications, complaints, identities, transactions and auditor-only financial reports remain outside public content. Calculator changes and new custom admin development remain paused.

Shortlist **Directus and Sanity for test-data evaluation**. Directus is the SQL-continuity candidate; Sanity is the managed-backend candidate. Keep Strapi as the self-hosted alternative. The final choice depends on enforced approvals, staff usability, SSO, audit retention and full operating cost. No recommendation below is a claim of completed testing.

| Option | How it helps RapidLink | Principal trade-off |
|---|---|---|
| Directus | Dashboard/API over SQL; potential reuse of existing public tables | Validate Supabase permissions; direct SQL edits bypass its activity feed; licence limits matter |
| Strapi | Dedicated content backend and admin forms; self-hosting route | Model migration and server operations; formal review workflows/audit are Enterprise |
| Sanity | Hosted content backend and flexible staff Studio | Content leaves Postgres; custom roles, full audit and some backup capabilities need Enterprise |
| Contentful | Managed entries, assets and collaboration | Paid plan/Space packaging can be expensive; confirm actual governance entitlements |
| Decap | Git-backed editor, portable files and PR-based reviews | Authentication/repository protection and nontechnical usability require careful testing |

## 2. Governance and hosting

An editor must be able to draft without publishing; the designated approver must control release. Confirm whether departmental separation and independent/two-stage review are mandatory. Revision history, an activity feed and a full security audit log are different controls.

Self-hosted Directus/Strapi require application compute, database/media persistence, backups, monitoring and a named maintainer beyond Render's static frontend. SaaS reduces backend administration but leaves adapter, access, export and build responsibilities with RapidLink. A future frontend move to AWS does not move a SaaS content database into RapidLink's account. Decap substitutes Git/auth operations for a CMS database.

**Evidence:** source-linked product research, region/recovery distinctions and advisory examples are in the full research report. No current vendor quotation, staff demonstration or restore result has been obtained by this research.

<!-- pagebreak -->

# Pricing and operational responsibility

## 3. Free versus paid

Directus has limited free self-hosted Core; its wider grant is conditional on revenue and employee thresholds. Strapi Community and Decap core software are free, with supporting infrastructure extra. Sanity Free has only Administrator/Viewer roles; Contentful Free has two roles. Free editing does not establish an adequate approval/audit package.

## 4. Three-year subscription examples

USD arithmetic checked 10 November 2026. Assume five paid staff unless noted. Exclude tax, setup, migration, training, maintenance, website hosting and unlisted services. These packages are not equivalent governance quotations.

| Scenario | Monthly input | 36 months |
|---|---|---:|
| Directus Team self-hosted | $599, includes 10 seats | $21,564 + infrastructure |
| Directus Team Cloud | $599 + $99 hosting | $25,128 |
| Strapi Growth, five users | $45 + 2 × $15 | $2,700 + hosting |
| Strapi Growth + Cloud Pro | $75 + $90 | $5,940 |
| Sanity Growth, five paid seats | 5 × $15 | $2,700 + unlisted services |
| Contentful Lite base | $300 | $10,800 |
| Contentful Lite + additional Lite Space | $300 + $850 | $41,400 |
| Decap core software | $0 | $0 + Git/auth/hosting/support |

Directus annual Team software pricing is $499/month with an annual commitment. Limited Core has three seats and does not cover this five-user scenario. The wider grant must be confirmed, not assumed. Enterprise controls, usage growth and SSO add-ons can change all comparisons.

**Complete budget:** one-time setup/migration/training + 36 × (licence + compute/database + storage/bandwidth + backup/monitoring + identity/Git + maintenance/support) + growth and tax. Unquoted items remain unknown, not zero. See the editable cost worksheet.

## 5. Security, recovery and exit

Directus and Strapi have published security advisories; check the selected maintained version and all extensions before deployment. Sanity/Contentful assurance material requires contractual review, not an assumption of no incidents. Decap's security policy and recent maintenance evidence should be reviewed alongside Git/auth dependencies.

Test recovery, not just export. Sanity's documented managed backup feature is restricted to certain Enterprise plans. Contentful distinguishes its platform backups from customer-level restoration. Self-hosted systems require IT-owned database/assets/configuration recovery. Git content also needs external assets and working build instructions retained.

<!-- pagebreak -->

# Personal tests and decision gates

## 6. What Caleb should test

Use synthetic records, separate writer/approver/admin accounts and an isolated preview. Do not connect a trial to live tables or production build hooks.

1. Observe a nontechnical colleague create/edit news and an image description; record errors and assistance.
2. Verify anonymous clients cannot read drafts or hidden fields and cannot write through the proposed public API.
3. Try publishing as a writer through the UI and API/Git; expect backend/repository denial.
4. Test the required approval stages, self-approval restrictions and department boundaries with separate accounts.
5. Edit a published item as a draft; verify the approved public version stays unchanged.
6. Check preview accuracy on desktop/mobile and whether access is restricted appropriately.
7. Identify who changed/published/deleted content, retention periods and whether logs can be altered. Confirm the actual purchased plan.
8. Publish and unpublish; confirm the Render rebuild updates static HTML, links and sitemap. Simulate a failed build/source read and confirm operator notification.
9. Remove an editor's access and retest active sessions/tokens. Export and restore content, assets and required configuration into a clean test environment.

All CMS trial outcomes currently remain **NOT RUN**. Use the accompanying test matrix to record version/plan, evidence and PASS/FAIL/NOT RUN/NOT APPLICABLE. Mandatory-control failures block selection until a mitigation is demonstrated.

## 7. Business answers and final approval

Management must confirm editor count, publishers/approvers, department restrictions, SSO/MFA requirements, audit retention, permitted regions, budget and final approver. IT must identify the patching, backup, recovery and monitoring owner. Obtain a dated vendor quotation using those same requirements, including renewal, usage and exit costs.

Deliver the full research and this summary for Edmund's review by Friday, 13 November. A limited test-data demo is desirable if practical. Select/migrate only after requirements, practical evidence and commercial/security terms are accepted. Preserve the current prototype until a replacement is approved.

## Official pricing references

Directus: https://directus.com/pricing  
Strapi CMS / hosting: https://strapi.io/pricing-cms · https://strapi.io/pricing-cloud  
Sanity: https://www.sanity.io/pricing  
Contentful: https://www.contentful.com/pricing/  
Decap: https://decapcms.org/docs/

The full report provides links beside technical, security and recovery findings. Prices are research inputs; no vendor quote, compliance acceptance or CMS trial pass is implied.
