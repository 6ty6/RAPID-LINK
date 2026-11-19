import { test, expect } from '@playwright/test'

test('account opening shows a coming-soon page without collecting information', async ({ page }) => {
  let submissions = 0
  await page.route('**/api/account-applications', route => { submissions++; return route.abort() })
  await page.goto('/open-account')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your next chapter.')
  await expect(page.getByRole('heading', { name: 'Online account opening is on its way.' })).toBeVisible()
  await expect(page.getByText('Applications cannot be submitted through this website yet.', { exact: false })).toBeVisible()
  await expect(page.locator('form, input, textarea, select')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Contact us', exact: true })).toHaveAttribute('href', '/contact')
  await expect(page.getByRole('link', { name: 'Find a branch', exact: true })).toHaveAttribute('href', '/contact#branch-map-title')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(submissions).toBe(0)
  await page.getByRole('link', { name: 'Find a branch', exact: true }).click()
  await expect(page).toHaveURL(/contact#branch-map-title$/)
  await expect(page.getByRole('heading', { name: 'Visit either Accra location' })).toBeInViewport()
})
