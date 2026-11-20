import { test, expect } from '@playwright/test'

test('writer drafts, separate approver publishes, public page updates and withdrawn content disappears', async ({ page, request }, testInfo) => {
  const title = `Synthetic CMS question ${testInfo.project.name} ${Date.now()}`
  const answer = 'This is a synthetic test answer, created only in the local demonstration.'
  await page.goto('/cms')
  await page.getByRole('button', { name: 'Demo writer', exact: false }).click()
  await page.getByRole('button', { name: /^FAQs/ }).click()
  await page.getByRole('button', { name: 'Create faqs' }).click()
  await page.getByLabel('Title *', { exact: true }).fill(title)
  await expect(page.getByLabel('URL slug *', { exact: true })).toHaveValue(title.toLowerCase().replaceAll(' ', '-'))
  await page.getByLabel('Answer *', { exact: true }).fill(answer)
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('status').filter({hasText:'Draft saved'})).toBeVisible()
  await page.getByRole('button', { name: 'Submit for review', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0)
  let records = (await (await request.get('http://127.0.0.1:8791/api/cms/public')).json()).records
  expect(records.some(record => record.title === title)).toBeFalsy()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.getByRole('button', { name: 'Demo approver', exact: false }).click()
  await page.getByRole('button', { name: /^FAQs/ }).click()
  await page.getByRole('button', { name: title, exact: false }).click()
  await page.getByRole('button', { name: 'Approve', exact: true }).click()
  await page.getByRole('button', { name: 'Publish approved version', exact: true }).click()
  await expect(page.getByRole('status').filter({hasText:'Published public version updated'})).toBeVisible()
  await page.screenshot({path:`.cms-data/cms-${testInfo.project.name}.png`,fullPage:true})
  const publicPage = await page.context().newPage()
  await publicPage.goto('/faqs')
  await publicPage.getByText(title, {exact:true}).click()
  await expect(publicPage.getByText(answer,{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Unpublish',exact:true}).click()
  await publicPage.reload()
  await expect(publicPage.getByText(title,{exact:true})).toHaveCount(0)
  await publicPage.close()
})

test('staff workspace fits the viewport and private admin functions are absent for writers', async ({ page }) => {
  await page.goto('/cms')
  await page.getByRole('button',{name:'Demo writer',exact:false}).click()
  await expect(page.getByRole('button',{name:'Staff access',exact:true})).toHaveCount(0)
  await expect(page.getByRole('button',{name:'Export content',exact:true})).toHaveCount(0)
  await expect(page.getByRole('heading',{name:'Content workspace'})).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy()
})

test('administrator imports existing content as drafts without publishing it', async ({ page, request }) => {
  const before=(await (await request.get('http://127.0.0.1:8791/api/cms/public')).json()).records
  await page.goto('/cms')
  await page.getByRole('button',{name:'Demo administrator',exact:false}).click()
  await page.getByRole('button',{name:'Import existing content as drafts',exact:true}).click()
  await expect(page.getByRole('status').filter({hasText:'Nothing was published.'})).toBeVisible()
  const after=(await (await request.get('http://127.0.0.1:8791/api/cms/public')).json()).records
  expect(after).toEqual(before)
  await page.getByRole('button',{name:/^News/}).click()
  await page.getByRole('button',{name:/Bank of Ghana revises sanctions/}).click()
  await expect(page.getByLabel('Category *',{exact:true})).toHaveValue('Customer Notices')
  await expect(page.getByRole('button',{name:'Submit for review',exact:true})).toBeVisible()
})
