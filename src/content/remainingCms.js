import {products} from '../content.js'
import {editorialFallbacks} from './editorialFallbacks.js'
import {otherPageFallbacks} from './otherPageFallbacks.js'

export const remainingCms = {
 ...editorialFallbacks,
 ...otherPageFallbacks,
 homepage:{schema:'publicHomepage',title:'Homepage',id:'rapidlink-homepage',content:{
  meta:{title:'Home',description:'Explore RapidLink savings, loans, investments and digital banking services in Ghana.'},
  slides:[
   {id:'school',eyebrow:'Everyday banking',title:'Build steadily. Move confidently.',text:'Practical savings, loans and digital channels for the moments that matter.',image:'/assets/hero-controller.png',imageAlt:'RapidLink promotional flyer: Build steadily. Move confidently.',link:'/apply-loan',action:'Explore savings',isPublished:true},
   {id:'notice',eyebrow:'Customer notice',title:'Issue cheques with sufficient funds.',text:'Repeated dud cheques may attract financial penalties, a cheque ban and credit restrictions.',image:'/assets/hero-notice.jpg',imageAlt:'RapidLink promotional flyer: Issue cheques with sufficient funds.',link:'/stories/bank-of-ghana-dud-cheque-sanctions',action:'Read the full notice',isPublished:true},
   {id:'controller',eyebrow:'Salary-backed credit',title:'Controller loans for CAGD staff.',text:'Published loan terms extend up to 60 months. Eligibility and current rates apply.',image:'/assets/controller-loan-flyer.png',imageAlt:'RapidLink promotional flyer: Controller loans for CAGD staff.',link:'/deduct-at-source-loan',action:'View loan information',isPublished:true},
  ],
  products:{eyebrow:'Explore products',title:'Products for your next step.',featuredSlugs:['rapid-susu','rapid-savings','rapid-edu-grow','personal-loan','business-loan','fixed-deposit']},
  services:{eyebrow:'What we provide',title:'Financial tools for real life.',description:'Save consistently, support your business and bank wherever life takes you.',aboutLabel:'Learn about RapidLink',aboutLink:'/institutional-profile',items:[
   {id:'save',title:'Save & grow',description:'Savings and deposits for your next goal.',action:'Explore savings',to:'/rapid-savings',icon:'savings',isPublished:true},
   {id:'grow',title:'Move forward',description:'Micro and SME loans to support your plans.',action:'Explore loans',to:'/business-loan',icon:'business',isPublished:true},
   {id:'digital',title:'Bank anywhere',description:'Everyday banking through mobile and USSD.',action:'Explore digital channels',to:'/digital-channels',icon:'digital',isPublished:true},
  ]},
  tools:{eyebrow:'Plan with confidence',titleFirst:'Know your numbers.',titleSecond:'Plan your next move.',description:'Explore our published rates and estimate your loan repayments before taking the next step.',ratesTitleFirst:'Current',ratesTitleSecond:'Interest Rates',ratesDescription:'Explore our published rates and plan your next financial step.',ratesImage:'/assets/planning-current-rates.jpg'},
  news:{eyebrow:'Latest news',title:'Updates from RapidLink',allLabel:'View all news',storyLabel:'Read full story'},
 }},
 products:{schema:'publicProduct',title:'Products',collection:true,content:Object.entries(products).map(([slug,data],displayOrder)=>({slug,...data,loan:Boolean(data.loan),sectionHeading:({
  'personal-loan':'Plan for life’s important moments.','business-loan':'Support your business’s next step.','group-loan':'Move forward together.','deduct-at-source-loan':'Plan repayments around your salary.',
  'fixed-deposit':'Set money aside. Plan for the term ahead.','advantage-investment':'Build your investment toward what matters.',
  'rapid-savings':'Make saving part of your everyday life.','rapid-susu':'Small contributions. Steady progress.','rapid-edu-grow':'Start saving for their next chapter.','rapid-target-savings':'Give your next goal a savings plan.',
 })[slug]||'Support for your next step.',isPublished:true,displayOrder}))},
}
