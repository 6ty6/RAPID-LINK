# RapidLink Website Project

## Current Progress Update and Delivery Timeline

**Submitted to:** Edmund Nii Odoi Akogyeram, IT Officer  
**Prepared by:** Caleb Adom Awuah  
**Report date:** 16 November 2026  
**Project:** RapidLink Microfinance Website Redesign and Restructuring  
**Document status:** Progress update, dependency record and forward delivery plan

---

<!-- pagebreak -->

## 1. Purpose of this update

This document provides a concise update on work completed since the previous report and presents the expected timeline for the loan calculator, frontend selection, content-management-system evaluation and the remaining activities required before production completion.

The project continues to use isolated development branches. The current production branch remains protected while the alternative frontend designs and CMS evaluations are reviewed and tested.

## 2. Executive summary

Three alternative frontend interfaces have been completed and were ready for review on **13 November 2026**. They are currently awaiting management approval and selection. The interfaces preserve the same RapidLink information and colour identity while presenting three different customer experiences: Corporate Trust, Human-Centred and Digital First.

The loan calculator is scheduled for completion by **Friday, 20 November 2026**. This target depends on receiving and confirming the official pricing method, rates, fees, annual-percentage-rate wording and sample repayment schedules from Credit and Compliance. The calculator will not be changed using assumed financial information.

The CMS evaluation is in progress. A reliable completion date for the final CMS implementation cannot yet be confirmed because this is a specialist area in which further practical experience, product testing and integration research are required. I will make every reasonable effort to gain the required knowledge and complete the practical evaluation. By **Friday, 27 November 2026**, I will provide a recommended CMS direction together with a realistic implementation scope and delivery estimate. This date is for the recommendation and build plan; it is not a promise that the full production CMS will be completed by that date.

## 3. Work completed to date

### 3.1 Alternative frontend interfaces

The following frontend concepts were completed on separate branches and presented as independent design directions:

1. **Corporate Trust** — a formal, structured and institution-led interface.
2. **Human-Centred** — a customer-goal-led and approachable interface.
3. **Digital First** — a modern, compact and service-focused interface.

The concepts have different headers, navigation patterns, homepage sliders, content layouts and footers. They are not simple colour variations of the original site. They retain the same approved information, RapidLink brand colours, routes and core functions so management can compare the design experience fairly.

The design implementation and refinement were completed on **13 November 2026**. Each concept passed the available application tests and production build checks. The designs are now **awaiting management review and written approval of one preferred direction**. No design has been merged into the production branch.

### 3.2 Security and content governance

The overlapping vacancy administrator models were consolidated into one content-administrator role. The hosted role verification passed all seven checks, and the hosted public API security test passed all 22 checks using the public publishable key with administrator, non-administrator and anonymous access scenarios.

The project also retains security-header evidence, mobile Lighthouse evidence, controlled authentication, public sign-up restrictions, draft-versus-published content controls and isolated development branches.

### 3.3 CMS evaluation progress

CMS evaluation has moved beyond desk research into practical testing:

- the existing Supabase-based content prototype remains available as a reference implementation;
- Directus was reviewed, but its hosted evaluation requested payment and was therefore not adopted for the free practical trial;
- a Sanity evaluation project and isolated Studio have been connected to the website;
- Sanity schemas have been prepared for news, career vacancies and institutional impact counters;
- the website can read published Sanity content without adding a secret token to the public frontend;
- impact-counter values, labels, icons, ordering and visibility can now be managed through the Sanity evaluation; and
- the current Sanity-backed application suite passes **55 of 55 tests**, while both the website and Studio production builds complete successfully.

This work proves that an external CMS can supply structured content to the React website. It does not yet prove that Sanity is the best production choice or that every website section should be migrated to it.

## 4. Work in progress and delivery commitments

### 4.1 Loan calculator

**Target completion date: Friday, 20 November 2026.**

The calculator will be completed after the following information has been received and confirmed by Credit and Compliance:

- approved calculation or pricing method;
- current interest rates and applicable rate rules;
- all fees and charges;
- approved APR and customer-disclosure wording; and
- at least three verified Flexibank repayment examples for comparison testing.

Once the inputs are received, the work will cover formula implementation, validation against the approved examples, customer-facing wording, responsive testing and regression testing. If the approved inputs are not supplied early enough for implementation and verification, the dependency and revised target will be reported immediately rather than publishing an unverified calculator.

### 4.2 Frontend selection and integration

**Design development completed: Friday, 13 November 2026.**  
**Current status: Awaiting approval.**

Management is requested to select one preferred design by **Friday, 20 November 2026**, if practicable. After written approval, the selected concept will require approximately **five working days** for consolidation across the full page inventory, followed by final testing and approval. This period starts from the date the preferred design and any requested amendments are confirmed.

### 4.3 CMS recommendation and implementation estimate

**CMS recommendation and realistic build estimate due: Friday, 27 November 2026.**

At present, I cannot responsibly confirm a final CMS completion date. My current practical experience in this specialist area is still developing, and the system must be evaluated against content ownership, staff workflow, security, hosting, backup, cost, migration and long-term support requirements.

Between 16 and 27 November, the planned work is to:

