// Existing public page copy only. Calculator and protected staff pages remain
// outside this migration. Hero props retain their existing PageMeta behavior.
export const pages = [
  { slug: 'faqs', hero: { eyebrow: 'Help centre', title: 'Frequently asked questions', intro: 'Clear answers to common questions about RapidLink products and services.', image: '/assets/faq-hero-v3.png' } },
  { slug: 'stories', hero: { eyebrow: 'Newsroom', title: 'News, notices and useful updates', intro: 'Stay informed about RapidLink services, customer notices and financial information.', image: '/assets/news-hero-v3.png' } },
  { slug: 'rapidlink-careers', hero: { eyebrow: 'Careers', title: 'Work with RapidLink', intro: 'Be part of an institution focused on financial inclusion in Ghana.', image: '/assets/about-careers.jpeg' } },
  { slug: 'contact', hero: { eyebrow: 'Contact', title: 'We’re here to help', intro: 'Call, email or visit one of RapidLink’s Accra branches.', image: '/assets/contact-hero-v2.png' } },
  { slug: 'rates', hero: { eyebrow: 'Savings & investments', title: 'Fixed deposit rates', intro: 'Published rates as of 19 October 2026.', image: '/assets/rates-hero-v2.png' } },
  { slug: 'rate-chart', hero: { eyebrow: 'Controller loans', title: 'Rates Chart (2025)', intro: 'View or download RapidLink’s controller (government) loan rates guide.', image: '/assets/rates-hero-v2.png' }, documentSlug: 'controller-loan-rates' },
  { slug: 'open-account', hero: { eyebrow: 'Open an account', title: 'Start your account application', intro: 'Complete the four steps below. Your sensitive details are kept in page memory and are not stored by this preview.' } },
  { slug: 'apply-loan', hero: { eyebrow: 'Loans', title: 'Loan application guidance', intro: 'RapidLink’s general online loan portal is not yet verified.' } },
  { slug: 'apply-loan-connected', hero: { eyebrow: 'Loans', title: 'Continue your loan application', intro: 'You’ll continue to RapidLink’s loan application portal.' } },
  { slug: 'digital-channels', meta: { title: 'Digital channels', description: 'Access RapidLink services from your phone.' }, hero: { title: 'Digital channels', image: '/assets/digital-channels-hero.png', imageAlt: 'Digital Products: RapidLink mobile app and RapidPay USSD' } },
  { slug: 'story-loading', meta: { title: 'Loading story', description: 'Loading the requested RapidLink story.' }, heading: 'Loading story…' },
  { slug: 'story-not-found', meta: { title: 'Story not found', description: 'The requested RapidLink story could not be found.' }, hero: { eyebrow: 'Newsroom', title: 'Story not found', intro: 'This story may have moved or is no longer available.' } },
  { slug: 'not-found', hero: { eyebrow: '404', title: 'We couldn’t find that page', intro: 'The address may have changed or the page may no longer be available.' } },
]
