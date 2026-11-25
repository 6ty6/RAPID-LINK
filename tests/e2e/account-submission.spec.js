import { test, expect } from '@playwright/test'

test('the main account path opens the test form without sending applications', async ({ page }) => {
  let submissions = 0
  page.on('request', request => { if (request.method() === 'POST') submissions++ })
  await page.goto('/open-account')
  await expect(page.getByText(/Test form.*submissions are disabled/)).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Savings account' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Current account' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Online account opening is on its way.' })).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(submissions).toBe(0)
})
