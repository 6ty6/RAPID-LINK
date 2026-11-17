const projectId = (import.meta.env.VITE_SANITY_PROJECT_ID || '').trim()
const dataset = (import.meta.env.VITE_SANITY_DATASET || 'production').trim()
const apiVersion = (import.meta.env.VITE_SANITY_API_VERSION || '2026-11-14').trim()

const validProjectId = /^[a-z0-9-]+$/.test(projectId)
const validDataset = /^[a-zA-Z0-9_-]+$/.test(dataset)
const validApiVersion = /^\d{4}-\d{2}-\d{2}$/.test(apiVersion)

export const isSanityRepositoryConfigured = Boolean(
  projectId && dataset && apiVersion && validProjectId && validDataset && validApiVersion,
)

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

async function querySanity(query) {
  if (!isSanityRepositoryConfigured) throw new Error('Sanity public-content configuration is incomplete.')
  const endpoint = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`)
  endpoint.searchParams.set('query', query)
  endpoint.searchParams.set('perspective', 'published')

  const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.description || error?.message || 'Sanity could not provide public content.')
  }
  const payload = await response.json()
  if (!Array.isArray(payload.result)) throw new Error('Sanity returned an unexpected public-content response.')
  return payload.result
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
