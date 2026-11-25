import { validateCalculatorSettings } from '../../content/validateCalculatorSettings.js'
import { sharedContent } from '../../content/shared.js'
import { calculatorPage } from '../../content/calculatorPage.js'
const projectId = (import.meta.env.VITE_SANITY_PROJECT_ID || '04unhu7g').trim()
const dataset = (import.meta.env.VITE_SANITY_DATASET || 'production').trim()
const apiVersion = (import.meta.env.VITE_SANITY_API_VERSION || '2026-11-14').trim()

const validProjectId = /^[a-z0-9-]+$/.test(projectId)
const validDataset = /^[a-zA-Z0-9_-]+$/.test(dataset)
const validApiVersion = /^\d{4}-\d{2}-\d{2}$/.test(apiVersion)

export const isSanityRepositoryConfigured = Boolean(
  projectId && dataset && apiVersion && validProjectId && validDataset && validApiVersion,
)
export const sanityEnabled = (import.meta.env.VITE_CONTENT_SOURCE || 'sanity').toLowerCase() === 'sanity' && isSanityRepositoryConfigured

const newsQuery = `*[_type == "newsArticle" && isPublished == true] | order(publishedAt desc){
  "id": _id,
  "slug": slug.current,
  title,
  category,
  publishedAt,
  summary,
  "image": image.asset->url,
  imageAlt,
  featured,
  sections[]{heading, paragraphs},
  externalLink,
  externalLabel
}`

const calculatorPageQuery = `*[_type == "loanCalculatorPage" && _id == "rapidlink-loan-calculator-page"]{
  ${Object.keys(calculatorPage).filter(key=>!['heroImage','cardImage'].includes(key)).join(',')},
  "heroImage":heroImage.asset->url,"cardImage":cardImage.asset->url
}`
export async function getSanityCalculatorPage() {
  const rows=await querySanity(calculatorPageQuery)
  if(!rows[0]) throw Error('Calculator page content is not published.')
  const page={...calculatorPage,...Object.fromEntries(Object.entries(rows[0]).filter(([,value])=>typeof value==='string' && value.trim()))}
  if(!page.rateHelp.includes('{annualRate}') || !['{frequency}','{count}','{instalments}'].every(token=>page.paymentsHelp.includes(token))) throw Error('Calculator wording is missing required schedule placeholders.')
  return page
}

const digitalChannelsQuery = `*[_type == "digitalChannelsPage" && _id == "rapidlink-digital-channels-page"]{
  title, description, "bannerImage": bannerImage.asset->url, bannerAlt,
  "channels": channels[isPublished == true]{"id": _key,title,description,"image": image.asset->url,imageAlt,link,isPublished}
}`

