// Editable homepage content. Layout, animation timing and component behaviour
// intentionally remain in Home.jsx because they are interface concerns.
export const homepageContent = {
  meta: {
    title: 'Home',
    description: 'Explore RapidLink savings, loans, investments and digital banking services in Ghana.',
    image: '/assets/hero-controller-optimized.jpg',
  },
  hero: {
    accessibleLabel: 'Featured information',
    slides: [
      {
        eyebrow: 'Everyday banking',
        title: 'Build steadily. Move confidently.',
        text: 'Practical savings, loans and digital channels for the moments that matter.',
        image: '/assets/hero-controller-optimized.jpg',
        mobileImage: '/assets/hero-controller-mobile.jpg',
        link: '/rapid-savings',
        action: 'Explore savings',
      },
      {
        eyebrow: 'Customer notice',
        title: 'Issue cheques with sufficient funds.',
        text: 'Repeated dud cheques may attract financial penalties, a cheque ban and credit restrictions.',
        image: '/assets/hero-notice.jpg',
        mobileImage: '/assets/hero-notice-mobile.jpg',
        link: '/stories/bank-of-ghana-dud-cheque-sanctions',
        action: 'Read the full notice',
      },
      {
        eyebrow: 'Salary-backed credit',
        title: 'Controller loans for CAGD staff.',
        text: 'Published loan terms extend up to 60 months. Eligibility and current rates apply.',
        image: '/assets/hero-controller-optimized.jpg',
        mobileImage: '/assets/hero-controller-mobile.jpg',
        link: '/deduct-at-source-loan',
        action: 'View loan information',
      },
    ],
  },
  quickAccess: {
    eyebrow: 'Plan with confidence',
    title: 'Tools at your fingertips',
    items: [
      {
        title: 'Current Interest Rates',
        description: 'Review the current rates table',
        href: '/rates',
        icon: 'rates',
      },
      {
        title: 'Loan Calculator',
        description: 'Estimate interest and repayment',
        href: '/loan-calculator',
        icon: 'calendar',
      },
    ],
  },
  news: {
    eyebrow: 'Latest news',
    title: 'Updates from RapidLink',
    maximumItems: 3,
    allNewsLabel: 'View all news',
    allNewsHref: '/stories',
  },
  services: {
    eyebrow: 'What we provide',
    title: 'Financial tools for real life',
    introduction: 'Save consistently, access responsible credit, support your business and manage everyday banking from your phone.',
    profileLabel: 'Learn about RapidLink',
    profileHref: '/institutional-profile',
    items: [
      { label: 'Savings & deposits', href: '/rapid-savings', icon: 'savings' },
      { label: 'Micro & SME loans', href: '/business-loan', icon: 'business' },
      { label: 'Mobile and USSD banking', href: '/digital-channels', icon: 'mobile' },
    ],
  },
  products: {
    eyebrow: 'Explore products',
    title: 'A clearer route to your next step',
    detailLabel: 'View details',
    featuredKeys: [
      'rapid-savings',
      'rapid-susu',
      'rapid-edu-grow',
      'personal-loan',
      'business-loan',
      'fixed-deposit',
    ],
  },
}
