import {
  isNewsRepositoryConfigured, getRemotePublishedNews, getRemotePublishedVacancies,
} from '../services/content/supabaseContentRepository.js'
import { localContent } from './local.js'
import { createContentRepository } from './repository.js'

// The interim Supabase service remains the adapter; a later CMS replaces this
// wiring rather than changing public components or adding staff operations here.
const content = createContentRepository({
  local: localContent,
  publicSource: isNewsRepositoryConfigured ? {
    getNews: getRemotePublishedNews,
    getVacancies: getRemotePublishedVacancies,
  } : null,
})

export const {
  getPage, getDocuments, getDocumentBySlug, getSharedContent,
  getAnnouncements, getFaqs, getNavigation, getProducts, getProductBySlug,
  getNewsSnapshot, getVacanciesSnapshot, getNews, getNewsBySlug, getVacancies,
  getBoard, getHomepageContent, getInstitutionalProfile, getSiteInformation,
} = content