export async function getSanityDigitalChannelsPage() {
  const rows = await querySanity(digitalChannelsQuery)
  const page = rows[0]
  if (!page || !page.title || !page.description || !page.bannerImage || !page.bannerAlt || !Array.isArray(page.channels)) {
    throw Error('The digital channels page has not been published completely.')
  }
  if (page.channels.some(channel => !channel.id || !channel.title || !channel.description || !channel.image || !channel.imageAlt ||
      (channel.link && !/^https:\/\//i.test(channel.link)))) throw Error('Incomplete digital channel content.')
  return page
}

const vacancyQuery = `*[_type == "careerVacancy" && isPublished == true] | order(_createdAt desc){
  "id": _id,
  title,
  department,
  location,
  employmentType,
  summary,
  responsibilities,
  status,
  isPublished,
  applicationEmail
}`

const impactCounterQuery = `*[_type == "impactCounter" && isPublished == true] | order(displayOrder asc){
  "id": _id,
  target,
  prefix,
  suffix,
  label,
  icon,
  displayOrder,
  isPublished,
  verifiedAt
}`

const faqQuery = `*[_type == "faq" && isPublished == true] | order(displayOrder asc, _createdAt asc){
  "id": _id,
  question,
  answer,
  category,
  displayOrder,
  isPublished
}`

const announcementQuery = `*[
  _type == "announcement" &&
  isPublished == true &&
  (!defined(startDate) || dateTime(startDate) <= dateTime(now())) &&
  (!defined(expiryDate) || dateTime(expiryDate) > dateTime(now()))
] | order(displayOrder asc, _createdAt asc) {
  "id": _id,
  message,
  priority,
  displayOrder,
  startDate,
  expiryDate,
  isPublished
}`

const siteSettingsQuery = `*[_type == "siteSettings" && _id == "rapidlink-site-settings"]{
  email,
  supportLines[]{"id": _key, label, mobileLabel, display, href},
  loanSupportLines[]{display, href},
  branches[]{"id": _key, title, contactTitle, address, fullAddress, digitalAddress, mapName, phones},
  socialProfiles[]{name, href, icon}
}`

const loanCalculatorSettingsQuery = `*[
  _type == "loanCalculatorSettings" &&
  _id == "rapidlink-loan-calculator-settings" &&
  isActive == true &&
  approvalStatus == "approved" &&
  effectiveDate <= $today
]{
  minimumPrincipal,
  maximumPrincipal,
  minimumMonths,
  maximumMonths,
  monthlyFlatRate,
  nominalAnnualRate,
  processingFeeRate,
  insuranceFeeRate,
  managementFeeRate,
  earlySettlementRate,
  excludeFutureInterest,
  repaymentFrequencies,
  weeklySchedule[]{months, payments},
  heroIntro,
  disclaimer,
  assumptionNotice,
  approvalStatus,
  effectiveDate
}`

const sharedSettingsQuery = `*[_type == "sharedSettings" && _id == "rapidlink-shared-settings"]{
  appEyebrow,
  appTitle,
  appDescription,
  "appImage": appImage.asset->url,
  appImageAlt,
  iosLabel,
  androidLabel,
  footerDescription,
  companyName,
  privacyNotice,
  socialHeading,
  exploreHeading,
  companyHeading,
  contactHeading,
  menuDescriptions[]{menu, description},
  exploreLinks[]{label, href},
  companyLinks[]{label, href}
}`

async function querySanity(query, params = {}) {
  if (!isSanityRepositoryConfigured) throw new Error('Sanity public-content configuration is incomplete.')
  async function read(host) {
    const endpoint = new URL(`https://${projectId}.${host}.sanity.io/v${apiVersion}/data/query/${dataset}`)
    endpoint.searchParams.set('query', query)
    for (const [key, value] of Object.entries(params)) endpoint.searchParams.set(`$${key}`, JSON.stringify(value))
    endpoint.searchParams.set('perspective', 'published')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      const response = await fetch(endpoint, { method:'GET', cache:host === 'api' ? 'no-store' : 'default', credentials:'omit', signal:controller.signal, headers:{Accept:'application/json'} })
      if (!response.ok) throw new Error('Sanity could not provide public content.')
      const payload = await response.json()
      if (!Array.isArray(payload.result)) throw new Error('Sanity returned an unexpected public-content response.')
      return payload.result
    } finally { clearTimeout(timeout) }
  }
  try {
    return await read('api')
  } catch {
    return read('apicdn')
  }
}

export async function getSanityPublishedNews() {
  const rows = await querySanity(newsQuery)
  return rows.map(article => ({
    ...article,
    image: article.image || '',
    imageAlt: article.imageAlt || '',
    featured: Boolean(article.featured),
    sections: Array.isArray(article.sections) ? article.sections : [],
    externalLink: article.externalLink || '',
    externalLabel: article.externalLabel || '',
  }))
}

export async function getSanityPublishedVacancies() {
  const rows = await querySanity(vacancyQuery)
  return rows.map(vacancy => ({
    id: vacancy.id,
    title: vacancy.title,
    department: vacancy.department,
    location: vacancy.location,
    employment_type: vacancy.employmentType,
    summary: vacancy.summary,
    responsibilities: Array.isArray(vacancy.responsibilities) ? vacancy.responsibilities : [],
    status: vacancy.status,
    is_published: Boolean(vacancy.isPublished),
    application_email: vacancy.applicationEmail,
  }))
}

export async function getSanityImpactCounters() {
  const rows = await querySanity(impactCounterQuery)
  return rows.map(counter => ({
    id: counter.id,
    target: counter.target,
    prefix: counter.prefix || '',
    suffix: counter.suffix || '',
    label: counter.label,
    icon: counter.icon,
    displayOrder: counter.displayOrder,
    is_published: Boolean(counter.isPublished),
    verifiedAt: counter.verifiedAt || '',
  }))
}

export async function getSanityPublishedFaqs() {
  const rows = await querySanity(faqQuery)
  return rows.map(faq => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category || 'General',
    displayOrder: Number.isInteger(faq.displayOrder) ? faq.displayOrder : 0,
    is_published: Boolean(faq.isPublished),
  }))
}

