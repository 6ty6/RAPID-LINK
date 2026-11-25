// Existing public business information, structured for reuse across the site.
// Values are unchanged by this migration and still require their normal
// departmental review before any future factual update is published.
export const siteInformation = {
  contact: {
    email: 'info@rapidlinkfinance.com',
    supportLines: [
      {
        id: 'customer-support',
        label: 'Customer support',
        mobileLabel: 'Customer support',
        display: '030 395 5183',
        href: 'tel:+233303955183',
      },
      {
        id: 'controller-sme',
        label: 'Controller / SME loans',
        mobileLabel: 'Controller / SME',
        display: '053 373 0336',
        href: 'tel:+233533730336',
      },
    ],
    loanSupportLines: [
      { display: '053 373 0336', href: 'tel:+233533730336' },
      { display: '030 224 6657', href: 'tel:+233302246657' },
    ],
  },
  branches: [
    {
      id: 'head-office',
      title: 'Head Office',
      contactTitle: 'Head office',
      address: '17 Farrar Avenue, Asylum Down, Accra',
      fullAddress: '17 Farrar Avenue, Asylum Down, Accra, Ghana',
      digitalAddress: 'GA-049-5378',
      mapName: 'Rapidlink Microfinance Head Office',
      phones: ['+233 30 224 7951', '+233 30 224 6657', '+233 53 373 0336'],
    },
    {
      id: 'madina-branch',
      title: 'Madina Branch',
      contactTitle: 'Madina branch',
      address: 'Madina Taxi Rank, Madina, Accra',
      fullAddress: 'Madina Taxi Rank, Madina, Accra, Ghana',
      digitalAddress: 'GM-000-3774',
      mapName: 'Rapidlink Microfinance Madina Branch',
      phones: ['+233 30 395 5183', '+233 55 102 3151'],
    },
  ],
  socialProfiles: [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/rapidlinkmicrofinance', icon: 'linkedin' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@rapidlink_media', icon: 'tiktok' },
    { name: 'Instagram', href: 'https://www.instagram.com/rapidlinkmicrofinance/', icon: 'instagram' },
    { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61584683032500', icon: 'facebook' },
    { name: 'X', href: 'https://x.com/rapidlink_media', icon: 'x' },
  ],
  digitalChannels: [
    {
      title: 'RapidLink mobile app',
      description: 'Real-time account access, balance enquiries, fund transfers and transaction history.',
      image: '/assets/digital-mobile-app.png',
      link: 'https://play.google.com/store/apps/details?id=com.borderlessmobile.rlinkmfi&pli=1',
    },
    {
      title: 'RapidPay USSD',
      description: 'Dial *899*727# on all networks to access the USSD service.',
      image: '/assets/digital-rapidpay-ussd.png',
    },
    {
      title: 'MTN Merchant ID',
      description: 'Dial *170#, choose MoMoPay, then enter Merchant ID 219440. Confirm the recipient is RapidLink Microfinance Limited.',
      image: '/assets/digital-mtn-merchant.png',
    },
    {
      title: 'Telecel Merchant ID',
      description: 'Dial *110#, choose Make Payments and Pay Merchant, then enter Till number 394675. Confirm the recipient before proceeding.',
      image: '/assets/digital-telecel-merchant.png',
    },
    {
      title: 'MoneyQube',
      description: 'Digital nano loans with a one-month repayment period.',
      image: '/assets/digital-moneyqube.png',
      link: 'https://lendqubegh.loan',
    },
  ],
}
