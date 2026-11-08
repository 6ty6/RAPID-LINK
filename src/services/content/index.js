import {
  getBundledAnnouncements,
  getBundledBoard,
  getBundledFaqs,
  getBundledHomepageContent,
  getBundledInstitutionalProfile,
  getBundledNavigationGroups,
  getBundledNews,
  getBundledProducts,
  getBundledSiteInformation,
  getBundledVacancies,
} from './localContentRepository'
import {
  getRemotePublishedNews,
  getRemotePublishedVacancies,
  isNewsRepositoryConfigured,
  isVacancyRepositoryConfigured,
} from './supabaseContentRepository'

// Stable public API used by React pages and components. Storage-specific
// imports must stay behind this boundary.
export const getAnnouncements = () => getBundledAnnouncements()
export const getBoard = () => getBundledBoard()
export const getFaqs = () => getBundledFaqs()
export const getHomepageContent = () => getBundledHomepageContent()
export const getInstitutionalProfile = () => getBundledInstitutionalProfile()
export const getNavigationGroups = () => getBundledNavigationGroups()
export const getProducts = () => getBundledProducts()
export const getSiteInformation = () => getBundledSiteInformation()

// Synchronous snapshots let pages render immediately while an approved remote
// repository is queried. They also keep the website useful if it is unavailable.
export const getInitialNews = () => getBundledNews()
export const getInitialVacancies = () => getBundledVacancies()

export const isNewsContentRemote = isNewsRepositoryConfigured
export const isVacancyContentRemote = isVacancyRepositoryConfigured

export async function getPublishedNews() {
  if (!isNewsContentRemote) return getInitialNews()
  return getRemotePublishedNews()
}

export async function getPublishedVacancies() {
  if (!isVacancyContentRemote) return getInitialVacancies()
  return getRemotePublishedVacancies()
}
