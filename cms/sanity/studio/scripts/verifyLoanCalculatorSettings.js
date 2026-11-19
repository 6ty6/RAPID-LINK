import { deepStrictEqual, ok } from 'node:assert'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const { loanCalculatorSettings } = await import(
  pathToFileURL(resolve(repositoryRoot, 'src/content/loanCalculator.js')).href
)
const client = getCliClient({ apiVersion: '2026-11-19' })

const record = await client.fetch(`*[_type == "loanCalculatorSettings" && _id == "rapidlink-loan-calculator-settings"][0]{
  isActive,
  minimumPrincipal,
  maximumPrincipal,
  minimumMonths,
  maximumMonths,
  monthlyFlatRate,
  nominalAnnualRate,
  processingFeeRate,
  insuranceFeeRate,
  managementFeeRate,
  repaymentFrequencies,
  weeklySchedule[]{months, payments},
  earlySettlementRate,
  excludeFutureInterest,
  heroIntro,
  disclaimer,
  assumptionNotice,
  approvalStatus,
  effectiveDate
}`)

ok(record, 'The hosted loan-calculator settings singleton does not exist.')
deepStrictEqual(record, {
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
  weeklySchedule: Object.entries(loanCalculatorSettings.weeklyPaymentsByMonth).map(([months, payments]) => ({ months: Number(months), payments })),
  earlySettlementRate: loanCalculatorSettings.earlySettlementRate,
  excludeFutureInterest: loanCalculatorSettings.excludeFutureInterest,
  heroIntro: loanCalculatorSettings.heroIntro,
  disclaimer: loanCalculatorSettings.disclaimer,
  assumptionNotice: loanCalculatorSettings.assumptionNotice,
  approvalStatus: loanCalculatorSettings.approvalStatus,
  effectiveDate: loanCalculatorSettings.effectiveDate,
})

console.log('PASS: hosted loan-calculator settings match the reviewed website fallback.')
