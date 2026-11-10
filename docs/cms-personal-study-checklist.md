# CMS research: Caleb's personal study checklist

Prepared 10 November 2026. Comparison due Friday, 13 November 2026.

## Current research position

An initial five-option comparison was discussed in the project conversation:
Directus, Strapi, Sanity, Contentful and Decap CMS. It covered fit, free/paid
options, feature gates and indicative three-year subscription calculations.
This is preliminary desk research, not an approved selection, completed product
trial or vendor quotation. No dedicated formal CMS comparison report was found
in the repository during this check. The required searchable two-to-three-page
Word report and any test-data demonstration remain to be prepared.

Understand all five at overview level. Directus and Sanity were proposed as
initial hands-on candidates, subject to licence, permissions and workflow
requirements; this is not a management-approved shortlist. Do not learn to build
five CMS installations or extend the current custom admin prototype.

## What to understand personally

| Topic | Question Caleb should be able to answer |
|---|---|
| Purpose and boundary | Which approved public content can staff maintain, and which personal/confidential records must stay outside the CMS? |
| Hosting model | Does the CMS use an existing SQL database, a separate self-hosted backend, a vendor-hosted content service or Git files? Who operates it? |
| Editorial work | Can a nontechnical colleague create/edit news, upload an image, preview a change and understand validation messages? |
| Permissions | Can a writer save a draft but be blocked from publishing? Who can approve, publish, invite staff and remove access? Is department-specific access required? |
| History and accountability | Can a reviewer identify who changed what and restore a prior version? Is this revision history, an activity feed or a full audit log, and what retention applies? |
| Publishing and rebuilding | How does an approved change reach our pre-rendered Render site? What happens on unpublish, API failure or a failed rebuild? |
| Operations and exit | Where are content and assets stored? Who patches, monitors, backs up and restores them? Can we export and recover the content elsewhere? |
| Real cost | Which required features are available on the quoted plan, and what is the full three-year cost including hosting and maintenance? |

An attractive editing screen is not evidence that approval restrictions are
enforced. Test permissions, and distinguish a paid feature demonstrated in a
trial from a feature included in the plan RapidLink would actually purchase.

## Practical exercise

Use an isolated demo with synthetic content and test accounts. Do not connect
the exercise to the live database, real staff credentials or production build
hooks. Try the same tasks for each hands-on candidate:

1. Create a test news article with a title, summary, image and image description.
2. Save it as a draft. Confirm an anonymous public read cannot retrieve it.
3. Sign in as a writer and try to publish. Record whether the backend blocks it.
4. Have the designated reviewer approve and publish using a separate account.
5. Preview the article in the website layout; check desktop and mobile output.
6. Change the article, find the responsible editor in history and restore an
   earlier version. Record the history/audit retention and any plan limitation.
7. Publish and then unpublish against a test preview build. Confirm static HTML
   and public links update after rebuilding; note who monitors failed builds.
8. Remove a test editor's access and confirm they cannot continue editing.
9. Export the content and assets, then demonstrate restoration/import or record
   exactly what remains untested. An export alone is not proof of recovery.

Retain a short screen recording or screenshots and a result table: task,
observed result, plan tested, limitation, evidence file and unresolved question.
If a feature cannot be tested, mark it unverified rather than passed.

## Business/vendor answers to obtain

- Management: number of editors/approvers, departmental boundaries, mandatory
  SSO, required audit retention, budget and final approving person.
- IT: operational owner, acceptable hosting/data regions, Render service and
  database/storage needs, backup frequency, recovery expectations and support.
- Vendor: dated licence/feature quotation, eligible free use, seat limits,
  approval controls, SSO, history/audit retention, hosting region, backup/restore
  arrangements, export limitations and any support/usage charges.

Calculate three-year cost as setup/migration/training plus 36 months of
subscriptions, hosting, storage, backups, monitoring and maintenance, with
usage/seat assumptions, billing commitment, taxes and currency stated. Compare
packages that meet the same requirements. Do not compare a bare free editor
against an enterprise approval/audit package as equivalent.

Check official documentation, current pricing, release/support policy and
security advisories for the shortlisted version. A compliance badge is not a
complete security-history review. Technical research and report drafting can
be assisted; Caleb's most valuable personal evidence is observed editor
usability, permission behavior and confirmed business ownership/requirements.

## RapidLink-specific boundaries

- News, FAQs, public product descriptions and approved public documents may be
  evaluated. Calculator pricing remains on hold; no new admin models/editors
  are authorised while the CMS decision is pending.
- No current forms/KYC materials or new board-profile assets have been supplied.
  Test with synthetic substitutes, not invented public documents.
- Annual reports and financial statements are auditor-only and excluded from
  the public website/CMS. No private auditor portal is part of this evaluation.
- There are no current vacancies reported. Existing prototype board/vacancy
  displays remain unchanged by explicit user instruction.
- Domain and current Render hosting choice are confirmed. AWS is a possible
  future direction, not a confirmed migration. Compare portability accordingly.
- The handoff now records 36/36 reset-local and 22/22 hosted content API checks
  passed. Anonymous storage-upload protection remains a separate outstanding
  check; a new CMS cannot inherit those test results without verification.

## Required deliverable

For Edmund, prepare a searchable two-to-three-page Word comparison covering at
least the existing-database admin, self-hosted and SaaS categories. Include all
five candidates if space permits, recommendation and alternatives, costs,
reasons, risks, unresolved assumptions and dated primary-source links. Add a
short test-data demo or its evidence if practical. Keep the evaluation pending
until management reviews it; do not select or deploy a CMS automatically.