export async function getSanityPublishedAnnouncements() {
  const rows = await querySanity(announcementQuery)

  return rows.map(announcement => ({
    id: announcement.id,
    message: announcement.message,
    priority: announcement.priority || 'normal',
    displayOrder: Number.isInteger(announcement.displayOrder)
      ? announcement.displayOrder
      : 0,
    startDate: announcement.startDate || '',
    expiryDate: announcement.expiryDate || '',
    is_published: Boolean(announcement.isPublished),
  }))
}

export async function getSanitySiteInformation() {
  const rows = await querySanity(siteSettingsQuery)
  const settings = rows[0]
  if (!settings) throw new Error('Sanity contact and social settings have not been created.')
  if (typeof settings.email !== 'string' || !Array.isArray(settings.supportLines) ||
      settings.supportLines.some(line => !line.label || !line.href || !line.display) ||
      !Array.isArray(settings.branches) || settings.branches.some(branch => !branch.title || !branch.address || !branch.fullAddress || !Array.isArray(branch.phones))) {
    throw new Error('Incomplete contact settings.')
  }

  return {
    contact: {
      email: settings.email,
      supportLines: Array.isArray(settings.supportLines) ? settings.supportLines : [],
      loanSupportLines: Array.isArray(settings.loanSupportLines) ? settings.loanSupportLines : [],
    },
    branches: Array.isArray(settings.branches) ? settings.branches : [],
    socialProfiles: Array.isArray(settings.socialProfiles) ? settings.socialProfiles : [],
  }
}

export async function getSanityLoanCalculatorSettings() {
  const today = new Date().toISOString().slice(0, 10)
  const rows = await querySanity(loanCalculatorSettingsQuery, { today })
  const settings = rows[0]
  if (!settings) throw new Error('No active Sanity loan-calculator settings are currently effective.')

  const weeklyPaymentsByMonth = Object.fromEntries(
    (Array.isArray(settings.weeklySchedule) ? settings.weeklySchedule : [])
      .map(row => [row.months, row.payments]),
  )

  return validateCalculatorSettings({
    ...settings,
    repaymentFrequencies: Array.isArray(settings.repaymentFrequencies)
      ? settings.repaymentFrequencies
      : [],
    weeklyPaymentsByMonth,
  })
}

export async function getSanitySharedContent() {
  const rows = await querySanity(sharedSettingsQuery)
  const settings = rows[0]
  if (!settings) throw new Error('Sanity footer and app-promotion settings have not been created.')

  const menuDescriptions = Object.fromEntries(
    (Array.isArray(settings.menuDescriptions) ? settings.menuDescriptions : [])
      .filter(item => item?.menu && item?.description)
      .map(item => [item.menu, item.description]),
  )

  const defined = value => Object.fromEntries(Object.entries(value).filter(([,item]) => item != null && item !== ''))
  return {
    appDownload: {
      ...sharedContent.appDownload,
      ...defined({
      eyebrow: settings.appEyebrow,
      title: settings.appTitle,
      description: settings.appDescription,
      image: settings.appImage || '',
      imageAlt: settings.appImageAlt,
      iosLabel: settings.iosLabel,
      androidLabel: settings.androidLabel,
      }),
    },
    footer: {
      ...sharedContent.footer,
      ...defined({
      description: settings.footerDescription,
      companyName: settings.companyName,
      privacyNotice: settings.privacyNotice,
      }),
      headings: {
        ...sharedContent.footer.headings,
        ...defined({
        social: settings.socialHeading,
        explore: settings.exploreHeading,
        company: settings.companyHeading,
        contact: settings.contactHeading,
        }),
      },
      menuDescriptions: { ...sharedContent.footer.menuDescriptions, ...menuDescriptions },
      exploreLinks: Array.isArray(settings.exploreLinks) ? settings.exploreLinks : sharedContent.footer.exploreLinks,
      companyLinks: Array.isArray(settings.companyLinks) ? settings.companyLinks : sharedContent.footer.companyLinks,
    },
  }
}
