import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.stubEnv('VITE_CONTENT_SOURCE', 'local')
  vi.stubEnv('VITE_SUPABASE_URL', '')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
  vi.stubEnv('VITE_SANITY_PROJECT_ID', '')
  vi.stubEnv('VITE_SANITY_DATASET', 'production')
  vi.stubEnv('VITE_SANITY_API_VERSION', '2026-11-14')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('configured public content adapter', () => {
  it('uses published Supabase reads and preserves the existing news field mapping', async () => {
    vi.stubEnv('VITE_CONTENT_SOURCE', 'supabase')
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

  it('uses token-free Sanity public reads and maps records to the existing page contract', async () => {
    vi.stubEnv('VITE_CONTENT_SOURCE', 'sanity')
    vi.stubEnv('VITE_SANITY_PROJECT_ID', 'rapidlinktest')
    vi.stubEnv('VITE_SANITY_DATASET', 'production')
    vi.stubEnv('VITE_SANITY_API_VERSION', '2026-11-14')
    vi.resetModules()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{
        id: 'article-1', slug: 'sanity-story', title: 'Sanity story', category: 'Company News',
        publishedAt: '2026-11-14', summary: 'A public test story.', image: 'https://cdn.sanity.io/image.jpg',
        imageAlt: 'Test image', sections: [{ heading: 'Update', paragraphs: ['Details'] }],
      }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{
        id: 'vacancy-1', title: 'Test role', department: 'Operations', location: 'Accra',
        employmentType: 'Full-time', summary: 'Test vacancy', responsibilities: ['Test safely'],
        status: 'open', isPublished: true, applicationEmail: 'careers@example.test',
      }] }) })
    vi.stubGlobal('fetch', fetchMock)
    const content = await import('./index.js')

    expect((await content.getNews())[0]).toMatchObject({
      slug: 'sanity-story', imageAlt: 'Test image', externalLink: '', externalLabel: '', featured: false,
    })
    expect((await content.getVacancies())[0]).toMatchObject({
      id: 'vacancy-1', employment_type: 'Full-time', is_published: true,
      application_email: 'careers@example.test',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    for (const [url, options] of fetchMock.mock.calls) {
      const endpoint = new URL(url)
      expect(endpoint.origin).toBe('https://rapidlinktest.apicdn.sanity.io')
      expect(endpoint.pathname).toBe('/v2026-11-14/data/query/production')
      expect(endpoint.searchParams.get('perspective')).toBe('published')
      expect(endpoint.searchParams.get('query')).toContain('isPublished == true')
      expect(options).toEqual({ method: 'GET', headers: { Accept: 'application/json' } })
    }
  })
})
