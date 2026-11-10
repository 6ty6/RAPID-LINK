// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { prepareContent, getRoutes, renderPage, renderNotFound } from '../entry-server.jsx'
import * as content from '../content/index.js'

describe('server pre-rendering', () => {
  it('builds the existing error message as noindex HTML without public content', () => {
    const result = renderNotFound()
    expect(result.html).toContain('We couldn’t find that page')
    expect(result.html).toContain('Return home')
    expect(result.html).not.toContain('Deposit Mobilization Lead')
    expect(result.metadata.robots).toBe('noindex, nofollow')
  })
  it('renders complete news and vacancy content with matching page metadata', async () => {
    const snapshot = await prepareContent('bundled')
    const story = snapshot.news[0]
    const result = renderPage(`/stories/${story.slug}`, snapshot)
    expect(result.html).toContain(story.title)
    expect(result.html).toContain('Third offence within one year')
    expect(result.html).not.toContain('Loading story')
    expect(result.metadata.canonical).toBe(`https://rapidlinkgh.com/stories/${story.slug}`)
    expect(result.metadata.image).toBe(`https://rapidlinkgh.com${story.image}`)
    const careers = renderPage('/rapidlink-careers', snapshot)
    expect(careers.html).toContain(snapshot.vacancies[0].title)
    expect(careers.html).not.toContain('Loading approved')
  })

  it('only renders allow-listed public routes', async () => {
    const snapshot = await prepareContent('bundled')
    const routes = getRoutes(snapshot)
    expect(routes).toContain('/rapid-savings')
    for (const path of ['/content-management', '/career-management', '/accept-invite', '/loan-calculator', '/missing']) {
      expect(routes).not.toContain(path)
      expect(() => renderPage(path, snapshot)).toThrow('Route is not approved')
    }
  })

  it('fails on configured content retrieval errors rather than substituting bundled records', async () => {
    vi.spyOn(content, 'getNews').mockRejectedValue(new Error('Public API unavailable'))
    await expect(prepareContent('configured')).rejects.toThrow('Public API unavailable')
    await expect(prepareContent('unknown')).rejects.toThrow('Unknown pre-render content source')
  })
})
