const page=(slug,hero,listing={})=>({slug,title:hero.title,hero,listing:{eyebrow:'',title:'',description:'',searchLabel:'',...listing},departments:slug==='rapidlink-careers'?['Credit','Finance','Human Resources','Marketing/Sales','Operations','Strategy Support']:[],isPublished:true,displayOrder:0})
export const otherPageFallbacks={
 pages:{schema:'publicPageCopy',title:'Page headings',collection:true,content:[
  page('faqs',{eyebrow:'Help centre',title:'Frequently asked questions',intro:'Clear answers to common questions about RapidLink products and services.',image:'/assets/faq-hero-v3.png'}),
  page('stories',{eyebrow:'Newsroom',title:'News, notices and useful updates',intro:'Stay informed about RapidLink services, customer notices and financial information.',image:'/assets/news-hero-v3.png'},{eyebrow:'Latest updates',title:'Explore the newsroom',searchLabel:'Search news'}),
  page('rapidlink-careers',{eyebrow:'Careers',title:'Work with RapidLink',intro:'Be part of an institution focused on financial inclusion in Ghana.',image:'/assets/about-careers.jpeg'},{eyebrow:'Current opportunities',title:'Find your place on our team',description:'Explore available positions and discover where your experience can make an impact.',searchLabel:'Search by role or location'}),
  page('contact',{eyebrow:'Contact',title:'We’re here to help',intro:'Call, email or visit one of RapidLink’s Accra branches.',image:'/assets/contact-hero-v2.png'},{eyebrow:'Find a branch',title:'Visit either Accra location',description:'View both RapidLink branches on the map and choose directions to the location most convenient for you.'}),
 ]},
 loanGuidance:{schema:'publicLoanGuidance',title:'Loan application guidance',id:'rapidlink-loan-guidance',content:{
  pending:{eyebrow:'Loans',title:'Loan application guidance',intro:'RapidLink’s general online loan portal is not yet verified.',statusTitle:'Online application connection pending',description:'The existing general application page is marked “Coming Soon.” MoneyQube is verified only for one-month nano loans, so it is not used as a general application portal.',supportTitle:'Speak with the loans team',callLabel:'Call the loans team',nanoLabel:'MoneyQube nano loans'},
  connected:{eyebrow:'Loans',title:'Continue your loan application',intro:'You’ll continue to RapidLink’s loan application portal.',actionLabel:'Continue to the loan portal',notice:'No personal information is added to the link.'},
 }},
}
