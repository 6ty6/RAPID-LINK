// Exact current public copy and assets. Also seeds the first page migration.
export const digitalChannelsPage = {
  title:'Digital channels',
  description:'Access RapidLink services from your phone.',
  bannerImage:'/assets/digital-channels-hero.png',
  bannerAlt:'Digital Products: RapidLink mobile app and RapidPay USSD',
  channels:[
    {id:'mobile-app',title:'RapidLink mobile app',description:'Real-time account access, balance enquiries, fund transfers and transaction history.',image:'/assets/digital-mobile-app.png',imageAlt:'RapidLink mobile app',link:'https://play.google.com/store/apps/details?id=com.borderlessmobile.rlinkmfi&pli=1',isPublished:true},
    {id:'rapidpay-ussd',title:'RapidPay USSD',description:'Dial *899*727# on all networks to access the USSD service.',image:'/assets/digital-rapidpay-ussd.png',imageAlt:'RapidPay USSD',link:'',isPublished:true},
    {id:'mtn-merchant',title:'MTN Merchant ID',description:'Dial *170#, choose MoMoPay, then enter Merchant ID 219440. Confirm the recipient is RapidLink Microfinance Limited.',image:'/assets/digital-mtn-merchant.png',imageAlt:'MTN Merchant ID',link:'',isPublished:true},
    {id:'telecel-merchant',title:'Telecel Merchant ID',description:'Dial *110#, choose Make Payments and Pay Merchant, then enter Till number 394675. Confirm the recipient before proceeding.',image:'/assets/digital-telecel-merchant.png',imageAlt:'Telecel Merchant ID',link:'',isPublished:true},
    {id:'moneyqube',title:'MoneyQube',description:'Digital nano loans with a one-month repayment period.',image:'/assets/digital-moneyqube.png',imageAlt:'MoneyQube',link:'https://lendqubegh.loan',isPublished:true},
  ],
}
