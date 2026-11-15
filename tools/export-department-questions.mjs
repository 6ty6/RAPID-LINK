import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const logo = (await readFile('public/assets/rapidlink-logo.png')).toString('base64')
const output = resolve('docs/RapidLink - Department Information Questions.pdf')
const source = resolve('docs/RapidLink - Department Information Questions.html')
const response = `<div class="response"><strong>Department / respondent:</strong> ______________________________<br><strong>Approved by / date:</strong> ___________________________________<br><strong>Documents supplied / outstanding:</strong> ________________________</div>`
const header = (number, subtitle) => `<header><img src="data:image/png;base64,${logo}" alt="RapidLink Microfinance"><div>WEBSITE PROJECT<br><span>Department information requests</span></div></header><div class="kicker">9 NOVEMBER 2026 &nbsp; / &nbsp; ${number} OF 4</div><h1>${subtitle}</h1>`
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>RapidLink — Department Information Questions</title><style>
@page { size:A4; margin:17mm 18mm 18mm; }
* { box-sizing:border-box; } body { margin:0; color:#25364a; font:10.5pt/1.43 Arial,sans-serif; }
.page { break-after:page; } .page:last-child { break-after:auto; }
header { display:flex; align-items:center; justify-content:space-between; padding-bottom:13px; border-bottom:3px solid #e88026; margin-bottom:17px; }
header img { width:155px; height:55px; object-fit:contain; object-position:left; } header div { text-align:right; font-size:9pt; font-weight:bold; color:#173651; letter-spacing:.6px; } header span { font-size:8.5pt; font-weight:normal; letter-spacing:0; }
.kicker { font-size:8pt; color:#6a7785; letter-spacing:1px; } h1 { font-size:22pt; line-height:1.14; color:#102b46; margin:9px 0 12px; } h2 { font-size:12pt; color:#102b46; margin:16px 0 7px; }
p { margin:6px 0 10px; } ol { padding-left:21px; margin:7px 0 12px; } li { padding-left:3px; margin:0 0 8px; break-inside:avoid; }
.note { background:#f1f5f8; border-left:3px solid #e88026; padding:10px 12px; font-size:9.4pt; margin:12px 0; break-inside:avoid; }
.request { font-size:9.3pt; color:#43596e; margin:9px 0 12px; } .response { border-top:1px solid #cbd5df; padding-top:10px; margin-top:17px; font-size:9pt; line-height:1.9; break-inside:avoid; }
.small { font-size:8.8pt; color:#526579; } .tag { color:#9c4d0e; font-weight:bold; }
</style></head><body>
<section class="page">${header(1, 'Credit Department: loan pricing')}
<p>Please confirm the calculation rules and provide supporting schedules before the website calculator is changed. Suggested respondents are Credit and the relevant product owners; management should confirm ownership.</p>
<div class="note"><strong>Reported inputs — clarification pending:</strong> business and personal loans: 6% interest; processing fee: 6.75%; cash collateral: 30%. These figures alone are not enough to calculate repayments or APR correctly.</div>
<ol>
<li>Is the <strong>6% interest rate monthly, annual or for the full loan term</strong>?</li>
<li>Is interest calculated on the <strong>original principal (flat)</strong> or the <strong>remaining balance (reducing balance)</strong>? Please provide the exact calculation method.</li>
<li>Do business and personal loans use the same terms? What rates and rules apply to the other loan products?</li>
<li>What loan amounts, minimum/maximum durations, payment frequency and first-payment dates should the calculator support?</li>
<li>What amount is the <strong>6.75% processing fee</strong> based on? Is it charged once, paid separately, deducted from the payout or added to the loan balance?</li>
<li>What amount is the <strong>30% cash collateral</strong> based on? Is it deposited separately or withheld from the payout? When and under what conditions is it released or refunded, and does it earn interest?</li>
<li>Are insurance, taxes or any other compulsory charges applicable? Please explain their calculation and collection.</li>
<li>What are the approved <strong>annual interest rate and APR</strong> for the applicable loan terms? APR expresses borrowing cost as a yearly percentage including applicable charges.</li>
<li>How are instalments rounded and the final payment adjusted? What early-settlement or late-payment charges must be disclosed, and which should be excluded from a normal estimate?</li>
<li>Can Credit provide <strong>at least three synthetic or anonymised Flexibank schedules</strong> and sign off the matching calculator results?</li>
</ol>
<p class="request"><strong>For each example:</strong> product, approved amount, term, interest method, deductions, cash actually received, payment dates/amounts, total interest, fees, total repayment and collateral treatment.</p>
${response}</section>

<section class="page">${header(2, 'Finance, Compliance & Legal')}
<h2>Finance / Treasury</h2>
<ol>
<li>Please supply the current approved <strong>savings, investment and fixed-deposit rates</strong>, including amount bands, terms and effective dates.</li>
<li>What minimum deposits/balances, interest-payment frequency, withdrawal restrictions and early-liquidation penalties apply to each product?</li>
<li>Please provide the complete approved <strong>schedule of fees and charges</strong>. Who owns updates, and who approves a change before it is published?</li>
</ol>
<h2>Compliance / Legal</h2>
<ol start="4">
<li>What exact <strong>licensing and deposit-protection wording</strong> is approved for the website, including whether protection applies and any limitations?</li>
<li>What are the approved <strong>complaint acknowledgement, resolution and escalation timelines</strong>, channels and responsible contacts?</li>
<li>Can you provide approved <strong>privacy, terms of use, cookie and accessibility statements</strong>, with their versions and effective dates?</li>
<li>What consent, retention, access and privacy requirements must be met before any application or other personal-information form can submit data?</li>
<li>Please approve the calculator's <strong>“estimate, not an offer”</strong> wording, interest/fee assumptions and annual-rate/APR disclosures after Credit confirms the figures. Who provides final sign-off?</li>
<li>What public <strong>whistleblowing contact or channel</strong>, if any, is approved for publication?</li>
</ol>
<div class="note"><strong>Confirmed publication boundary:</strong> annual reports and financial statements will not be published. Access is restricted to auditors. This questionnaire does not request these documents for the public website or authorise an auditor portal.</div>
<p class="request"><strong>Please provide:</strong> approved wording/documents, applicable products, effective/review dates and the named approving person. Do not supply customer records or confidential reports for website publication.</p>
${response}</section>

<section class="page">${header(3, 'Operations, HR & Secretariat')}
<h2>Operations / Customer Service / Digital Banking</h2>
<ol>
<li>Please confirm the official <strong>branch names, addresses, digital addresses, telephone numbers and email contacts</strong>.</li>
<li>What are the approved <strong>opening hours and holiday-notice arrangements</strong>? Who informs the website owner when they change?</li>
<li>Please verify the digital identifiers currently shown in the prototype: <strong>USSD *899*727#, MTN Merchant ID 219440 and Telecel Till 394675</strong>. Confirm recipient names and customer instructions.</li>
<li>Please confirm the official mobile-app store destinations, MoneyQube link and other public service links. Who approves and maintains them?</li>
<li><strong>No current downloadable forms or KYC checklist have been supplied.</strong> Who is coordinating their future availability, approval and delivery, and when should we follow up?</li>
</ol>
<h2>Human Resources</h2>
<ol start="6">
<li><strong>No current vacancies have been reported.</strong> Who will notify the website owner when an approved opening becomes available?</li>
<li>For future vacancies, who supplies and approves the title, department, location, employment type, duties, eligibility, application instructions and closing date? Who confirms when a listing must be withdrawn?</li>
</ol>
<h2>Company Secretariat / Management</h2>
<ol start="8">
<li><strong>New photographs, board biographies and achievements have not been supplied.</strong> Who is coordinating their availability, and when should we follow up?</li>
<li>Who approves the names, roles, biographies, achievements, photographs and image-use permissions for future board or management profile updates?</li>
<li>Who can verify the institutional profile, Mission/Vision and impact figures, including the source and “as at” date of each figure?</li>
</ol>
<div class="note"><strong>Current instruction:</strong> the existing prototype board profiles and vacancy display are to remain unchanged for now. This does not constitute fresh confirmation that their content is current or approved.</div>
${response}</section>

<section class="page">${header(4, 'IT, management & coordination')}
<h2>Information Technology / Integration Owners</h2>
<ol>
<li>What is the approved <strong>general-loan application destination</strong>, and which products should use it? MoneyQube must remain separate from the general-loan portal.</li>
<li>Who owns the <strong>account-opening backend</strong>, and can they provide the integration contract and a synthetic-data test environment?</li>
</ol>
<p class="request">The contract should specify endpoint origin/path; authentication/session, CORS and CSRF requirements; exact field names; upload types and limits (including whether 1.5 MB is per file or total); signature format; validation/success/failure responses; and duplicate/idempotency handling.</p>
<ol start="3">
<li><strong>rapidlinkgh.com and Render are confirmed for now.</strong> Which Render production plan is authorised, who owns the account, and who manages DNS, deployments and renewals? The review treats the free tier as preview-only.</li>
<li>Which services should remain on Supabase/Render, and who owns access control, backups, patching, monitoring and incident response? AWS is a possible future direction; what conditions would trigger a migration?</li>
<li>How should approved publication or withdrawal trigger a website rebuild, and who checks that the deployed site reflects the change?</li>
</ol>
<div class="note"><strong>Assigned to Caleb — not questions to redistribute:</strong> verify hosted Supabase sign-up settings and migrations, obtain hosted RLS evidence, and test storage restrictions. The 28 local RLS checks have passed; hosted and storage verification remain outstanding.</div>
<h2>Management / PA coordination</h2>
<ol start="6">
<li>Who drafts, reviews, approves and publishes each content type? Which changes require Compliance approval, and who is the final launch approver?</li>
<li>Who will receive the <strong>CMS comparison due Friday, 13 November 2026</strong>? Confirm submission format, reviewer, budget contact and staff-editing requirements.</li>
<li>Can the PA coordinate the outstanding departmental responses and arrange the next internal review? What delivery dates and management deadlines should be recorded?</li>
</ol>
<p class="small"><strong>Response standard:</strong> identify the responding department, factual owner, approving person, effective date, supporting source and next review date. Where information is unavailable, name the coordinator and an agreed follow-up date instead of guessing.</p>
${response}</section>
</body></html>`

await writeFile(source, html)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true })
  console.log(`Created ${output}`)
} finally {
  await browser.close()
}
