// Reviewed local fallback used whenever the CMS is unavailable or has not yet
// published a complete calculator record. Calculation formulas remain in code.
export const loanCalculatorSettings = Object.freeze({
  minimumPrincipal: 1000,
  maximumPrincipal: 20000,
  minimumMonths: 1,
  maximumMonths: 6,
  monthlyFlatRate: 6,
  nominalAnnualRate: 72,
  processingFeeRate: 5,
  insuranceFeeRate: 1,
  managementFeeRate: 0.75,
  earlySettlementRate: 5,
  excludeFutureInterest: true,
  repaymentFrequencies: Object.freeze(['monthly', 'weekly']),
  weeklyPaymentsByMonth: Object.freeze({ 1: 4, 2: 8, 3: 13, 4: 17, 5: 21, 6: 25 }),
  heroIntro: 'Estimate your interest, fees and weekly or monthly repayments before applying.',
  disclaimer: 'This calculator provides an estimate only and is not a loan offer.',
  assumptionNotice: 'Weekly schedules are inferred from the confirmed six-month example and remain subject to operational verification.',
  approvalStatus: 'provisional',
  effectiveDate: '2026-11-19',
})
