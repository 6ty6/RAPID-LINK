import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', '')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
  vi.stubEnv('VITE_CONTENT_SOURCE', 'local')
  vi.stubEnv('VITE_DIRECTUS_URL', '')
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

  it('uses Directus public reads without changing the website content contract', async () => {
    vi.stubEnv('VITE_CONTENT_SOURCE', 'directus')
    vi.stubEnv('VITE_DIRECTUS_URL', 'https://directus.example.test/')
    vi.resetModules()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{
        slug: 'directus-story', title: 'Directus story', category: 'Company News',
        published_at: '2026-11-14', summary: 'A safe synthetic story.',
        image: 'file-uuid', image_alt: 'Synthetic test image', featured: true,
        is_published: true, sections: [{ paragraphs: ['Test paragraph.'] }],
        external_link: null, external_label: null,
      }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{
        id: 'vacancy-uuid', title: 'Synthetic vacancy', department: 'Testing',
        location: 'Accra', employment_type: 'Full-time', summary: 'Test role only.',
        responsibilities: ['Test the workflow.'], status: 'open', is_published: true,
        application_email: 'test@example.test', created_at: '2026-11-14T00:00:00Z',
      }] }) })
    vi.stubGlobal('fetch', fetchMock)
    const content = await import('./index.js')

    expect(content.getNewsSnapshot().loading).toBe(true)
    await expect(content.getNews()).resolves.toEqual([{
      slug: 'directus-story', title: 'Directus story', category: 'Company News',
      publishedAt: '2026-11-14', summary: 'A safe synthetic story.',
      image: 'https://directus.example.test/assets/file-uuid', imageAlt: 'Synthetic test image',
      featured: true, sections: [{ paragraphs: ['Test paragraph.'] }],
      externalLink: '', externalLabel: '',
    }])
    await expect(content.getVacancies()).resolves.toMatchObject([{
      id: 'vacancy-uuid', title: 'Synthetic vacancy', is_published: true,
    }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    for (const [url, options] of fetchMock.mock.calls) {
      expect(url).toMatch(/^https:\/\/directus\.example\.test\/items\/(news_articles|career_vacancies)\?/)
      expect(url).toContain('filter%5Bis_published%5D%5B_eq%5D=true')
      expect(options).toBeUndefined()
    }
  })
})
