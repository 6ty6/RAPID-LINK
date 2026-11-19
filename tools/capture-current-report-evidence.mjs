import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const outputDirectory = new URL('../docs/evidence/current-update/', import.meta.url)
await mkdir(outputDirectory, { recursive: true })

const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 })
  await page.goto('http://127.0.0.1:4173/loan-calculator', { waitUntil: 'networkidle' })
  await page.locator('#principal-amount').fill('10000')
  await page.locator('#loan-duration').selectOption('6')
  await page.locator('#repayment-frequency').selectOption('monthly')
  await page.getByRole('button', { name: /calculate/i }).click()
  await page.locator('.calculator-layout').screenshot({
    path: fileURLToPath(new URL('Loan Calculator - Completed Estimate.png', outputDirectory)),
  })

  const studio = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await studio.goto('http://localhost:3333', { waitUntil: 'domcontentloaded', timeout: 120000 })
  await studio.waitForTimeout(8000)
  await studio.screenshot({
    path: fileURLToPath(new URL('Sanity CMS - Current Interface.png', outputDirectory)),
    fullPage: false,
  })
} finally {
  await browser.close()
}
