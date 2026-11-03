import { expect, test } from '@playwright/test'

const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 900 },
  { name: '1440', width: 1440, height: 1000 },
]

for (const viewport of viewports) {
  test(`homepage renders at ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/home')
    await expect(page.getByRole('heading', { name: 'Build steadily. Move confidently.', includeHidden: true })).toBeAttached()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
    await page.screenshot({ path: `test-results/home-${viewport.name}.png`, fullPage: true })
  })
}

test('personal-loan image and compact cards render responsively', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  for (const viewport of [
    { name: '390', width: 390, height: 844 },
    { name: '1024', width: 1024, height: 900 },
    { name: '1440', width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/personal-loan')
    await expect(page.locator('.product-feature-image img')).toBeVisible()
    await expect(page.locator('.product-info-card')).toHaveCount(2)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow).toBe(false)
    await page.screenshot({ path: `test-results/personal-loan-${viewport.name}.png`, fullPage: true })
  }
})

test('savings and investment image layouts render responsively', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  for (const product of [
    { slug: 'rapid-savings', image: '/assets/rapid-savings.jpg' },
    { slug: 'fixed-deposit', image: '/assets/fixed-deposit.webp' },
  ]) {
    for (const viewport of [
      { name: '390', width: 390, height: 844 },
      { name: '1440', width: 1440, height: 1000 },
    ]) {
      await page.setViewportSize(viewport)
      await page.goto(`/${product.slug}`)
      await expect(page.locator('.product-feature-image img')).toHaveAttribute('src', product.image)
      await expect(page.locator('.product-info-card')).toHaveCount(2)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(overflow).toBe(false)
      await page.screenshot({ path: `test-results/${product.slug}-${viewport.name}.png`, fullPage: true })
    }
  }
})

test('digital channels and profile counters render responsively', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  for (const viewport of [
    { name: '390', width: 390, height: 844 },
    { name: '1440', width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/digital-channels')
    await expect(page.locator('.digital-card')).toHaveCount(5)
    await expect(page.locator('.digital-card-image img')).toHaveCount(5)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
    await page.screenshot({ path: `test-results/digital-channels-${viewport.name}.png`, fullPage: true })

    await page.goto('/institutional-profile')
    await page.locator('.impact-section').scrollIntoViewIfNeeded()
    await expect(page.locator('.impact-stat')).toHaveCount(4)
    await expect(page.locator('.impact-stat').nth(1).getByText('7,000+')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `test-results/institutional-profile-${viewport.name}.png`, fullPage: true })
  }
})

test('official board portraits render responsively', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  for (const viewport of [
    { name: '390', width: 390, height: 844 },
    { name: '1440', width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/board-of-directors')
    await expect(page.locator('.person-image img')).toHaveCount(3)
    await expect(page.locator('.person-info-button')).toHaveCount(3)
    await expect(page.getByRole('heading', { name: 'Dr. Emmanuel Debrah' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
    await page.screenshot({ path: `test-results/board-of-directors-${viewport.name}.png`, fullPage: true })
    await page.getByRole('button', { name: 'View profile for Dr. Emmanuel Debrah' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.screenshot({ path: `test-results/board-biography-${viewport.name}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Close biography' }).click()
  }
})

test('official About Us headers stay aligned across viewports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')

  const pages = [
    { slug: 'institutional-profile', image: '/assets/about-institutional-profile.jpg' },
    { slug: 'board-of-directors', image: '/assets/about-board-directors.jpg' },
    { slug: 'rapidlink-careers', image: '/assets/about-careers.jpeg' },
  ]

  for (const viewport of [
    { name: '390', width: 390, height: 844 },
    { name: '1440', width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    for (const aboutPage of pages) {
      await page.goto(`/${aboutPage.slug}`)
      const image = page.locator('.about-hero img')
      await expect(image).toHaveAttribute('src', aboutPage.image)
      await expect(image).toBeVisible()
      expect(await image.evaluate(node => node.naturalWidth > 0 && node.naturalHeight > 0)).toBe(true)
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
      await page.screenshot({ path: `test-results/${aboutPage.slug}-header-${viewport.name}.png`, fullPage: false })
    }
  }
})
