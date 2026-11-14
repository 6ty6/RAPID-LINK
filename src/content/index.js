import {
  isNewsRepositoryConfigured, getRemotePublishedNews, getRemotePublishedVacancies,
} from '../services/content/supabaseContentRepository.js'
import {
  getDirectusPublishedNews, getDirectusPublishedVacancies, isDirectusRepositoryConfigured,
} from '../services/content/directusContentRepository.js'
import { localContent } from './local.js'
import { createContentRepository } from './repository.js'

const requestedSource = (import.meta.env.VITE_CONTENT_SOURCE || 'supabase').trim().toLowerCase()
const directusSource = requestedSource === 'directus' && isDirectusRepositoryConfigured ? {
  getNews: getDirectusPublishedNews,
  getVacancies: getDirectusPublishedVacancies,
} : null
const supabaseSource = requestedSource === 'supabase' && isNewsRepositoryConfigured ? {
  getNews: getRemotePublishedNews,
  getVacancies: getRemotePublishedVacancies,
} : null

// The pages depend on one stable contract. Switching the environment value
// changes only the reader, not the React components or presentation.
const content = createContentRepository({
  local: localContent,
  publicSource: directusSource || supabaseSource,
})

export const {
  getPage, getDocuments, getDocumentBySlug, getSharedContent,
  getAnnouncements, getFaqs, getNavigation, getProducts, getProductBySlug,
  getNewsSnapshot, getVacanciesSnapshot, getNews, getNewsBySlug, getVacancies,
  getBoard, getHomepageContent, getInstitutionalProfile, getSiteInformation,
} = content
