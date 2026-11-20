import { loanCalculatorSettings as LOAN_CALCULATOR_TERMS } from './loanCalculator.js'

export function getRepaymentCount(duration, frequency, terms = LOAN_CALCULATOR_TERMS) {
  return frequency === 'weekly'
    ? terms.weeklyPaymentsByMonth[duration]
    : duration
}

export function calculateLoanEstimate(principal, duration, frequency = 'monthly', paymentsMade = 0, terms = LOAN_CALCULATOR_TERMS) {
  const repaymentCount = getRepaymentCount(duration, frequency, terms)
  const totalInterest = principal * (terms.monthlyFlatRate / 100) * duration
  const processingFee = principal * (terms.processingFeeRate / 100)
  const insuranceFee = principal * (terms.insuranceFeeRate / 100)
  const managementFee = principal * (terms.managementFeeRate / 100)
  const totalFees = processingFee + insuranceFee + managementFee
  const totalRepayment = principal + totalInterest + totalFees
  const installmentAmount = totalRepayment / repaymentCount
  const remainingPrincipal = principal * Math.max(repaymentCount - paymentsMade, 0) / repaymentCount
  const earlySettlementFee = remainingPrincipal * (terms.earlySettlementRate / 100)

  return {
    principal,
    totalInterest,
    processingFee,
    insuranceFee,
    managementFee,
    totalFees,
    totalRepayment,
    repaymentCount,
    installmentAmount,
    remainingPrincipal,
    earlySettlementFee,
    earlySettlementTotal: remainingPrincipal + earlySettlementFee,
  }
}
