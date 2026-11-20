import { calculatorDraftDefaults } from '../../src/content/calculatorConfig.js'
// Synthetic regression cases. These are not evidence of business approval.
export function verifiedCalculatorData() {return {...calculatorDraftDefaults(),approvalReference:'Synthetic regression test only',verificationCases:[
  {principal:1000,duration:1,frequency:'monthly',paymentsMade:0,expectedTotal:1127.5,expectedInstalment:1127.5,expectedSettlement:1050},
  {principal:10000,duration:2,frequency:'monthly',paymentsMade:1,expectedTotal:11875,expectedInstalment:5937.5,expectedSettlement:5250},
  {principal:15000,duration:6,frequency:'weekly',paymentsMade:0,expectedTotal:21412.5,expectedInstalment:856.5,expectedSettlement:15750},
]}}
export function changedCalculatorData() {
  const data=verifiedCalculatorData()
  return {...data,maximumPrincipal:15000,monthlyFlatRate:7,verificationCases:data.verificationCases.map((row,index)=>({...row,expectedTotal:[1137.5,12075,22312.5][index],expectedInstalment:[1137.5,6037.5,892.5][index]}))}
}
