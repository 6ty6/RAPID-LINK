import { test, expect } from '@playwright/test'
import { siteInformation } from '../../src/content/site.js'
import { loanCalculatorSettings } from '../../src/content/loanCalculator.js'
import { digitalChannelsPage } from '../../src/content/digitalChannels.js'
import {remainingCms} from '../../src/content/remainingCms.js'

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

test('product cards advance automatically and pause for customers reading or interacting',async({page})=>{
 await page.clock.install()
 await mockSanity(page)
 await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//,async route=>{
  const query=new URL(route.request().url()).searchParams.get('query')
  const model=Object.values(remainingCms).find(model=>query.includes(`_type == "${model.schema}"`))
  if(!model)return route.fallback()
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result:model.collection?model.content:[model.content]})})
 })
 await page.goto('/home');await ready(page)
 const track=page.locator('.product-slider')
 await expect(page.locator('.product-photo-card')).toHaveCount(6)
 await track.scrollIntoViewIfNeeded();await page.mouse.move(1,1)
 await page.clock.fastForward(7000)
 await expect.poll(()=>track.evaluate(node=>node.scrollLeft)).toBeGreaterThan(10)
 await track.hover();await page.waitForTimeout(700)
 const previous=await track.evaluate(node=>node.scrollLeft)
 await page.clock.fastForward(18000)
 expect(await track.evaluate(node=>node.scrollLeft)).toBe(previous)
 await track.focus();await page.mouse.move(1,1)
 await page.waitForTimeout(700)
 const focused=await track.evaluate(node=>node.scrollLeft)
 await page.clock.fastForward(18000)
 expect(await track.evaluate(node=>node.scrollLeft)).toBe(focused)
 await track.blur()
 await page.clock.fastForward(18000)
 await expect.poll(()=>track.evaluate(node=>node.scrollLeft)).not.toBe(focused)
 await track.evaluate(node=>node.scrollTo({left:node.scrollWidth,behavior:'instant'}))
 await page.clock.fastForward(7000)
 await expect.poll(()=>track.evaluate(node=>node.scrollLeft)).toBeLessThan(3)
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.clock.fastForward(18000)
 expect(await track.evaluate(node=>node.scrollLeft)).toBeLessThan(3)
})

test('editorial page migrations preserve products, board, rates, navigation and prepared answers',async({page})=>{
 await mockSanity(page)
 await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//,async route=>{
  const query=new URL(route.request().url()).searchParams.get('query')
  const model=Object.values(remainingCms).find(model=>query.includes(`_type == "${model.schema}"`))
  if(!model)return route.fallback()
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result:model.collection?model.content:[model.content]})})
 })
 await page.goto('/home');await ready(page)
 await expect(page.locator('.product-photo-card')).toHaveCount(6)
 await page.goto('/business-loan');await ready(page)
 await expect(page.getByRole('heading',{name:'Business Loans',exact:true,level:1})).toBeVisible()
 await expect(page.locator('.product-feature-image img')).toHaveCSS('object-fit','contain')
 await page.goto('/board-of-directors');await ready(page)
 await expect(page.locator('.board-profile-card')).toHaveCount(3)
 await page.getByRole('button',{name:'View profile for Edward Opare-Donkor'}).click()
 await expect(page.getByRole('dialog')).toContainText('over two decades')
 await page.keyboard.press('Escape')
 await page.goto('/institutional-profile');await ready(page)
 await expect(page.locator('.profile-copy-section')).toContainText('trusted and customer-centric')
 await page.getByRole('button',{name:'Show details for Our Mission'}).click()
 await expect(page.getByRole('button',{name:'Show front of Our Mission'})).toBeVisible()
 await page.goto('/rates');await ready(page)
 await expect(page.locator('tbody tr')).toHaveCount(4)
 await page.goto('/open-account');await ready(page)
 await expect(page.locator('form')).toHaveCount(0)
 await expect(page.getByRole('heading',{name:'Online account opening is on its way.'})).toBeVisible()
  await page.getByRole('button',{name:'Open Abena',exact:true}).click()
  await page.getByRole('button',{name:'Meet RapidLink',exact:true}).click()
  await expect(page.getByRole('log')).toContainText('Institutional Profile')
})

