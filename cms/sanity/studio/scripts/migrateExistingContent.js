import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')
const onlyNews = process.argv.find(argument => argument.startsWith('--only-news='))?.split('=').slice(1).join('=')
const onlyCareer = process.argv.find(argument => argument.startsWith('--only-career='))?.split('=').slice(1).join('=')

function parseEnvironment(contents) {
  const values = {}
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

function stablePart(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

function newsIdentity(article) {
  return stablePart(article.slug)
}

function vacancyIdentity(vacancy) {
  return stablePart(`${vacancy.title}-${vacancy.department}`)
}

function normalizeNews(article, websiteDefault = false) {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category,
    publishedAt: article.published_at || article.publishedAt,
    summary: article.summary,
    image: article.image,
    imageAlt: article.image_alt || article.imageAlt,
    featured: Boolean(article.featured),
    isPublished: websiteDefault ? true : Boolean(article.is_published),
    sections: Array.isArray(article.sections) ? article.sections : [],
    externalLink: article.external_link || article.externalLink || '',
    externalLabel: article.external_label || article.externalLabel || '',
  }
}

function normalizeVacancy(vacancy, websiteDefault = false) {
  return {
    title: vacancy.title,
    department: vacancy.department,
    location: vacancy.location,
    employmentType: vacancy.employment_type || vacancy.employmentType || 'Full-time',
    summary: vacancy.summary,
    responsibilities: Array.isArray(vacancy.responsibilities) ? vacancy.responsibilities : [],
    status: vacancy.status || 'open',
    isPublished: websiteDefault ? true : Boolean(vacancy.is_published),
    applicationEmail: vacancy.application_email || vacancy.applicationEmail,
  }
}

async function supabaseRequest(baseUrl, anonKey, path, token, options = {}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error_description || `Supabase request failed (${response.status}).`)
  }
  return response.status === 204 ? null : response.json()
}

async function loadSourceContent() {
  const environment = parseEnvironment(await readFile(resolve(repositoryRoot, '.env.local'), 'utf8'))
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'HOSTED_TEST_ADMIN_EMAIL',
    'HOSTED_TEST_ADMIN_PASSWORD',
  ]
  const missing = required.filter(key => !environment[key])
  if (missing.length) throw new Error(`Missing local migration configuration: ${missing.join(', ')}`)

  const bundled = await import(pathToFileURL(resolve(repositoryRoot, 'src/content.js')).href)
  const session = await supabaseRequest(
    environment.VITE_SUPABASE_URL,
    environment.VITE_SUPABASE_ANON_KEY,
    '/auth/v1/token?grant_type=password',
    null,
    {
      method: 'POST',
      body: JSON.stringify({
        email: environment.HOSTED_TEST_ADMIN_EMAIL,
        password: environment.HOSTED_TEST_ADMIN_PASSWORD,
      }),
    },
  )

  const [managedNews, managedVacancies] = await Promise.all([
    supabaseRequest(
      environment.VITE_SUPABASE_URL,
      environment.VITE_SUPABASE_ANON_KEY,
      '/rest/v1/news_articles?select=*&order=updated_at.desc',
      session.access_token,
    ),
    supabaseRequest(
      environment.VITE_SUPABASE_URL,
      environment.VITE_SUPABASE_ANON_KEY,
      '/rest/v1/career_vacancies?select=*&order=updated_at.desc',
      session.access_token,
    ),
  ])

  const newsBySlug = new Map(
    bundled.newsArticles.map(article => [newsIdentity(article), normalizeNews(article, true)]),
  )
  for (const article of managedNews) newsBySlug.set(newsIdentity(article), normalizeNews(article))

  const vacanciesByIdentity = new Map(
    bundled.careerVacancies.map(vacancy => [vacancyIdentity(vacancy), normalizeVacancy(vacancy, true)]),
  )
  for (const vacancy of managedVacancies) {
    vacanciesByIdentity.set(vacancyIdentity(vacancy), normalizeVacancy(vacancy))
  }

  return {
    news: [...newsBySlug.values()],
    vacancies: [...vacanciesByIdentity.values()],
  }
}

