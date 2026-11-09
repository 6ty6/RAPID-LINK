import { describe, expect, it, vi } from 'vitest'
import { announcements, faqs, navGroups, products, newsArticles, careerVacancies } from '../content.js'
import { localContent } from './local.js'
import { createContentRepository } from './repository.js'

describe('public content repository', () => {
  const local = () => createContentRepository({ local: localContent })

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
