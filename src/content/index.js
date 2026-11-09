import { contentAdminConfigured, getPublishedNews, getPublishedVacancies } from '../services/careers.js'
import { localContent } from './local.js'
import { createContentRepository } from './repository.js'

// The interim Supabase service remains the adapter; a later CMS replaces this
// wiring rather than changing public components or adding staff operations here.
const content = createContentRepository({
  local: localContent,
  publicSource: contentAdminConfigured ? {
    getNews: getPublishedNews,
    getVacancies: getPublishedVacancies,
  } : null,
})

export const {
  getAnnouncements, getFaqs, getNavigation, getProducts, getProductBySlug,
  getNewsSnapshot, getVacanciesSnapshot, getNews, getNewsBySlug, getVacancies,
} = content