1. continue structured learning and practical CMS testing;
2. test content creation, drafting, publishing, unpublishing, deletion, images and staff access;
3. determine which website content should be CMS-managed and which layout or business logic should remain in code;
4. compare Supabase, Sanity and the remaining viable self-hosted option against the same requirements;
5. assess ownership, pricing, backup, export, vendor dependency and future AWS implications; and
6. produce a recommendation, phased migration scope and realistic build timeline.

The final production CMS completion date will be set only after this evaluation and the necessary management decision.

## 5. Proposed timeline

| Activity | Current status | Target or decision date | Dependency / completion condition |
|---|---|---|---|
| Three frontend concepts | Completed | **13 November 2026** | Completed, tested and awaiting approval |
| Management selection of preferred frontend | Awaiting decision | **20 November 2026 (requested)** | Written selection and consolidated amendment list |
| Loan calculator | In progress / awaiting approved inputs | **20 November 2026** | Credit and Compliance information received in time for verification |
| CMS practical evaluation | In progress | **16–27 November 2026** | Product trials, workflow review and integration research |
| CMS recommendation and implementation estimate | Planned | **27 November 2026** | Evidence-based comparison and management requirements confirmed |
| Selected-design consolidation | Not started | **Five working days after approval** | Preferred concept and amendments approved |
| Complaints, fees, security-centre and licensing content | Awaiting business owners | **Date to be agreed** | Approved wording supplied by responsible departments and Compliance |
| Platform ownership and hosting decision | Awaiting management decision | **Before production approval** | RapidLink-owned Supabase organisation or approved alternative/AWS direction |
| Final user acceptance, accessibility, security and performance testing | Not started for final release | **Three working days after selected design, content and integrations are ready** | Stable release candidate and approved content |
| Production deployment to `rapidlinkgh.com` | Not yet scheduled | **Set after final sign-off** | All preceding approvals, ownership decisions and release tests passed |

## 6. Additional activities that require timelines

In addition to the three items already identified, the following activities need agreed dates because they directly affect final completion:

### 6.1 Management design approval

Keeping three designs active for too long will create duplicate maintenance work. A selection date and a single consolidated list of amendments are therefore required before full-page refinement can continue efficiently.

### 6.2 Section 5 business and compliance information

The complaints procedure, fees schedule, security-centre guidance and licensing statement require authorised wording and named content owners. Their delivery and approval dates should be agreed with the responsible departments and Compliance.

### 6.3 CMS and infrastructure ownership decision

The current Supabase project is not yet under a RapidLink-owned organisation, and the alternative of AWS has not been decided. A decision date is required before production launch so that ownership, billing, backup, access and support responsibilities are clear.

### 6.4 Final integration and user-acceptance testing

After the frontend is selected and required content is supplied, time must be reserved for full responsive, accessibility, security, performance, browser and staff acceptance testing. This should be treated as a formal release stage rather than an informal final check.

### 6.5 Production release and post-launch monitoring

The production launch date should be agreed only after final sign-off. A short post-launch monitoring period should also be assigned to verify the live domain, forms, content, analytics, metadata, security headers, error handling and customer-facing links.

## 7. Dependencies and risks

| Dependency or risk | Effect on delivery | Control action |
|---|---|---|
| Calculator information is delayed or incomplete | Calculator cannot be safely verified by 20 November | Request approved inputs promptly and report any schedule effect immediately |
| Frontend approval is delayed | Full consolidation and final testing cannot start | Request one preferred design and one amendment list by 20 November |
| CMS learning and practical evaluation take longer than expected | A premature implementation estimate may be unreliable | Deliver an evidence-based recommendation and estimate on 27 November, then agree the production schedule |
| Compliance content is unavailable | Important trust and customer-support sections remain incomplete | Assign named owners and approval dates |
| Platform ownership remains undecided | Production governance and continuity remain uncertain | Resolve RapidLink ownership or approve the alternative before launch |
| Multiple new requirements are introduced during evaluation | Scope and completion date may change | Record new requirements, assess their impact and obtain approval before adding them to the committed scope |

## 8. Decisions and support requested from Edmund

1. Confirm or coordinate the calculator inputs from Credit and Compliance so implementation can be completed and verified by 20 November 2026.
2. Support management selection of one frontend concept, preferably by 20 November 2026.
3. Confirm the participants and decision criteria for the CMS evaluation.
4. Assign or confirm owners for complaints, fees, security-centre and licensing content.
5. Confirm the required decision date for moving the data platform into RapidLink ownership or selecting the approved hosting alternative.

## 9. Conclusion

The project has made measurable progress in frontend design, content security and practical CMS integration. The three new interfaces were completed on 13 November and are ready for management selection. The calculator is targeted for completion by 20 November, subject to authorised financial inputs. The CMS evaluation will continue through 27 November, when a recommendation and realistic implementation estimate will be delivered.

The overall production completion date should not yet be fixed because it depends on the design decision, approved calculator data, CMS and hosting decisions, authorised Section 5 content and final acceptance testing. Once those dependencies are resolved, they can be converted into a single controlled production schedule.

---

**Prepared by:** Caleb Adom Awuah  
**Submitted to:** Edmund Nii Odoi Akogyeram  
**Date:** 16 November 2026
