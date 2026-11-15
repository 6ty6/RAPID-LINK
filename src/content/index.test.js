import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', '')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('configured public content adapter', () => {
  it('uses published Supabase reads and preserves the existing news field mapping', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://content.example.test')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-test-key')
    vi.resetModules()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [
        { slug: 'older', published_at: '2026-01-01', image_alt: 'Older image' },
        { slug: 'newer', published_at: '2026-02-01', image_alt: 'Newer image', external_link: 'https://example.test', external_label: 'Details' },
      ] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
    vi.stubGlobal('fetch', fetchMock)
    const content = await import('./index.js')

    expect(content.getNewsSnapshot().loading).toBe(true)
    expect(content.getVacanciesSnapshot().loading).toBe(true)
    const articles = await content.getNews()
    expect(articles.map(article => article.slug)).toEqual(['newer', 'older'])
    expect(articles[0]).toMatchObject({ publishedAt: '2026-02-01', imageAlt: 'Newer image', externalLink: 'https://example.test', externalLabel: 'Details' })
    expect(articles[1]).toMatchObject({ externalLink: '', externalLabel: '' })
    expect(await content.getVacancies()).toEqual([])

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://content.example.test/rest/v1/news_articles?select=*&is_published=eq.true&order=published_at.desc',
      'https://content.example.test/rest/v1/career_vacancies?select=*&is_published=eq.true&order=created_at.desc',
    ])
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.method).toBe('GET')
      expect(options.headers.Authorization).toBe('Bearer public-test-key')
      expect(options.body).toBeUndefined()
    }
  })
})
