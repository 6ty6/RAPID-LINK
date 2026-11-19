import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')
const { loanCalculatorSettings } = await import(
  pathToFileURL(resolve(repositoryRoot, 'src/content/loanCalculator.js')).href
)

const document = {
  _id: 'rapidlink-loan-calculator-settings',
  _type: 'loanCalculatorSettings',
  isActive: true,
  minimumPrincipal: loanCalculatorSettings.minimumPrincipal,
  maximumPrincipal: loanCalculatorSettings.maximumPrincipal,
  minimumMonths: loanCalculatorSettings.minimumMonths,
  maximumMonths: loanCalculatorSettings.maximumMonths,
  monthlyFlatRate: loanCalculatorSettings.monthlyFlatRate,
  nominalAnnualRate: loanCalculatorSettings.nominalAnnualRate,
  processingFeeRate: loanCalculatorSettings.processingFeeRate,
  insuranceFeeRate: loanCalculatorSettings.insuranceFeeRate,
  managementFeeRate: loanCalculatorSettings.managementFeeRate,
  repaymentFrequencies: loanCalculatorSettings.repaymentFrequencies,
  weeklySchedule: Object.entries(loanCalculatorSettings.weeklyPaymentsByMonth).map(([months, payments]) => ({
    _key: `month-${months}`,
    _type: 'weeklyPaymentTerm',
    months: Number(months),
    payments,
  })),
  earlySettlementRate: loanCalculatorSettings.earlySettlementRate,
  excludeFutureInterest: loanCalculatorSettings.excludeFutureInterest,
  heroIntro: loanCalculatorSettings.heroIntro,
  disclaimer: loanCalculatorSettings.disclaimer,
  assumptionNotice: loanCalculatorSettings.assumptionNotice,
  approvalStatus: loanCalculatorSettings.approvalStatus,
  effectiveDate: loanCalculatorSettings.effectiveDate,
  changeNotes: 'Initial calculator configuration. Weekly schedules and operational results remain pending Flexibank verification.',
}

console.log('Prepared the RapidLink loan-calculator settings singleton.')
console.log(`Loan range: GH₵${document.minimumPrincipal}–GH₵${document.maximumPrincipal}`)
console.log(`Duration: ${document.minimumMonths}–${document.maximumMonths} months`)
console.log(`Monthly flat rate: ${document.monthlyFlatRate}%; total fees: ${document.processingFeeRate + document.insuranceFeeRate + document.managementFeeRate}%`)
console.log(`Weekly schedule: ${document.weeklySchedule.map(term => `${term.months}m=${term.payments}`).join(', ')}`)

if (dryRun) {
  console.log('Dry run complete. No Sanity records were changed.')
  process.exit(0)
}

const client = getCliClient({ apiVersion: '2026-11-19' })
await client.transaction()
  .createOrReplace(document)
  .delete(`drafts.${document._id}`)
  .commit()

console.log('Sanity loan-calculator settings migration completed successfully.')
