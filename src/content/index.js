import {
  isNewsRepositoryConfigured, getRemotePublishedNews, getRemotePublishedVacancies,
} from '../services/content/supabaseContentRepository.js'
import {
  isSanityRepositoryConfigured, getSanityPublishedNews, getSanityPublishedVacancies,
} from '../services/content/sanityContentRepository.js'
import { localContent } from './local.js'
import { createContentRepository } from './repository.js'

const requestedSource = (import.meta.env.VITE_CONTENT_SOURCE || 'supabase').toLowerCase()
const sanitySource = isSanityRepositoryConfigured ? {
  getNews: getSanityPublishedNews,
  getVacancies: getSanityPublishedVacancies,
} : null
const supabaseSource = isNewsRepositoryConfigured ? {
  getNews: getRemotePublishedNews,
  getVacancies: getRemotePublishedVacancies,
} : null

// Public pages consume one stable contract. Changing CMS only changes this
// adapter selection; it does not require page or component rewrites.
const content = createContentRepository({
  local: localContent,
  publicSource: requestedSource === 'sanity' ? sanitySource
    : requestedSource === 'supabase' ? supabaseSource
      : null,
})

export const {
  getPage, getDocuments, getDocumentBySlug, getSharedContent,
  getAnnouncements, getFaqs, getNavigation, getProducts, getProductBySlug,
  getNewsSnapshot, getVacanciesSnapshot, getNews, getNewsBySlug, getVacancies,
  getBoard, getHomepageContent, getInstitutionalProfile, getSiteInformation,
} = content