test('new products share their page and homepage content while featured news takes priority',async({page})=>{
 await mockSanity(page)
 const product={...remainingCms.products.content.find(item=>item.slug==='rapid-savings'),slug:'new-community-savings',title:'Community Savings',intro:'An approved new product introduction.'}
 const homepage=structuredClone(remainingCms.homepage.content)
 homepage.products.featuredSlugs=[product.slug,'business-loan']
 const articles=[
  {id:'new',slug:'latest-story',title:'Latest story',category:'Service Updates',publishedAt:'2026-11-25',summary:'A recent story.',featured:false},
  {id:'chosen',slug:'chosen-story',title:'Chosen story',category:'Customer Notices',publishedAt:'2026-10-01',summary:'An older selected story.',featured:true},
 ]
 await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//,async route=>{
  const query=new URL(route.request().url()).searchParams.get('query')
  let result
  if(query.includes('_type == "publicProduct"'))result=[...remainingCms.products.content,product]
  else if(query.includes('_type == "publicHomepage"'))result=[homepage]
  else if(query.includes('_type == "newsArticle"'))result=articles
  else return route.fallback()
  await route.fulfill({contentType:'application/json',body:JSON.stringify({result})})
 })
 await page.goto('/home');await ready(page)
 await expect(page.locator('.product-photo-card')).toHaveCount(2)
 await expect(page.locator('.product-photo-card').first()).toContainText('Community Savings')
 await expect(page.locator('.home-newsroom-feature')).toContainText('Chosen story')
 await page.locator('.product-photo-card').first().click();await ready(page)
 await expect(page.getByRole('heading',{level:1,name:'Community Savings',exact:true})).toBeVisible()
 await expect(page.locator('.page-hero')).toContainText(product.intro)
 product.title='Community Savings Plus'
 product.intro='The updated public introduction.'
 await expect(page.getByRole('heading',{level:1,name:product.title,exact:true})).toBeVisible({timeout:12000})
 await page.goto('/home');await ready(page)
 await expect(page.locator('.product-photo-card').first()).toContainText(product.intro)
 articles[1].featured=false
 await expect(page.locator('.home-newsroom-feature')).toContainText('Latest story',{timeout:12000})
 homepage.products.featuredSlugs=[]
 await expect(page.locator('.product-photo-card')).toHaveCount(0,{timeout:12000})
})

test('calculator page and homepage card use CMS wording without changing calculations',async({page})=>{
  await mockSanity(page)
  await page.route(/^https:\/\/04unhu7g\.(api|apicdn)\.sanity\.io\//,async route=>{
    if(!new URL(route.request().url()).searchParams.get('query').includes('_type == "loanCalculatorPage"'))return route.fallback()
    await route.fulfill({contentType:'application/json',body:JSON.stringify({result:[{heroTitle:'CMS calculator heading',calculateLabel:'Estimate my repayment',cardTitleFirst:'Plan',cardTitleSecond:'Your loan',cardDescription:'CMS homepage calculator description'}]})})
  })
  await page.goto('/home');await ready(page)
  await expect(page.locator('.quick-access-calculator')).toContainText('CMS homepage calculator description')
  await expect(page.locator('.quick-access-calculator')).toHaveAttribute('href','/loan-calculator')
  await page.locator('.quick-access-calculator').click();await ready(page)
  await expect(page.getByRole('heading',{name:'CMS calculator heading',exact:true})).toBeVisible()
  await page.locator('#principal-amount').fill('1250.50')
  await page.getByRole('button',{name:'Estimate my repayment',exact:true}).click()
  await expect(page.locator('.calculator-breakdown')).toContainText('1250.50')
})

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
