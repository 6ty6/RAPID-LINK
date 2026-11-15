import { describe, expect, it } from 'vitest'
import {
  getAnnouncements,
  getBoard,
  getFaqs,
  getHomepageContent,
  getInitialNews,
  getInitialVacancies,
  getInstitutionalProfile,
  getNavigationGroups,
  getProducts,
  getPublishedNews,
  getPublishedVacancies,
  getSiteInformation,
} from './index'

describe('public content access layer', () => {
  it('provides bundled structured content through one stable API', () => {
    expect(getAnnouncements().length).toBeGreaterThan(0)
    expect(getBoard().members).toHaveLength(3)
    expect(getBoard().members.map(member => member.displayOrder)).toEqual([1, 2, 3])
    expect(getFaqs().length).toBeGreaterThan(0)
    expect(getHomepageContent().hero.slides).toHaveLength(3)
    expect(getHomepageContent().quickAccess.items).toHaveLength(2)
    expect(getHomepageContent().products.featuredKeys).toHaveLength(6)
    expect(getInstitutionalProfile().profileParagraphs).toHaveLength(3)
    expect(getInstitutionalProfile().purpose.cards).toHaveLength(2)
    expect(getInstitutionalProfile().impact.statistics).toHaveLength(4)
    expect(getNavigationGroups().map(group => group.label)).toEqual(['Savings & Investments', 'Loans', 'About Us'])
    expect(getProducts()['rapid-savings'].title).toBe('Rapid Savings')
    expect(getSiteInformation().contact.supportLines[0].display).toBe('030 395 5183')
    expect(getSiteInformation().contact.loanSupportLines).toHaveLength(2)
    expect(getSiteInformation().branches).toHaveLength(2)
    expect(getSiteInformation().socialProfiles).toHaveLength(5)
    expect(getSiteInformation().digitalChannels).toHaveLength(5)
    expect(getInitialNews()[0]).toHaveProperty('slug')
    expect(getInitialVacancies()[0]).toHaveProperty('title')
  })

  it('uses bundled public content when a remote repository is not configured', async () => {
    await expect(getPublishedNews()).resolves.toEqual(getInitialNews())
    await expect(getPublishedVacancies()).resolves.toEqual(getInitialVacancies())
  })
})
