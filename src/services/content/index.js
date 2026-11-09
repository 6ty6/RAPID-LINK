import * as content from '../../content/index.js'

// Compatibility for the interface introduced on the other computer. All reads
// delegate to the same repository; new public consumers use content/index.js.
export const getAnnouncements = () => content.getAnnouncements().map(item => item.message)
export const getFaqs = () => content.getFaqs().map(item => [item.question, item.answer])
export const getNavigationGroups = () => content.getNavigation().map(group => ({
  ...group, items: group.items.map(item => [item.label, item.href]),
}))
export const getProducts = () => Object.fromEntries(content.getProducts().map(({ slug, ...product }) => [slug, product]))
export const getBoard = content.getBoard
export const getHomepageContent = content.getHomepageContent
export const getInstitutionalProfile = content.getInstitutionalProfile
export const getSiteInformation = content.getSiteInformation
export const getInitialNews = () => content.getNewsSnapshot().records
export const getInitialVacancies = () => content.getVacanciesSnapshot().records
export const isNewsContentRemote = content.getNewsSnapshot().loading
export const isVacancyContentRemote = content.getVacanciesSnapshot().loading
export const getPublishedNews = content.getNews
export const getPublishedVacancies = content.getVacancies
