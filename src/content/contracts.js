/**
 * Public read contracts for the first adapter. These are presentation records,
 * not database models or proof of departmental approval. Governance, workflow
 * and approval fields remain defined in docs/rapidlink-content-models.md.
 * Remaining page/entity contracts below are reserved for later extraction;
 * this stage does not invent records, prices, approval dates or opening hours.
 *
 * @typedef {{id: string, message: string}} Announcement
 * @typedef {{id: string, question: string, answer: string}} Faq
 * @typedef {{label: string, href: string}} NavigationLink
 * @typedef {{label: string, href: string, items: NavigationLink[]}} NavigationGroup
 * @typedef {{slug: string, category: string, title: string, intro: string,
 *   heroImage: string, image: string, imageAlt: string, benefits: string[],
 *   requirements: string[], loan?: boolean}} Product
 * @typedef {{heading?: string, paragraphs: string[]}} NewsSection
 * @typedef {{slug: string, title: string, category: string, publishedAt: string,
 *   summary: string, image: string, imageAlt: string, featured?: boolean,
 *   sections: NewsSection[], externalLink?: string, externalLabel?: string}} NewsArticle
 * @typedef {{id: string, title: string, department: string, location: string,
 *   employment_type: string, summary: string, responsibilities: string[],
 *   status: string, is_published: boolean, application_email: string}} Vacancy
 * @typedef {{records: Array<NewsArticle>, loading: boolean}} NewsSnapshot
 * @typedef {{records: Array<Vacancy>, loading: boolean}} VacancySnapshot
 * @typedef {{getAnnouncements: () => Announcement[], getFaqs: () => Faq[],
 *   getSharedContent: () => typeof import('./shared.js').sharedContent,
 *   getPages: () => Page[], getDocuments: () => PublicDocument[],
 *   getNavigation: () => NavigationGroup[], getProducts: () => Product[],
 *   getNews: () => NewsArticle[], getVacancies: () => Vacancy[],
 *   getBoard: () => typeof import('./board.js').boardContent,
 *   getHomepageContent: () => typeof import('./home.js').homepageContent,
 *   getInstitutionalProfile: () => typeof import('./institutionalProfile.js').institutionalProfileContent,
 *   getSiteInformation: () => typeof import('./site.js').siteInformation}} LocalContentAdapter
 * @typedef {{getNews: () => Promise<NewsArticle[]>,
 *   getVacancies: () => Promise<Vacancy[]>}} PublicContentAdapter
 *
 * @typedef {{title: string, eyebrow?: string, intro?: string, image?: string,
 *   imageAlt?: string}} PageHero
 * @typedef {{slug: string, hero?: PageHero, documentSlug?: string, heading?: string,
 *   meta?: {title: string, description: string, image?: string}}} Page
 * @typedef {{slug: string, title: string, description: string, category: string,
 *   file: string | null, previewFile?: string | null, dialogTitle?: string,
 *   publicationStatus: 'draft' | 'published' | 'archived',
 *   approvalStatus: 'pending-verification' | 'approved',
 *   version: string | null, effectiveDate: string | null,
 *   relatedPages: string[], relatedProducts: string[]}} PublicDocument
 *
 * Reserved standalone contracts for later migration:
 * @typedef {{slug: string, title: string, address: string, digital: string,
 *   phones: string[], mapQuery: string}} Branch
 * @typedef {{id: string, label: string, value: string, href: string}} OfficialContact
 * @typedef {{name: string, href: string, icon: string}} SocialProfile
 * @typedef {{slug: string, name: string, role: string, portrait: string,
 *   biography: string[]}} BoardMember
 * @typedef {{slug: string, title: string, description: string, image: string,
 *   href?: string}} DigitalChannel
 */

export {}
