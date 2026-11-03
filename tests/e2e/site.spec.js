import { expect, test } from '@playwright/test'

test('publishes RapidLink favicon and searchable site metadata', async ({ page, request }) => {
  await page.goto('/home')
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg')
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  expect((await request.get('/favicon.svg')).ok()).toBe(true)
  expect((await request.get('/site.webmanifest')).ok()).toBe(true)
})

test('desktop navigation and direct product route work', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.goto('/rapid-savings')
  await expect(page.getByRole('heading', { level: 1, name: 'Rapid Savings' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open an Account', exact: true }).first()).toBeVisible()
})

test('mobile menu is operable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile')
  await page.goto('/home')
  await expect(page.locator('.mobile-header-utility')).toBeVisible()
  await expect(page.locator('.mobile-header-utility').getByRole('link', { name: /Customer support/ })).toHaveAttribute('href', 'tel:+233303955183')
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('link', { name: 'Digital Channels', exact: true }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open an Account', exact: true }).last()).toBeVisible()
  const loansGroup = page.locator('.nav-group').filter({ has: page.locator('.nav-group-link[href="/personal-loan"]') })
  await page.getByRole('button', { name: 'Toggle Loans menu' }).click()
  await expect(loansGroup.locator('.nav-dropdown')).toBeVisible()
  await page.locator('.menu-toggle').click()
  await expect(loansGroup.locator('.nav-dropdown')).toBeHidden()
})

test('mobile contact header does not alter the desktop header', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.goto('/home')
  await expect(page.locator('.mobile-header-utility')).toBeHidden()
  await expect(page.locator('.header-right')).toBeVisible()
})

test('desktop dropdown labels navigate, open on hover and close outside', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.goto('/home')
  const loansGroup = page.locator('.nav-group').filter({ has: page.locator('.nav-group-link[href="/personal-loan"]') })
  await expect(loansGroup.locator('.nav-group-link')).toHaveAttribute('href', '/personal-loan')
  await loansGroup.hover()
  await expect(loansGroup.locator('.nav-dropdown')).toBeVisible()
  await page.locator('.hero').click({ position: { x: 20, y: 250 } })
  await expect(loansGroup.locator('.nav-dropdown')).toBeHidden()
})

test('slider and account form first step work', async ({ page }) => {
  await page.goto('/home')
  await page.getByRole('button', { name: 'Next slide' }).click()
  await expect(page.getByRole('heading', { name: 'Issue cheques with sufficient funds.', includeHidden: true })).toBeAttached()
  await page.goto('/open-account')
  await page.getByRole('radio', { name: 'Rapid Savings' }).check()
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.getByRole('group', { name: 'Personal and identification details' })).toBeVisible()
})

test('mobile slider starts with its text while desktop keeps the image-first delay', async ({ page }, testInfo) => {
  await page.goto('/home')
  const sliderCopy = page.locator('.hero-content')
  await expect(sliderCopy).toHaveAttribute('aria-hidden', testInfo.project.name === 'mobile' ? 'false' : 'true')
})

test('homepage tools and connected news lead to the intended pages', async ({ page }) => {
  await page.goto('/home')
  const brandColors = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement)
    return { blue: styles.getPropertyValue('--blue').trim(), orange: styles.getPropertyValue('--orange').trim() }
  })
  expect(brandColors).toEqual({ blue: '#0831ff', orange: '#ff7400' })
  await expect(page.locator('.header-actions .button:not(.button-secondary)')).toHaveCSS('background-color', 'rgb(8, 49, 255)')
  const announcementBar = page.getByRole('complementary', { name: 'RapidLink announcements' })
  await expect(announcementBar).toBeVisible()
  await expect(announcementBar.locator('a')).toHaveCount(0)
  await expect(announcementBar.locator('.announcement-track')).toHaveCSS('animation-duration', '110s')
  await expect(page.locator('.quick-access-card[href="/rates"]')).toContainText('Current Interest Rates')
  await expect(page.locator('.quick-access-card[href="/loan-calculator"]')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Read Bank of Ghana revises sanctions for dud cheques' })).toHaveAttribute('href', '/stories/bank-of-ghana-dud-cheque-sanctions')
  await expect(page.getByRole('button', { name: 'Downloadables' })).toHaveCount(0)

  await page.goto('/deduct-at-source-loan')
  await expect(page.locator('.product-action a[href="https://rapidlinkfinance.com/loanform"]')).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Loan Rates Guide' })).toHaveAttribute('href', '/rate-chart')
})

