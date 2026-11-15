/**
 * Shared public-content shapes.
 *
 * These JSDoc contracts keep the React pages independent from the storage
 * system. A future CMS adapter should return these same shapes so pages do not
 * need to know whether content came from bundled data, Supabase or another CMS.
 */

/**
 * @typedef {Object} NewsArticle
 * @property {string} slug
 * @property {string} title
 * @property {string} category
 * @property {string} publishedAt
 * @property {string} summary
 * @property {string} image
 * @property {string} imageAlt
 * @property {boolean} [featured]
 * @property {Array<{heading?: string, paragraphs: string[]}>} sections
 * @property {string} [externalLink]
 * @property {string} [externalLabel]
 */

/**
 * @typedef {Object} Vacancy
 * @property {string} id
 * @property {string} title
 * @property {string} department
 * @property {string} location
 * @property {string} employment_type
 * @property {string} summary
 * @property {string[]} responsibilities
 * @property {'open'|'closed'} status
 * @property {boolean} is_published
 * @property {string} application_email
 */

/**
 * @typedef {Object} ContentRepository
 * @property {() => string[]} getAnnouncements
 * @property {() => Object} getBoard
 * @property {() => NewsArticle[]} getNews
 * @property {() => Vacancy[]} getVacancies
 * @property {() => Record<string, Object>} getProducts
 * @property {() => Array<[string, string]>} getFaqs
 * @property {() => Object} getHomepageContent
 * @property {() => Object} getInstitutionalProfile
 * @property {() => Array<Object>} getNavigationGroups
 * @property {() => Object} getSiteInformation
 */

export {}
