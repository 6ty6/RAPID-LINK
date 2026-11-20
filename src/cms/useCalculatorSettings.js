import { useMemo } from 'react'
import { loanCalculatorSettings } from '../content/loanCalculator'
import { calculatorPublicKeys, calculatorTermsFromData, validateCalculatorConfig } from '../content/calculatorConfig'
import { usePublicCms } from './public'
export function useCalculatorSettings() {
  const cms=usePublicCms()
  const record=cms.enabled ? cms.records.find(item=>item.kind==='calculator') : null
  const serialized=record ? JSON.stringify(Object.fromEntries(calculatorPublicKeys.map(key=>[key,record[key]]))) : ''
  return useMemo(()=>{
    if(!serialized)return loanCalculatorSettings
    try { const data=JSON.parse(serialized);validateCalculatorConfig(data,{verifyExamples:false});return calculatorTermsFromData(data) }
    catch { return loanCalculatorSettings }
  },[serialized])
}