test('key information pages use compact banking image headers', async ({ page }, testInfo) => {
  const pages = [
    ['/stories', '/assets/news-hero-v3.png'],
    ['/faqs', '/assets/faq-hero-v3.png'],
    ['/contact', '/assets/contact-hero-v2.png'],
    ['/fixed-deposit', '/assets/fixed-deposit-hero-v2.png'],
    ['/rates', '/assets/rates-hero-v2.png'],
    ['/loan-calculator', '/assets/loan-calculator-hero-v2.png'],
  ]

  for (const [route, image] of pages) {
    await page.goto(route)
    const hero = page.locator('.page-hero.has-image')
    await expect(hero.locator(`img[src="${image}"]`)).toBeVisible()
    const box = await hero.boundingBox()
    expect(box.height).toBeLessThanOrEqual(testInfo.project.name === 'mobile' ? 321 : 401)
  }
})

test('contact page presents both branches with separate directions', async ({ page }) => {
  await page.goto('/contact')
  const map = page.getByTitle('Map showing RapidLink Head Office and Madina Branch')
  await expect(map).toBeVisible()
  await expect(map).toHaveAttribute('loading', 'lazy')
  await expect(map).toHaveAttribute('src', /Rapidlink%20Microfinance%20Head%20Office%2C%2017%20Farrar%20Avenue/)
  await expect(map).toHaveAttribute('src', /Rapidlink%20Microfinance%20Madina%20Branch%2C%20Madina%20Taxi%20Rank/)
  await expect(page.getByRole('link', { name: /Directions to Head Office/ })).toHaveAttribute('href', /google\.com\/maps\/dir/)
  await expect(page.getByRole('link', { name: /Directions to Madina Branch/ })).toHaveAttribute('href', /Rapidlink%20Microfinance%20Madina%20Branch/)
})

test('loan calculator and controller rate guide retain their functionality', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error))
  await page.goto('/loan-calculator')
  await page.getByLabel('Principal Amount').fill('1000')
  await page.getByLabel('Loan Duration (Months)').fill('2')
  await page.getByRole('button', { name: 'Calculate' }).click()
  await expect(page.getByText('GHC 120.00')).toBeVisible()
  await expect(page.getByText('GHC 1120.00')).toBeVisible()

  await page.goto('/rate-chart')
  await page.getByRole('button', { name: 'View document' }).click()
  await expect(page.getByRole('dialog', { name: 'RapidLink Controller Loan Rates Guide' })).toBeVisible()
  await expect(page.locator('.pdf-page canvas').first()).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('The document preview could not be loaded.')).toHaveCount(0)
  await page.getByRole('button', { name: 'Close rates guide' }).click()
  await expect(page.getByRole('dialog', { name: 'RapidLink Controller Loan Rates Guide' })).toHaveCount(0)
  if (pageErrors.length) throw pageErrors[0]
  await expect(page.getByRole('heading', { level: 1, name: 'Rates Chart (2025)' })).toBeVisible()
  await page.getByRole('button', { name: 'View document' }).click()
  await expect(page.locator('.pdf-page canvas').first()).toBeVisible({ timeout: 15_000 })
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1, name: 'Loan Calculator' })).toBeVisible()
  expect(pageErrors).toEqual([])
})
