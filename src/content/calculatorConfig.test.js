import { describe,it,expect } from 'vitest'
import { calculatorDraftDefaults,calculatorTermsFromData,validateCalculatorConfig } from './calculatorConfig'
export function verifiedBaseline() {return {...calculatorDraftDefaults(),approvalReference:'Synthetic test evidence only',verificationCases:[
  {principal:1000,duration:1,frequency:'monthly',paymentsMade:0,expectedTotal:1127.5,expectedInstalment:1127.5,expectedSettlement:1050},
  {principal:10000,duration:2,frequency:'monthly',paymentsMade:1,expectedTotal:11875,expectedInstalment:5937.5,expectedSettlement:5250},
  {principal:15000,duration:6,frequency:'weekly',paymentsMade:0,expectedTotal:21412.5,expectedInstalment:856.5,expectedSettlement:15750},
]}}
describe('managed calculator validation',()=>{
  it('keeps existing approved pricing and schedule as the draft starting point',()=>{
    const data=verifiedBaseline();expect(()=>validateCalculatorConfig(data)).not.toThrow()
    expect(calculatorTermsFromData(data).nominalAnnualRate).toBe(72)
    expect(calculatorTermsFromData(data).weeklyPaymentsByMonth[6]).toBe(25)
  })
  it('rejects inverted bounds, invalid percentages, and missing or duplicate weekly schedule rows',()=>{
    const data=verifiedBaseline()
    for(const change of [{maximumPrincipal:500},{minimumMonths:7},{maximumMonths:7},{monthlyFlatRate:-1},{insuranceFeeRate:101},{weeklySchedule:[...data.weeklySchedule,data.weeklySchedule[0]]},{weeklySchedule:[]}])expect(()=>validateCalculatorConfig({...data,...change})).toThrow()
  })
  it('requires three distinct matching examples and an approval reference',()=>{
    const data=verifiedBaseline()
    for(const change of [{approvalReference:''},{verificationCases:[]},{verificationCases:Array(3).fill(data.verificationCases[0])},{monthlyFlatRate:7}])expect(()=>validateCalculatorConfig({...data,...change})).toThrow()
  })
  it('allows review of draft inputs but only accepts internally consistent publication settings',()=>{
    const data=verifiedBaseline()
    expect(()=>validateCalculatorConfig({...data,maximumPrincipal:500},{strict:false})).not.toThrow()
    const changed={...data,monthlyFlatRate:7,verificationCases:data.verificationCases.map((row,index)=>({...row,expectedTotal:[1137.5,12075,22312.5][index],expectedInstalment:[1137.5,6037.5,892.5][index]}))}
    expect(()=>validateCalculatorConfig(changed)).not.toThrow()
    expect(calculatorTermsFromData(changed).nominalAnnualRate).toBe(84)
  })
})
