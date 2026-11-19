import { describe, expect, it } from 'vitest'
import {
  calculateLoanEstimate,
  getRepaymentCount,
  LOAN_CALCULATOR_TERMS,
} from './Loans'

describe('loan calculator assumptions', () => {
  it('uses the inferred weekly schedule from the confirmed six-month example', () => {
    expect(LOAN_CALCULATOR_TERMS.weeklyPaymentsByMonth).toEqual({
      1: 4,
      2: 8,
      3: 13,
      4: 17,
      5: 21,
      6: 25,
    })
    expect(getRepaymentCount(6, 'weekly')).toBe(25)
    expect(getRepaymentCount(6, 'monthly')).toBe(6)
  })

  it('adds flat interest and all one-time fees to repayment', () => {
    const estimate = calculateLoanEstimate(10000, 2, 'monthly')

    expect(estimate.totalInterest).toBe(1200)
    expect(estimate.processingFee).toBe(500)
    expect(estimate.insuranceFee).toBe(100)
    expect(estimate.managementFee).toBe(75)
    expect(estimate.totalFees).toBe(675)
    expect(estimate.totalRepayment).toBe(11875)
    expect(estimate.installmentAmount).toBe(5937.5)
  })

  it('calculates early settlement as remaining principal plus five percent', () => {
    const estimate = calculateLoanEstimate(10000, 2, 'monthly', 1)

    expect(estimate.remainingPrincipal).toBe(5000)
    expect(estimate.earlySettlementFee).toBe(250)
    expect(estimate.earlySettlementTotal).toBe(5250)
  })

  it('divides a six-month weekly estimate across 25 equal payments', () => {
    const estimate = calculateLoanEstimate(20000, 6, 'weekly')

    expect(estimate.repaymentCount).toBe(25)
    expect(estimate.totalInterest).toBe(7200)
    expect(estimate.totalFees).toBe(1350)
    expect(estimate.totalRepayment).toBe(28550)
    expect(estimate.installmentAmount).toBe(1142)
  })

  it('accepts a validated CMS configuration without changing the protected formula', () => {
    const cmsSettings = {
      ...LOAN_CALCULATOR_TERMS,
      maximumPrincipal: 15000,
      processingFeeRate: 4,
      weeklyPaymentsByMonth: { ...LOAN_CALCULATOR_TERMS.weeklyPaymentsByMonth, 2: 9 },
    }
    const estimate = calculateLoanEstimate(10000, 2, 'weekly', 0, cmsSettings)

    expect(estimate.repaymentCount).toBe(9)
    expect(estimate.processingFee).toBe(400)
    expect(estimate.totalInterest).toBe(1200)
  })
})
