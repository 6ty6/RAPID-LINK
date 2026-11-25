import {describe,it,expect} from 'vitest'
import {getFieldHelp,getSectionHelp} from '../../cms/sanity/studio/editorHelpText.js'
import {schemaTypes} from '../../cms/sanity/studio/schemaTypes/index.js'

const help=(type,path,extra={})=>getFieldHelp({document:{_type:type,...extra},path})
describe('CMS help explains public locations and effects',()=>{
 it('distinguishes identical field names by page and nested location',()=>{
  expect(help('publicProduct',['title'])).toContain('any homepage card')
  expect(help('publicBoardPage',['members',{_key:'person'},'name'])).toContain('director’s name')
  expect(help('sharedSettings',['companyName'])).toContain('copyright line')
  expect(help('sharedSettings',['companyLinks',{_key:'link'},'href'])).toContain('company link in the footer')
  expect(help('publicHomepage',['slides',{_key:'flyer'},'link'])).toContain('click this homepage flyer')
  expect(help('publicHomepage',['services','items',{_key:'service'},'to'])).toContain('homepage service-stop link')
 })
 it('identifies button destinations and separates public fields from internal metadata',()=>{
  expect(help('publicRateGuide',['downloadLabel'])).toContain('downloads the selected library document')
  expect(help('publicAccountPage',['content','contactLabel'])).toContain('opens /contact')
  expect(help('loanCalculatorPage',['calculateLabel'])).toContain('still calculates on this page')
  expect(help('publicPageCopy',['title'],{slug:'contact'})).toContain('Studio')
  expect(help('publicPageCopy',['listing','title'],{slug:'contact'})).toContain('branch-map')
  expect(help('publicPageCopy',['listing','title'],{slug:'stories'})).toContain('newsroom-list')
  expect(help('impactCounter',['verifiedAt'])).toContain('not displayed')
 })
 it('supplies an explicit explanation for every editable business field in every schema',()=>{
  const missing=[]
  function walk(fields,type,path=[]){
   for(const field of fields){
    if(field.hidden===true)continue
    const next=[...path,field.name]
    const explanation=help(type,next,{slug:'rapidlink-careers'})
    if(!explanation)missing.push(`${type}.${next.join('.')}`)
    if(field.fields)walk(field.fields,type,next)
    for(const member of field.of||[])if(member.fields)walk(member.fields,type,[...next,{_key:'test'}])
   }
  }
  for(const type of schemaTypes)walk(type.fields,type.name)
  expect(missing).toEqual([])
 })
 it('explains each menu destination without a generic editing fallback',()=>{
  const titles=['Homepage','Page content & flyers','Announcements','Products','Digital Channels','Loan Calculator','Page appearance & homepage card','Rates, fees & approval','About RapidLink','Page content, Vision & Mission','Impact numbers','Board of Directors','News','Articles','Careers','Page headings & departments','Vacancies','FAQs','Page banner','Questions & answers','Contact & branches','Contact details & social profiles','Rates & documents','Current rate table','Controller loan rates guide','Account-opening update','Loan application guidance','Abena','Shared website content','Navigation menus']
  for(const title of titles)expect(getSectionHelp(title),title).toBeTruthy()
  expect(getSectionHelp('Page headings','rapidlink-pages-contact')).toContain('Contact page')
  expect(getSectionHelp('Page headings','rapidlink-pages-stories')).toContain('News page')
 })
})
