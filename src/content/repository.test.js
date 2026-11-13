import { describe, expect, it, vi } from 'vitest'
import { announcements, faqs, navGroups, products, newsArticles, careerVacancies } from '../content.js'
import { localContent } from './local.js'
import { createContentRepository } from './repository.js'
import { boardContent } from './board.js'
import { homepageContent } from './home.js'
import { institutionalProfileContent } from './institutionalProfile.js'
import { siteInformation } from './site.js'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('public content repository', () => {
  const local = () => createContentRepository({ local: localContent })

  it('isolates shared promotional and footer edits between consumers', () => {
    const content = local()
    const shared = content.getSharedContent()
    shared.appDownload.title = 'Unexpected change'
    shared.footer.menuDescriptions.Loans = 'Unexpected change'
    shared.footer.companyLinks[0].href = '/unexpected'
    const next = content.getSharedContent()
    expect(next.appDownload.title).toBe('Banking access in your pocket')
    expect(next.footer.menuDescriptions.Loans).toBe('Explore borrowing options and loan tools.')
    expect(next.footer.companyLinks[0]).toEqual({ label: 'News', href: '/stories' })
  })

  it('returns page records without sharing mutations or inventing missing pages', () => {
    const content = local()
    const page = content.getPage('faqs')
    expect(page.hero).toEqual({
      eyebrow: 'Help centre', title: 'Frequently asked questions',
      intro: 'Clear answers to common questions about RapidLink products and services.',
      image: '/assets/faq-hero-v3.png',
    })
    page.hero.title = 'Unexpected change'
    expect(content.getPage('faqs').hero.title).toBe('Frequently asked questions')
    expect(content.getPage('missing')).toBeUndefined()
    expect(content.getPage('loan-calculator')).toBeUndefined()
  })

  it('preserves the supplied guide and resolves only existing public document assets', () => {
    const content = local()
    const guide = content.getDocumentBySlug('controller-loan-rates')
    expect(guide).toMatchObject({
      title: 'Controller Loan Rates Guide',
      dialogTitle: 'RapidLink Controller Loan Rates Guide',
      file: '/downloads/rate-chart.pdf', previewFile: '/downloads/rate-chart-preview.txt',
      approvalStatus: 'pending-verification', version: null, effectiveDate: null,
    })
    expect(existsSync(resolve('public', guide.file.slice(1)))).toBe(true)
    expect(existsSync(resolve('public', guide.previewFile.slice(1)))).toBe(true)
    guide.relatedPages.push('unexpected-page')
    expect(content.getDocumentBySlug('controller-loan-rates').relatedPages).toEqual(['rate-chart'])
    expect(content.getDocuments({ pageSlug: 'rate-chart', productSlug: 'deduct-at-source-loan', category: 'guide' })).toHaveLength(1)
    expect(content.getDocuments({ category: 'report' })).toEqual([])
    expect(content.getDocuments({ pageSlug: 'missing' })).toEqual([])
    expect(content.getDocuments({ productSlug: 'missing' })).toEqual([])
    expect(content.getDocumentBySlug('missing')).toBeUndefined()
  })

  it('excludes drafts, archived documents and missing files from lists and direct lookups', () => {
    const template = local().getDocumentBySlug('controller-loan-rates')
    const fixtures = [
      { ...template, slug: 'draft', publicationStatus: 'draft' },
      { ...template, slug: 'archived', publicationStatus: 'archived' },
      { ...template, slug: 'missing-file', file: null },
      { ...template, slug: 'empty-file', file: '  ' },
      { ...template, slug: 'no-publication-status', publicationStatus: undefined },
    ]
    const content = createContentRepository({ local: { ...localContent, getDocuments: () => [template, ...fixtures] } })
    expect(content.getDocuments()).toEqual([template])
    for (const fixture of fixtures) expect(content.getDocumentBySlug(fixture.slug)).toBeUndefined()
  })

  it('preserves the existing announcement, FAQ and navigation text and order', () => {
    const content = local()
    expect(content.getAnnouncements().map(item => item.message)).toEqual(announcements)
    expect(content.getFaqs().map(item => [item.question, item.answer])).toEqual(faqs)
    expect(content.getNavigation().map(group => ({
      ...group, items: group.items.map(item => [item.label, item.href]),
    }))).toEqual(navGroups)
  })

  it('preserves every product field and resolves known and missing slugs', () => {
    const content = local()
    expect(content.getProducts()).toEqual(Object.entries(products).map(([slug, product]) => ({ slug, ...product })))
    for (const [slug, product] of Object.entries(products)) {
      expect(content.getProductBySlug(slug)).toEqual({ slug, ...product })
    }
    expect(content.getProductBySlug('missing')).toBeUndefined()
  })

  it('preserves the remote branch extractions and isolates nested edits', () => {
    const content = local()
    expect(content.getBoard()).toEqual(boardContent)
    expect(content.getHomepageContent()).toEqual(homepageContent)
    expect(content.getInstitutionalProfile()).toEqual(institutionalProfileContent)
    expect(content.getSiteInformation()).toEqual(siteInformation)
    content.getBoard().members[0].name = 'Unexpected change'
    content.getHomepageContent().hero.slides[0].title = 'Unexpected change'
    content.getSiteInformation().contact.supportLines[0].display = 'Unexpected change'
    expect(content.getBoard()).toEqual(boardContent)
    expect(content.getHomepageContent()).toEqual(homepageContent)
    expect(content.getSiteInformation()).toEqual(siteInformation)
  })

  it('returns the bundled public content when no remote adapter is configured', async () => {
    const content = local()
    expect(content.getNewsSnapshot()).toEqual({ records: newsArticles, loading: false })
    expect(content.getVacanciesSnapshot()).toEqual({ records: careerVacancies, loading: false })
    expect(await content.getNews()).toEqual(newsArticles)
    expect(await content.getVacancies()).toEqual(careerVacancies)
    expect(await content.getNewsBySlug(newsArticles[0].slug)).toEqual(newsArticles[0])
    expect(await content.getNewsBySlug('missing')).toBeUndefined()
  })

  it('keeps consumer edits from changing shared content or later reads', async () => {
    const content = local()
    content.getProductBySlug('rapid-savings').benefits.push('Unexpected change')
    content.getNavigation()[0].items[0].label = 'Unexpected change'
    const articles = await content.getNews()
    articles[0].sections[0].paragraphs.push('Unexpected change')
    expect(content.getProductBySlug('rapid-savings').benefits).toEqual(products['rapid-savings'].benefits)
    expect(content.getNavigation()[0].items[0].label).toBe(navGroups[0].items[0][0])
    expect(await content.getNews()).toEqual(newsArticles)
  })

  it('uses remote public results while retaining the initial local loading snapshot', async () => {
    const remoteNews = [{ ...newsArticles[0], title: 'Remote story' }]
    const remoteVacancies = [{ ...careerVacancies[0], title: 'Remote vacancy' }]
    const publicSource = {
      getNews: vi.fn().mockResolvedValue(remoteNews),
      getVacancies: vi.fn().mockResolvedValue(remoteVacancies),
    }
    const content = createContentRepository({ local: localContent, publicSource })
    expect(content.getNewsSnapshot()).toEqual({ records: newsArticles, loading: true })
    expect(content.getVacanciesSnapshot()).toEqual({ records: careerVacancies, loading: true })
    expect(await content.getNews()).toEqual(remoteNews)
    expect(await content.getVacancies()).toEqual(remoteVacancies)
    expect(await content.getNewsBySlug(remoteNews[0].slug)).toEqual(remoteNews[0])
    expect(publicSource.getVacancies).toHaveBeenCalledWith()
    expect(publicSource.getNews).toHaveBeenCalledWith()
  })

  it('honours empty remote results and propagates failures without restoring local records', async () => {
    const publicSource = { getNews: vi.fn().mockResolvedValue([]), getVacancies: vi.fn().mockResolvedValue([]) }
    const content = createContentRepository({ local: localContent, publicSource })
    expect(await content.getNews()).toEqual([])
    expect(await content.getVacancies()).toEqual([])
    expect(await content.getNewsBySlug(newsArticles[0].slug)).toBeUndefined()
    publicSource.getNews.mockRejectedValue(new Error('Offline'))
    publicSource.getVacancies.mockRejectedValue(new Error('Offline'))
    await expect(content.getNews()).rejects.toThrow('Offline')
    await expect(content.getVacancies()).rejects.toThrow('Offline')
  })
})
