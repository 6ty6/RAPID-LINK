export const calculatorPage = {
  heroEyebrow:'Planning tool',heroTitle:'Loan calculator',heroImage:'/assets/loan-calculator-hero-v2.png',
  formEyebrow:'Plan your repayment',formTitle:'Calculate an estimate',
  principalLabel:'Principal Amount',rateLabel:'Monthly flat interest rate',durationLabel:'Loan Duration (Months)',frequencyLabel:'Repayment frequency',paymentsLabel:'Number of instalments already paid',optionalLabel:'(optional)',calculateLabel:'Calculate',
  rateHelp:'Calculated each month on the original principal. Nominal annual rate: {annualRate}%.',
  paymentsHelp:'Planning a new loan? Leave this at 0. To estimate the cost of clearing an existing loan early, enter how many {frequency} instalments you have already paid, not the amount of money paid. Your selected schedule has {count} {instalments}, so enter a whole number from 0 to {count}. This does not check your actual loan account; contact the loans team for a settlement quote.',
  resultsEyebrow:'Your estimate',resultsTitle:'Repayment summary',emptyTitle:'Enter a loan amount to begin.',emptyDescription:'Your interest, fees and instalments will appear here.',
  principalResult:'Principal',interestResult:'Flat interest',processingResult:'Processing fee',insuranceResult:'Insurance',managementResult:'Management fee',totalResult:'Total repayment',settlementTitle:'Estimated early settlement today',disclosureTitle:'Important calculation information',
  cardTitleFirst:'Loan',cardTitleSecond:'Calculator',cardDescription:'Estimate your interest, fees and repayments before you apply.',cardImage:'/assets/planning-calculator-photo.jpg',cardImageAlt:'',
}
export const formatCalculatorText = (text, values) => text.replace(/\{(\w+)\}/g,(match,key)=>Object.hasOwn(values,key)?String(values[key]):match)
