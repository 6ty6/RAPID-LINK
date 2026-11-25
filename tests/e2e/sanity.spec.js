import { test, expect } from '@playwright/test'
import { siteInformation } from '../../src/content/site.js'
import { loanCalculatorSettings } from '../../src/content/loanCalculator.js'
import { digitalChannelsPage } from '../../src/content/digitalChannels.js'

async function mockSanity(page, { empty = false, fail = false, apiDown = false } = {}) {
  await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//, async route => {
    const url = new URL(route.request().url())
    expect(url.searchParams.get('perspective')).toBe('published')
    const query = url.searchParams.get('query')
    let result = []
    if (query.includes('_type == "newsArticle"') && !empty) result = [{id:'news-test',slug:'sanity-published-news',title:'Sanity published news',category:'Customer Notices',publishedAt:'2026-11-25',summary:'Published website update.',image:'/assets/hero-notice.jpg',sections:[{heading:'Published details',paragraphs:['This text came from Sanity.']}]}]
    if (query.includes('_type == "careerVacancy"') && !empty) result = [{id:'job-test',title:'Sanity Credit Officer',department:'Credit',location:'Accra',employmentType:'Full-time',summary:'Published vacancy.',responsibilities:['Assist customers.'],status:'open',isPublished:true,applicationEmail:'jobs@example.test'}]
    if (query.includes('_type == "faq"') && !empty) result = [{id:'faq-test',question:'Sanity FAQ question?',answer:'Published FAQ answer.'}]
    if (query.includes('_type == "announcement"') && !empty) result = [{id:'notice-test',message:'Sanity published announcement'}]
    if (query.includes('_type == "siteSettings"')) result = [{...siteInformation.contact,branches:siteInformation.branches,socialProfiles:siteInformation.socialProfiles,email:'sanity-contact@example.test'}]
    if (query.includes('_type == "sharedSettings"')) result = [{appTitle:'Sanity app promotion',footerDescription:'Sanity footer description'}]
    if (query.includes('_type == "loanCalculatorSettings"')) result = [{...loanCalculatorSettings,maximumPrincipal:12000,weeklySchedule:Object.entries(loanCalculatorSettings.weeklyPaymentsByMonth).map(([months,payments])=>({months:Number(months),payments}))}]
    await route.fulfill({status:fail || (apiDown && url.hostname.includes('.api.')) ? 503 : 200,contentType:'application/json',body:JSON.stringify({result})})
  })
}
const ready = page => expect(page.locator('#site-loader')).toBeHidden({timeout:15000})

test('digital channels preserves the page design, reads CMS ordering and respects hidden cards',async({page})=>{
  await mockSanity(page)
  let content={...digitalChannelsPage,channels:[...digitalChannelsPage.channels].reverse()}
  let unavailable=false
  await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//,async route=>{
    if(!new URL(route.request().url()).searchParams.get('query').includes('_type == "digitalChannelsPage"')) return route.fallback()
    await route.fulfill({status:unavailable?503:200,contentType:'application/json',body:JSON.stringify({result:[content]})})
  })
  await page.goto('/digital-channels'); await ready(page)
  await expect(page.locator('.digital-card').first().getByRole('heading',{name:'MoneyQube'})).toBeVisible()
  await expect(page.locator('.digital-public-hero img')).toHaveAttribute('src',digitalChannelsPage.bannerImage)
  await expect(page.locator('.digital-card')).toHaveCount(5)
  await page.getByRole('button',{name:'View MTN Merchant ID details'}).click()
  await expect(page.getByText('Dial *170#, choose MoMoPay, then enter Merchant ID 219440. Confirm the recipient is RapidLink Microfinance Limited.')).toBeVisible()
  content={...content,channels:[]}
  await expect(page.locator('.digital-card')).toHaveCount(0,{timeout:12000})
  unavailable=true
  await page.reload(); await ready(page)
  await expect(page.locator('.digital-card')).toHaveCount(5)
  await expect(page.locator('.digital-card').first().getByRole('heading',{name:'RapidLink mobile app'})).toBeVisible()
})

test('uses the CDN during API failure and refreshes an open page after publishing',async({page})=>{
  await mockSanity(page,{apiDown:true})
  await page.goto('/home'); await ready(page)
  await expect(page.locator('.home-newsroom-feature')).toContainText('Sanity published news')
  let years=18
  await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//, async(route)=>{
    const url=new URL(route.request().url())
    if (!url.searchParams.get('query').includes('_type == "impactCounter"')) return route.fallback()
    expect(url.hostname).toBe('04unhu7g.api.sanity.io')
    await route.fulfill({contentType:'application/json',body:JSON.stringify({result:[{id:'years',target:years,label:'Years of Service',suffix:'+',icon:'years'}]})})
  })
  await page.goto('/institutional-profile'); await ready(page)
  const count=page.locator('.impact-stat').filter({hasText:'Years of Service'}).locator('strong')
  await count.scrollIntoViewIfNeeded()
  await expect(count).toHaveText('18+')
  years=19
  await expect(count).toHaveText('19+',{timeout:12000})
})

test('published Sanity content reaches the current frontend and staff entry',async({page})=>{
  await mockSanity(page)
  await page.goto('/home'); await ready(page)
  await expect(page.locator('main').getByRole('heading',{name:'Sanity published news'})).toBeVisible()
  await expect(page.locator('.announcement-bar')).toContainText('Sanity published announcement')
  await expect(page.locator('.app-section')).toContainText('Sanity app promotion')
  await expect(page.locator('footer')).toContainText('Sanity footer description')
  await expect(page.locator('footer')).toContainText('sanity-contact@example.test')
  await page.goto('/stories/sanity-published-news'); await ready(page)
  await expect(page.getByRole('heading',{name:'Published details'})).toBeVisible()
  await page.goto('/rapidlink-careers'); await ready(page)
  await expect(page.getByRole('heading',{name:'Sanity Credit Officer'})).toBeVisible()
  await page.getByRole('button',{name:'View details'}).click()
  await expect(page.getByRole('dialog')).toContainText('Assist customers.')
  await page.goto('/faqs'); await ready(page)
  await expect(page.getByText('Sanity FAQ question?')).toBeVisible()
  await page.goto('/loan-calculator'); await ready(page)
  await expect(page.locator('#principal-amount')).toHaveAttribute('max','12000')
  await page.goto('/content-management'); await ready(page)
  await expect(page.getByRole('link',{name:'Open Sanity Studio'})).toHaveAttribute('href','http://127.0.0.1:3333')
})

test('unpublished or unavailable content does not restore old public listings',async({page})=>{
  await mockSanity(page,{empty:true})
  await page.goto('/home'); await ready(page)
  await expect(page.locator('.home-newsroom')).toContainText('There are no published updates')
  await page.goto('/rapidlink-careers'); await ready(page)
  await expect(page.locator('.vacancy-card')).toHaveCount(0)
  await page.unroute(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//)
  await mockSanity(page,{fail:true})
  await page.goto('/rapidlink-careers'); await ready(page)
  await expect(page.getByRole('heading',{name:'Opportunities are temporarily unavailable'})).toBeVisible()
  await expect(page.locator('.vacancy-card')).toHaveCount(0)
  await page.goto('/loan-calculator'); await ready(page)
  await expect(page.locator('#principal-amount')).toHaveAttribute('max','20000')
  await page.locator('#principal-amount').fill('1250.50')
  await page.getByRole('button',{name:'Calculate',exact:true}).click()
  await expect(page.locator('.calculator-breakdown')).toContainText('1250.50')
})
