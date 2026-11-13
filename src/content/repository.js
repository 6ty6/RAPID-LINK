const copy = value => structuredClone(value)

/**
 * Public reads only. An adapter supplies getNews()/getVacancies(); staff writes
 * and authentication deliberately remain outside this repository.
 * Local content is the initial UI snapshot, never a substitute for a successful
 * empty remote response. Remote failures propagate to the existing UI.
 * @param {{local: import('./contracts.js').LocalContentAdapter,
 *   publicSource?: import('./contracts.js').PublicContentAdapter | null}} adapters
 */
export function createContentRepository({ local, publicSource = null }) {
  const repository = {
    getSharedContent: () => copy(local.getSharedContent()),
    getPage: slug => copy(local.getPages().find(page => page.slug === slug)),
    getDocuments: ({ category, pageSlug, productSlug } = {}) => copy(local.getDocuments().filter(document =>
      document.publicationStatus === 'published' && typeof document.file === 'string' && document.file.trim() &&
      (!category || document.category === category) &&
      (!pageSlug || document.relatedPages?.includes(pageSlug)) &&
      (!productSlug || document.relatedProducts?.includes(productSlug))
    )),
    getDocumentBySlug: slug => repository.getDocuments().find(document => document.slug === slug),
    getAnnouncements: () => copy(local.getAnnouncements()),
    getFaqs: () => copy(local.getFaqs()),
    getNavigation: () => copy(local.getNavigation()),
    getProducts: () => copy(local.getProducts()),
    getBoard: () => copy(local.getBoard()),
    getHomepageContent: () => copy(local.getHomepageContent()),
    getInstitutionalProfile: () => copy(local.getInstitutionalProfile()),
    getSiteInformation: () => copy(local.getSiteInformation()),
    getProductBySlug: slug => repository.getProducts().find(product => product.slug === slug),
    getNewsSnapshot: () => ({ records: copy(local.getNews()), loading: Boolean(publicSource) }),
    getVacanciesSnapshot: () => ({ records: copy(local.getVacancies()), loading: Boolean(publicSource) }),
    getNews: async () => copy(await (publicSource || local).getNews()),
    getNewsBySlug: async slug => (await repository.getNews()).find(article => article.slug === slug),
    getVacancies: async () => copy(await (publicSource || local).getVacancies()),
  }
  return repository
}
