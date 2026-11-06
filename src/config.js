export const config = {
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://rapidlinkgh.com').replace(/\/$/, ''),
  generalLoanPortal: import.meta.env.VITE_GENERAL_LOAN_PORTAL_URL || '',
  moneyQubeUrl: 'https://lendqubegh.loan',
  appStoreUrl: 'https://apps.apple.com/gh/app/rapidlink-mobile/id6450372073',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.borderlessmobile.rlinkmfi&pli=1',
  accountApiBaseUrl: import.meta.env.VITE_ACCOUNT_API_BASE_URL || '',
}
