import useSanityContent from './useSanityContent.js'
import { getSanityLoanCalculatorSettings } from '../services/content/sanityContentRepository.js'
import { loanCalculatorSettings } from '../content/loanCalculator.js'
export default function useLoanCalculatorSettings() {
  return useSanityContent('calculator', getSanityLoanCalculatorSettings, loanCalculatorSettings).data
}
