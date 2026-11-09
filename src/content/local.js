import { announcements, faqs, navGroups, products, newsArticles, careerVacancies } from '../content.js'

// Adapt the existing website data without asserting new approvals or rates.
// These local IDs are migration identifiers, not CMS UUIDs.
/** @type {import('./contracts.js').LocalContentAdapter} */
export const localContent = {
  getAnnouncements: () => announcements.map((message, index) => ({ id: `announcement-${index + 1}`, message })),
  getFaqs: () => faqs.map(([question, answer], index) => ({ id: `faq-${index + 1}`, question, answer })),
  getNavigation: () => navGroups.map(group => ({
    ...group,
    items: group.items.map(([label, href]) => ({ label, href })),
  })),
  getProducts: () => Object.entries(products).map(([slug, product]) => ({ slug, ...product })),
  getNews: () => newsArticles,
  getVacancies: () => careerVacancies,
}
