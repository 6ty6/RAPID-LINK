import { announcements, newsArticles, careerVacancies, products, faqs } from '../content'
import { emptyData, models } from './models'
import { localSlides } from '../pages/Home'
import { localPeople } from '../pages/Information'
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/, '')
export function bundledDrafts() {
  const records = []
  function add(kind, title, slug, data) {
    const allowed = new Set(models[kind].fields.map(field => field.key))
    records.push({ kind, title, slug, department: models[kind].department, version: 0, data: { ...emptyData(kind), ...Object.fromEntries(Object.entries(data).filter(([key]) => allowed.has(key))) } })
  }
  announcements.forEach((message, index) => add('announcement', `Announcement ${index + 1}`, `announcement-${index + 1}`, { message, order: index }))
  newsArticles.forEach(article => add('news', article.title, article.slug, article))
  careerVacancies.forEach(vacancy => add('vacancy', vacancy.title, vacancy.id, vacancy))
  Object.entries(products).forEach(([slug, product]) => add('product', product.title, slug, product))
  faqs.forEach(([question, answer], index) => add('faq', question, slugify(question), { answer, order: index }))
  localSlides.forEach((slide, index) => add('slide', slide.title, `homepage-flyer-${index + 1}`, { image: slide.image, imageAlt: slide.title, link: slide.link, order: index }))
  localPeople.forEach((person, index) => add('board', person.name, slugify(person.name), { ...person, imageAlt: person.name, order: index }))
  add('branch', 'Head Office', 'head-office', { address: '17 Farrar Avenue, Asylum Down, Accra', digital: 'GA-049-5378', phones: ['+233 30 224 7951', '+233 30 224 6657', '+233 53 373 0336'], mapQuery: 'Rapidlink Microfinance Head Office, 17 Farrar Avenue, Asylum Down, Accra, Ghana' })
  add('branch', 'Madina Branch', 'madina-branch', { address: 'Madina Taxi Rank, Madina, Accra', digital: 'GM-000-3774', phones: ['+233 30 395 5183', '+233 55 102 3151'], mapQuery: 'Rapidlink Microfinance Madina Branch, Madina Taxi Rank, Madina, Accra, Ghana' })
  add('document', 'Controller Loan Rates Guide', 'controller-loan-rates-guide', { description: 'Existing Controller loan rates guide. Confirm its current validity before publishing.', file: '/downloads/rate-chart.pdf', category: 'Loan guides' })
  add('settings', 'Official public contacts', 'official-public-contacts', { email: 'info@rapidlinkfinance.com', supportPhone: '030 395 5183', loanPhone: '053 373 0336', whatsapp: 'https://wa.me/233550584668' })
  // Existing copy is a draft source, not evidence of business approval.
  return records
}
export async function importBundledContent(request) {
  const existing = await request('/entries')
  const known = new Set(existing.map(record => `${record.kind}:${record.slug}`))
  let imported = 0, skipped = 0
  for (const record of bundledDrafts()) {
    if (known.has(`${record.kind}:${record.slug}`)) { skipped++; continue }
    await request('/entries', { method: 'POST', body: record }); imported++
  }
  return { imported, skipped }
}
