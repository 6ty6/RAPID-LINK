import {
  careersAdminConfigured,
  contentAdminConfigured,
  getPublishedNews as getSupabasePublishedNews,
  getPublishedVacancies as getSupabasePublishedVacancies,
} from '../careers'

// The public content layer treats Supabase as one replaceable repository.
// Admin authentication and editing remain in services/careers.js for now.
export const isNewsRepositoryConfigured = contentAdminConfigured
export const isVacancyRepositoryConfigured = careersAdminConfigured
export const getRemotePublishedNews = getSupabasePublishedNews
export const getRemotePublishedVacancies = getSupabasePublishedVacancies
