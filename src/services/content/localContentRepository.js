import {
  announcements,
  careerVacancies,
  faqs,
  navGroups,
  newsArticles,
  products,
} from '../../content'
import { boardContent } from '../../content/board'
import { homepageContent } from '../../content/home'
import { institutionalProfileContent } from '../../content/institutionalProfile'
import { siteInformation } from '../../content/site'

// This is the only module that knows where the bundled website content lives.
// It remains the safe fallback until a CMS is selected and approved.
export const getBundledAnnouncements = () => announcements
export const getBundledNews = () => newsArticles
export const getBundledVacancies = () => careerVacancies
export const getBundledProducts = () => products
export const getBundledFaqs = () => faqs
export const getBundledNavigationGroups = () => navGroups
export const getBundledBoard = () => boardContent
export const getBundledHomepageContent = () => homepageContent
export const getBundledInstitutionalProfile = () => institutionalProfileContent
export const getBundledSiteInformation = () => siteInformation
