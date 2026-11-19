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
  const localImpactCounters = () => local.getInstitutionalProfile().impact.statistics
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
    getLoanCalculatorSettings: () => copy(local.getLoanCalculatorSettings()),
    getProductBySlug: slug => repository.getProducts().find(product => product.slug === slug),
    getNewsSnapshot: () => ({ records: copy(local.getNews()), loading: Boolean(publicSource) }),
    getVacanciesSnapshot: () => ({ records: copy(local.getVacancies()), loading: Boolean(publicSource) }),
    getImpactCountersSnapshot: () => ({ records: copy(localImpactCounters()), loading: Boolean(publicSource?.getImpactCounters) }),
    getFaqsSnapshot: () => ({ records: copy(local.getFaqs()), loading: Boolean(publicSource?.getFaqs) }),
    getAnnouncementsSnapshot: () => ({
      records: copy(local.getAnnouncements()),
      loading: Boolean(publicSource?.getAnnouncements),
    }),
    getSiteInformationSnapshot: () => ({
      record: copy(local.getSiteInformation()),
      loading: Boolean(publicSource?.getSiteInformation),
    }),
    getLoanCalculatorSettingsSnapshot: () => ({
      record: copy(local.getLoanCalculatorSettings()),
      loading: Boolean(publicSource?.getLoanCalculatorSettings),
    }),
    getNews: async () => copy(await (publicSource || local).getNews()),
    getNewsBySlug: async slug => (await repository.getNews()).find(article => article.slug === slug),
    getVacancies: async () => copy(await (publicSource || local).getVacancies()),
    getImpactCounters: async () => copy(await (publicSource?.getImpactCounters?.() || localImpactCounters())),
    getPublishedFaqs: async () => copy(await (publicSource?.getFaqs?.() || local.getFaqs())),
    getPublishedAnnouncements: async () => copy(await (
      publicSource?.getAnnouncements?.() || local.getAnnouncements()
    )),
    getPublishedSiteInformation: async () => {
      const localRecord = local.getSiteInformation()
      if (!publicSource?.getSiteInformation) return copy(localRecord)
      const remoteRecord = await publicSource.getSiteInformation()
      return copy({
        ...localRecord,
        ...remoteRecord,
        contact: { ...localRecord.contact, ...remoteRecord.contact },
      })
    },
    getPublishedLoanCalculatorSettings: async () => {
      const localRecord = local.getLoanCalculatorSettings()
      if (!publicSource?.getLoanCalculatorSettings) return copy(localRecord)
      const remoteRecord = await publicSource.getLoanCalculatorSettings()
      return copy({
        ...localRecord,
        ...remoteRecord,
        weeklyPaymentsByMonth: {
          ...localRecord.weeklyPaymentsByMonth,
          ...remoteRecord.weeklyPaymentsByMonth,
        },
      })
    },
  }
  return repository
}
