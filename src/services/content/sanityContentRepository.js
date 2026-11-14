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
