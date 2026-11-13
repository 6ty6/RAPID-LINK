import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'

const manifest = JSON.parse(readFileSync('dist/prerender-manifest.json', 'utf8'))

test('missing pages and assets return real 404 responses, not redirects or SPA successes', async ({ request }) => {
  for (const path of ['/no-such-page', '/stories/no-such-story', '/content-management/not-a-route', '/assets/no-such-file.js']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(response.headers().location).toBeUndefined()
    expect(await response.text()).toContain('We couldn’t find that page')
    const head = await request.head(path)
    expect(head.status()).toBe(404)
    expect(await head.body()).toHaveLength(0)
  }
  for (const route of manifest.routes) expect((await request.get(route)).status()).toBe(200)
  for (const route of ['/content-management', '/career-management', '/accept-invite?token_hash=test-token&type=invite', '/loan-calculator', '/accept-invite/']) {
    expect((await request.get(route)).status()).toBe(200)
  }
})

test('the 404 message is usable without JavaScript and Return home still works', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  const response = await page.goto('http://127.0.0.1:4173/no-such-page')
  expect(response.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'We couldn’t find that page', level: 1 })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'Return home' }).click()
  await expect(page).toHaveURL('http://127.0.0.1:4173/home')
  await expect(page.locator('main')).toContainText('Tools at your fingertips')
  await context.close()
})

test('public pages contain real content and metadata without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/faqs')
  await expect(page.getByRole('heading', { name: 'Frequently asked questions', level: 1 })).toBeVisible()
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://rapidlinkgh.com/assets/faq-hero-v3.png')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rapidlinkgh.com/faqs')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  const story = manifest.routes.find(route => route.startsWith('/stories/'))
  if (story) {
    await page.goto(`http://127.0.0.1:4173${story}`)
    await expect(page.locator('.news-article h1')).toBeVisible()
    await expect(page.locator('.news-article-body')).not.toBeEmpty()
  }
  for (const route of ['/content-management', '/accept-invite', '/career-management', '/loan-calculator']) {
    expect(existsSync(`dist${route}/index.html`)).toBe(false)
  }
  await page.goto('http://127.0.0.1:4173/content-management')
  await expect(page.locator('#root')).toBeEmpty()
  await expect(page.locator('#public-content-snapshot')).toHaveCount(0)
  await context.close()
})

test('hydrated pages keep navigation, forms and document controls working', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' && /hydration|Minified React error #(?:418|423|425)/i.test(message.text())) errors.push(message.text())
  })
  // Keep this browser test independent of changes to the live public API.
  await page.route('**/rest/v1/**', async route => {
    const snapshot = await page.evaluate(() => JSON.parse(document.getElementById('public-content-snapshot').textContent))
    await route.fulfill({ json: route.request().url().includes('career_vacancies') ? snapshot.vacancies : snapshot.news })
  })
  await page.goto('/faqs')
  await page.locator('.accordion summary').first().click()
  await expect(page.locator('.accordion details').first()).toHaveAttribute('open', '')
  await page.goto('/home')
  await page.getByRole('button', { name: 'Next slide' }).click()
  await expect(page.getByRole('button', { name: /Show slide 2:/ })).toHaveAttribute('aria-current', 'true')
  await page.goto('/institutional-profile')
  await page.getByRole('button', { name: 'Show details for Our Vision' }).click()
  await expect(page.getByRole('button', { name: 'Show front of Our Vision' })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/open-account')
  await page.getByRole('radio', { name: 'Rapid Savings', exact: true }).check()
  await page.getByRole('button', { name: 'Next step' }).click()
  await expect(page.getByRole('group', { name: 'Personal and identification details' })).toBeVisible()
  await page.goto('/rate-chart')
  await page.getByRole('button', { name: 'View document' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/downloads/rate-chart.pdf')
  expect(errors).toEqual([])
})
