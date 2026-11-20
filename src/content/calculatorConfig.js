import { loanCalculatorSettings as baseline } from './loanCalculator.js'
import { calculateLoanEstimate } from './loanMath.js'
export const calculatorRateKeys = ['monthlyFlatRate', 'processingFeeRate', 'insuranceFeeRate', 'managementFeeRate', 'earlySettlementRate']
export const calculatorPublicKeys = ['minimumPrincipal', 'maximumPrincipal', 'minimumMonths', 'maximumMonths', ...calculatorRateKeys, 'weeklySchedule', 'heroIntro', 'disclaimer', 'effectiveDate']
export function calculatorDraftDefaults() {
  return { ...Object.fromEntries(calculatorPublicKeys.filter(key=>key!=='weeklySchedule').map(key=>[key,baseline[key]])), weeklySchedule: Object.entries(baseline.weeklyPaymentsByMonth).map(([month,payments])=>({month:Number(month),payments})), approvalReference:'', verificationCases:[] }
}
export function calculatorTermsFromData(data) {
  return { ...baseline, ...Object.fromEntries(calculatorPublicKeys.filter(key=>key!=='weeklySchedule').map(key=>[key,data[key]])), nominalAnnualRate: Math.round(data.monthlyFlatRate * 12 * 1e8) / 1e8, weeklyPaymentsByMonth:Object.fromEntries(data.weeklySchedule.map(row=>[row.month,row.payments])) }
}
export function validateCalculatorConfig(data, { strict = true, verifyExamples = true } = {}) {
  for (const key of calculatorRateKeys) if (data[key] !== undefined && (!Number.isFinite(data[key]) || data[key] < 0 || data[key] > 100)) throw Error('Rates and fees must be between 0 and 100 percent.')
  for (const key of ['minimumPrincipal','maximumPrincipal']) if (data[key] !== undefined && (!Number.isFinite(data[key]) || data[key] <= 0 || data[key]>1e9 || Math.abs(data[key]*100-Math.round(data[key]*100))>1e-5)) throw Error('Loan limits must be positive amounts with no more than two decimal places.')
  for (const key of ['minimumMonths','maximumMonths']) if (data[key] !== undefined && (!Number.isInteger(data[key]) || data[key]<1 || data[key]>60)) throw Error('Loan duration must be a whole number from 1 to 60 months.')
  if (!strict) return
  for (const key of calculatorPublicKeys) if (data[key] === undefined) throw Error('Complete all calculator settings before review.')
  if (data.minimumPrincipal>data.maximumPrincipal || data.minimumMonths>data.maximumMonths) throw Error('Minimum limits cannot exceed maximum limits.')
  if (data.processingFeeRate+data.insuranceFeeRate+data.managementFeeRate>100) throw Error('Combined fees must not exceed 100 percent.')
  if (!Array.isArray(data.weeklySchedule) || !data.weeklySchedule.length || data.weeklySchedule.length>60) throw Error('Provide the approved weekly repayment schedule.')
  const months=new Set()
  for (const row of data.weeklySchedule) {
    if (!Number.isInteger(row.month)||row.month<1||row.month>60||months.has(row.month)||!Number.isInteger(row.payments)||row.payments<1||row.payments>520) throw Error('Weekly schedule needs unique months and positive whole payment counts.')
    months.add(row.month)
  }
  let previous=0
  for(let month=data.minimumMonths;month<=data.maximumMonths;month++) {
    const count=data.weeklySchedule.find(row=>row.month===month)?.payments
    if(!count || count<=previous) throw Error('Every allowed month needs an increasing approved weekly payment count.')
    previous=count
  }
  for(const key of ['heroIntro','disclaimer']) if(typeof data[key]!=='string'||!data[key].trim()) throw Error('Calculator introduction and estimate disclosure are required.')
  if(typeof data.effectiveDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.effectiveDate)||!Number.isFinite(Date.parse(data.effectiveDate))||new Date(data.effectiveDate).toISOString().slice(0,10)!==data.effectiveDate) throw Error('Use a valid calculator effective date.')
  if(!verifyExamples)return
  if(typeof data.approvalReference!=='string'||!data.approvalReference.trim())throw Error('Add the Credit approval reference.')
  if(!Array.isArray(data.verificationCases)||data.verificationCases.length<3||data.verificationCases.length>20)throw Error('Provide at least three verified repayment examples before review.')
  const terms=calculatorTermsFromData(data), cases=new Set()
  for(const sample of data.verificationCases) {
    const {principal,duration,frequency,paymentsMade}=sample
    const count=frequency==='weekly'?terms.weeklyPaymentsByMonth[duration]:duration
    if(!Number.isFinite(principal)||principal<data.minimumPrincipal||principal>data.maximumPrincipal||!Number.isInteger(duration)||duration<data.minimumMonths||duration>data.maximumMonths||!['monthly','weekly'].includes(frequency)||!Number.isInteger(paymentsMade)||paymentsMade<0||paymentsMade>count)throw Error('Each verification example must use permitted loan inputs.')
    cases.add([principal,duration,frequency,paymentsMade].join(':'))
    const result=calculateLoanEstimate(principal,duration,frequency,paymentsMade,terms)
    for(const [expected,key]of [['expectedTotal','totalRepayment'],['expectedInstalment','installmentAmount'],['expectedSettlement','earlySettlementTotal']]) {
      if(!Number.isFinite(sample[expected])||sample[expected]<0||Math.abs(sample[expected]-Number(result[key].toFixed(2)))>0.005)throw Error('Verification results do not match the proposed settings. Check the approved repayment schedules.')
    }
  }
  if(cases.size<3)throw Error('Provide three different verification examples.')
}
