import {
  getBundledAnnouncements, getBundledFaqs, getBundledNavigationGroups,
  getBundledProducts, getBundledNews, getBundledVacancies,
  getBundledBoard, getBundledHomepageContent, getBundledInstitutionalProfile,
  getBundledSiteInformation,
} from '../services/content/localContentRepository.js'
import { pages } from './pages.js'
import { documents } from './documents.js'
import { sharedContent } from './shared.js'

// Adapt the existing website data without asserting new approvals or rates.
// These local IDs are migration identifiers, not CMS UUIDs.
/** @type {import('./contracts.js').LocalContentAdapter} */
export const localContent = {
  getSharedContent: () => sharedContent,
  getPages: () => pages,
  getDocuments: () => documents,
  getAnnouncements: () => getBundledAnnouncements().map((message, index) => ({ id: `announcement-${index + 1}`, message })),
  getFaqs: () => getBundledFaqs().map(([question, answer], index) => ({ id: `faq-${index + 1}`, question, answer })),
  getNavigation: () => getBundledNavigationGroups().map(group => ({
    ...group,
    items: group.items.map(([label, href]) => ({ label, href })),
  })),
  getProducts: () => Object.entries(getBundledProducts()).map(([slug, product]) => ({ slug, ...product })),
  getNews: getBundledNews,
  getVacancies: getBundledVacancies,
  getBoard: getBundledBoard,
  getHomepageContent: getBundledHomepageContent,
  getInstitutionalProfile: getBundledInstitutionalProfile,
  getSiteInformation: getBundledSiteInformation,
}