const imageTypes = {
  '.avif': 'image/avif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

async function loadImage(imageLocation) {
  if (!imageLocation) throw new Error('Article image is missing.')
  if (imageLocation.startsWith('/assets/')) {
    const filePath = resolve(repositoryRoot, 'public', imageLocation.replace(/^\//, ''))
    return {
      body: await readFile(filePath),
      filename: filePath.split(/[\\/]/).pop(),
      contentType: imageTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    }
  }
  if (/^https:\/\//i.test(imageLocation)) {
    const response = await fetch(imageLocation)
    if (!response.ok) throw new Error(`Could not download article image (${response.status}): ${imageLocation}`)
    const pathname = new URL(imageLocation).pathname
    return {
      body: Buffer.from(await response.arrayBuffer()),
      filename: pathname.split('/').pop() || 'article-image',
      contentType: response.headers.get('content-type')?.split(';')[0] || imageTypes[extname(pathname).toLowerCase()] || 'application/octet-stream',
    }
  }
  throw new Error(`Unsupported article image location: ${imageLocation}`)
}

async function uploadArticleImage(client, article) {
  const source = await loadImage(article.image)
  return client.assets.upload('image', source.body, {
    filename: source.filename,
    contentType: source.contentType,
    label: `Migrated for ${article.title}`,
  })
}

function newsDocument(article, assetId) {
  const id = `rapidlink-news-${newsIdentity(article)}`
  const documentId = article.isPublished ? id : `drafts.${id}`
  return {
    _id: documentId,
    _type: 'newsArticle',
    title: article.title,
    slug: { _type: 'slug', current: article.slug },
    category: article.category,
    publishedAt: article.publishedAt,
    summary: article.summary,
    image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
    imageAlt: article.imageAlt,
    featured: article.featured,
    isPublished: article.isPublished,
    sections: article.sections.map((section, index) => ({
      _key: `section-${index + 1}`,
      _type: 'articleSection',
      heading: section.heading || '',
      paragraphs: Array.isArray(section.paragraphs) ? section.paragraphs : [],
    })),
    ...(article.externalLink ? { externalLink: article.externalLink } : {}),
    ...(article.externalLabel ? { externalLabel: article.externalLabel } : {}),
  }
}

function vacancyDocument(vacancy) {
  const id = `rapidlink-vacancy-${vacancyIdentity(vacancy)}`
  const documentId = vacancy.isPublished ? id : `drafts.${id}`
  return {
    _id: documentId,
    _type: 'careerVacancy',
    title: vacancy.title,
    department: vacancy.department,
    location: vacancy.location,
    employmentType: vacancy.employmentType,
    summary: vacancy.summary,
    responsibilities: vacancy.responsibilities,
    status: vacancy.status,
    isPublished: vacancy.isPublished,
    applicationEmail: vacancy.applicationEmail,
  }
}

const allSource = await loadSourceContent()
const source = {
  news: onlyCareer ? [] : onlyNews
    ? allSource.news.filter(article => article.slug === onlyNews)
    : allSource.news,
  vacancies: onlyNews ? [] : onlyCareer
    ? allSource.vacancies.filter(vacancy => vacancyIdentity(vacancy) === onlyCareer)
    : allSource.vacancies,
}
if (onlyNews && source.news.length !== 1) throw new Error(`No news article matched --only-news=${onlyNews}`)
if (onlyCareer && source.vacancies.length !== 1) throw new Error(`No career vacancy matched --only-career=${onlyCareer}`)
console.log(`Prepared ${source.news.length} news article(s) and ${source.vacancies.length} career vacancy record(s).`)
console.log(`News: ${source.news.map(article => `${article.title} [${article.isPublished ? 'published' : 'draft'}]`).join('; ')}`)
console.log(`Careers: ${source.vacancies.map(vacancy => `${vacancy.title} (${vacancyIdentity(vacancy)}) [${vacancy.isPublished ? 'published' : 'draft'}]`).join('; ')}`)

if (dryRun) {
  console.log('Dry run complete. No Sanity records or assets were changed.')
  process.exit(0)
}

const client = getCliClient({ apiVersion: '2026-11-14' })
console.log('Authenticated Sanity client is ready. Starting asset and document transfer.')

try {
  for (const article of source.news) {
    console.log(`Uploading image for: ${article.title}`)
    const asset = await uploadArticleImage(client, article)
    const document = newsDocument(article, asset._id)
    const baseId = document._id.replace(/^drafts\./, '')
    const oppositeId = article.isPublished ? `drafts.${baseId}` : baseId
    await client.transaction().createOrReplace(document).delete(oppositeId).commit()
    console.log(`Migrated news: ${article.title}`)
  }

  for (const vacancy of source.vacancies) {
    const document = vacancyDocument(vacancy)
    const baseId = document._id.replace(/^drafts\./, '')
    const oppositeId = vacancy.isPublished ? `drafts.${baseId}` : baseId
    await client.transaction().createOrReplace(document).delete(oppositeId).commit()
    console.log(`Migrated career vacancy: ${vacancy.title}`)
  }

  console.log('Sanity content migration completed successfully.')
} catch (error) {
  console.error(`Sanity content migration failed: ${error?.stack || error?.message || error}`)
  process.exitCode = 1
}
