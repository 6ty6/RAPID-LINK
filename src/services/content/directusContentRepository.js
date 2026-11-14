const directusUrl = (import.meta.env.VITE_DIRECTUS_URL || '').replace(/\/$/, '')

export const isDirectusRepositoryConfigured = Boolean(directusUrl)

const publicNewsFields = [
  'slug', 'title', 'category', 'published_at', 'summary', 'image', 'image_alt',
  'featured', 'is_published', 'sections', 'external_link', 'external_label',
].join(',')

const publicVacancyFields = [
  'id', 'title', 'department', 'location', 'employment_type', 'summary',
  'responsibilities', 'status', 'is_published', 'application_email', 'created_at',
].join(',')

async function readItems(collection, parameters) {
  if (!isDirectusRepositoryConfigured) throw new Error('The Directus content source is not configured.')
  const query = new URLSearchParams(parameters)
  const response = await fetch(`${directusUrl}/items/${collection}?${query}`)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || !Array.isArray(payload.data)) {
    throw new Error(payload?.errors?.[0]?.message || 'Directus could not load the requested public content.')
  }

  return payload.data
}

function publicImage(value) {
  const file = typeof value === 'object' && value ? value.id : value
  if (!file || typeof file !== 'string') return ''
  if (/^https?:\/\//.test(file) || file.startsWith('/')) return file
  return `${directusUrl}/assets/${encodeURIComponent(file)}`
}

const normalizeNews = article => ({
  slug: article.slug,
  title: article.title,
  category: article.category,
  publishedAt: article.published_at,
  summary: article.summary,
  image: publicImage(article.image),
  imageAlt: article.image_alt,
  featured: Boolean(article.featured),
  sections: Array.isArray(article.sections) ? article.sections : [],
  externalLink: article.external_link || '',
  externalLabel: article.external_label || '',
})

const normalizeVacancy = vacancy => ({
  id: String(vacancy.id),
  title: vacancy.title,
  department: vacancy.department,
  location: vacancy.location,
  employment_type: vacancy.employment_type,
  summary: vacancy.summary,
  responsibilities: Array.isArray(vacancy.responsibilities) ? vacancy.responsibilities : [],
  status: vacancy.status,
  is_published: vacancy.is_published === true,
  application_email: vacancy.application_email,
})

export async function getDirectusPublishedNews() {
  const rows = await readItems('news_articles', {
    fields: publicNewsFields,
    'filter[is_published][_eq]': 'true',
    sort: '-published_at',
  })
  return rows.map(normalizeNews)
}

export async function getDirectusPublishedVacancies() {
  const rows = await readItems('career_vacancies', {
    fields: publicVacancyFields,
    'filter[is_published][_eq]': 'true',
    sort: '-created_at',
  })
  return rows.map(normalizeVacancy)
}
