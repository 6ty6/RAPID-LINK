import {defineField,defineType} from 'sanity'
const fields=[
 ['heroEyebrow','Banner eyebrow','page'],['heroTitle','Page title','page'],
 ['formEyebrow','Form eyebrow','form'],['formTitle','Form heading','form'],
 ['principalLabel','Principal amount label','form'],['rateLabel','Interest rate label','form'],['durationLabel','Duration label','form'],['frequencyLabel','Repayment frequency label','form'],['paymentsLabel','Instalments paid label','form'],['optionalLabel','Optional field label','form'],['calculateLabel','Calculate button label','form'],
 ['resultsEyebrow','Results eyebrow','results'],['resultsTitle','Results heading','results'],['emptyTitle','Empty results heading','results'],['emptyDescription','Empty results explanation','results'],
 ['principalResult','Principal row label','results'],['interestResult','Interest row label','results'],['processingResult','Processing fee row label','results'],['insuranceResult','Insurance row label','results'],['managementResult','Management fee row label','results'],['totalResult','Total repayment label','results'],['settlementTitle','Early settlement heading','results'],['disclosureTitle','Disclosure heading','results'],
 ['cardTitleFirst','Card title — first line','card'],['cardTitleSecond','Card title — second line','card'],['cardDescription','Card description','card'],
]
export const loanCalculatorPage=defineType({
 name:'loanCalculatorPage',title:'Calculator page & homepage card',type:'document',
 description:'Edit how the calculator looks and what it says here. For prices, limits, introduction and disclaimer, open Loan Calculator → Rates, fees & approval. The homepage card always opens the calculator.',
 groups:[{name:'page',title:'Banner',default:true},{name:'form',title:'Form labels & help'},{name:'results',title:'Results wording'},{name:'card',title:'Homepage card'}],
 fields:[
  ...fields.map(([name,title,group])=>defineField({name,title,group,type:name.endsWith('Description')?'text':'string',validation:rule=>rule.required().min(1).max(300)})),
  defineField({name:'heroImage',title:'Current page banner',group:'page',type:'image',validation:rule=>rule.required()}),
  defineField({name:'cardImage',title:'Current homepage card photograph',group:'card',type:'image',validation:rule=>rule.required()}),
  defineField({name:'cardImageAlt',title:'Optional card image description',description:'Leave blank for a decorative image already explained by the card text.',group:'card',type:'string',validation:rule=>rule.max(240)}),
  defineField({name:'rateHelp',title:'Rate explanation',group:'form',type:'text',rows:2,description:'Keep {annualRate}; the website inserts the approved current rate.',validation:rule=>rule.required().max(500).custom(text=>text?.includes('{annualRate}')||'Keep the {annualRate} placeholder.')}),
  defineField({name:'paymentsHelp',title:'Instalments paid explanation',group:'form',type:'text',rows:5,description:'Keep {frequency}, {count} and {instalments}; they follow the selected repayment schedule.',validation:rule=>rule.required().max(1500).custom(text=>['{frequency}','{count}','{instalments}'].every(token=>text?.includes(token))||'Keep {frequency}, {count} and {instalments}.')}),
 ],
 preview:{select:{title:'heroTitle',media:'heroImage'},prepare:({title,media})=>({title:title||'Loan calculator',subtitle:'Page, form, results and homepage card',media})},
})
