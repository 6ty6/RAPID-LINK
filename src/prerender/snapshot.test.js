import { describe, it, expect } from 'vitest'
import { localContent } from '../content/local.js'
import { publicSnapshot, serializeSnapshot } from './snapshot.js'
import { getMetadata } from './metadata.js'

describe('pre-render public data', () => {
  it('serializes only public presentation fields and neutralizes closing script tags', () => {
    const article = { ...localContent.getNews()[0], created_by: 'private-staff-id', access_token: 'never-publish', title: '</script><script>alert(1)</script>' }
    const snapshot = publicSnapshot([article], [])
    expect(snapshot.news[0]).not.toHaveProperty('created_by')
    expect(snapshot.news[0]).not.toHaveProperty('access_token')
    const json = serializeSnapshot(snapshot)
    expect(json).not.toContain('<')
    expect(JSON.parse(json)).toEqual(snapshot)
  })

  it('rejects draft, duplicate, malformed and unsafe article routes, and accepts empty published results', () => {
    const article = localContent.getNews()[0]
    for (const invalid of [{ ...article, slug: '../content-management' }, { ...article, is_published: false }, { ...article, publishedAt: '' }]) {
      expect(() => publicSnapshot([invalid], [])).toThrow()
    }
    expect(() => publicSnapshot([article, article], [])).toThrow()
    expect(() => publicSnapshot([], [{ ...localContent.getVacancies()[0], is_published: false }])).toThrow()
    expect(publicSnapshot([], [])).toEqual({ news: [], vacancies: [] })
  })

  it('generates absolute page metadata and keeps previews and protected pages noindex', () => {
    const input = { title: 'News', description: 'Published updates', image: '/assets/news-hero-v3.png' }
    expect(getMetadata(input, '/stories/', 'https://rapidlinkgh.com')).toEqual({
      title: 'News | RapidLink Microfinance', description: 'Published updates',
      canonical: 'https://rapidlinkgh.com/stories', image: 'https://rapidlinkgh.com/assets/news-hero-v3.png', robots: 'noindex, nofollow',
    })
    expect(getMetadata(input, '/stories', 'https://rapidlinkgh.com', true).robots).toBe('index, follow')
    expect(getMetadata({ ...input, noIndex: true }, '/content-management', 'https://rapidlinkgh.com', true).robots).toBe('noindex, nofollow')
  })
})
