export function getMetadata({ title, description, image = '/assets/rapidlink-logo.png', noIndex = false }, pathname, siteUrl, indexable = false) {
  const origin = new URL(siteUrl)
  if (!['https:', 'http:'].includes(origin.protocol)) throw new Error('Invalid public site URL.')
  const base = siteUrl.replace(/\/$/, '')
  const restricted = ['/content-management', '/career-management', '/accept-invite', '/loan-calculator'].includes(pathname.replace(/\/$/, ''))
  return {
    title: `${title} | RapidLink Microfinance`,
    description: description || 'Savings, loans, investments and digital banking from RapidLink Microfinance Limited.',
    canonical: `${base}${pathname === '/' ? '/home' : pathname.replace(/\/$/, '')}`,
    image: new URL(image, `${base}/`).href,
    robots: noIndex || restricted || !indexable ? 'noindex, nofollow' : 'index, follow',
  }
}
