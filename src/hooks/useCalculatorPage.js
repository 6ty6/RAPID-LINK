import useSanityContent from './useSanityContent.js'
import {getSanityCalculatorPage} from '../services/content/sanityContentRepository.js'
import {calculatorPage} from '../content/calculatorPage.js'
export default function useCalculatorPage(){return useSanityContent('calculator-page',getSanityCalculatorPage,calculatorPage).data}
