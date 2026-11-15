import { getBundledNews, getBundledVacancies } from './content/localContentRepository'

const apiUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const careersAdminConfigured = Boolean(apiUrl && anonKey)
export const contentAdminConfigured = careersAdminConfigured

async function request(path, { method = 'GET', body, token, prefer } = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error_description || 'The content service could not complete this request.')
  }

  if (response.status === 204) return null
  return response.json()
}

export async function getPublishedVacancies() {
  if (!careersAdminConfigured) return getBundledVacancies()
  return request('/rest/v1/career_vacancies?select=*&is_published=eq.true&order=created_at.desc')
}

export async function signInCareerAdmin(email, password) {
  const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } })
  const allowed = await request('/rest/v1/rpc/is_content_admin', { method: 'POST', token: session.access_token })
  if (!allowed) throw new Error('This account is not authorised to manage RapidLink content.')
  return session
}

export const signInContentAdmin = signInCareerAdmin

export async function signOutCareerAdmin(token) {
  return request('/auth/v1/logout', { method: 'POST', token })
}

export const signOutContentAdmin = signOutCareerAdmin

export async function resolveContentInvite({ accessToken, tokenHash, type }) {
  if (accessToken) return { access_token: accessToken }
  if (!tokenHash) throw new Error('This invitation link is incomplete or has already been used.')
  return request('/auth/v1/verify', {
    method: 'POST',
    body: { token_hash: tokenHash, type: type || 'invite' },
  })
}

export async function setInvitedUserPassword(password, token) {
  await request('/auth/v1/user', { method: 'PUT', body: { password }, token })
  return request('/rest/v1/rpc/is_content_admin', { method: 'POST', token })
}

export async function getManagedVacancies(token) {
  return request('/rest/v1/career_vacancies?select=*&order=created_at.desc', { token })
}

export async function saveVacancy(vacancy, token) {
  const payload = {
    title: vacancy.title.trim(),
    department: vacancy.department.trim(),
    location: vacancy.location.trim(),
    employment_type: vacancy.employment_type.trim(),
    summary: vacancy.summary.trim(),
    responsibilities: vacancy.responsibilities.map(item => item.trim()).filter(Boolean),
    status: vacancy.status,
    is_published: vacancy.is_published,
    application_email: vacancy.application_email.trim(),
  }

  if (vacancy.id && !vacancy.id.startsWith('local:')) {
    const rows = await request(`/rest/v1/career_vacancies?id=eq.${encodeURIComponent(vacancy.id)}`, { method: 'PATCH', body: payload, token, prefer: 'return=representation' })
    return rows[0]
  }

  const rows = await request('/rest/v1/career_vacancies', { method: 'POST', body: payload, token, prefer: 'return=representation' })
  return rows[0]
}

export async function deleteVacancy(id, token) {
  if (!id || id.startsWith('local:')) throw new Error('Website-default vacancies cannot be deleted from the database.')
  await request(`/rest/v1/career_vacancies?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

const normalizeNewsArticle = article => ({
  ...article,
  publishedAt: article.published_at || article.publishedAt,
  imageAlt: article.image_alt || article.imageAlt,
  externalLink: article.external_link || article.externalLink || '',
  externalLabel: article.external_label || article.externalLabel || '',
})

export async function getPublishedNews() {
  if (!contentAdminConfigured) return getBundledNews()
  const rows = await request('/rest/v1/news_articles?select=*&is_published=eq.true&order=published_at.desc')
  return rows.map(normalizeNewsArticle)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
}

export async function getManagedNews(token) {
  const rows = await request('/rest/v1/news_articles?select=*&order=updated_at.desc', { token })
  const managedArticles = rows.map(normalizeNewsArticle)
  const managedSlugs = new Set(managedArticles.map(article => article.slug))
  const websiteDefaults = getBundledNews()
    .filter(article => !managedSlugs.has(article.slug))
    .map(article => ({ ...article, id: `local:${article.slug}`, is_local: true, is_published: true }))
  return [...managedArticles, ...websiteDefaults]
}

export async function saveNewsArticle(article, token) {
  const payload = {
    slug: article.slug.trim().toLowerCase(),
    title: article.title.trim(),
    category: article.category.trim(),
    published_at: article.publishedAt,
    summary: article.summary.trim(),
    image: article.image.trim(),
    image_alt: article.imageAlt.trim(),
    featured: Boolean(article.featured),
    is_published: Boolean(article.is_published),
    sections: article.sections,
    external_link: article.externalLink?.trim() || null,
    external_label: article.externalLabel?.trim() || null,
  }

  if (article.id && !article.id.startsWith('local:')) {
    const rows = await request(`/rest/v1/news_articles?id=eq.${encodeURIComponent(article.id)}`, { method: 'PATCH', body: payload, token, prefer: 'return=representation' })
    return normalizeNewsArticle(rows[0])
  }

  const rows = await request('/rest/v1/news_articles', { method: 'POST', body: payload, token, prefer: 'return=representation' })
  return normalizeNewsArticle(rows[0])
}

export async function deleteNewsArticle(id, token) {
  if (!id || id.startsWith('local:')) throw new Error('Website-default stories cannot be deleted from the database.')
  await request(`/rest/v1/news_articles?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

const newsImageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export async function uploadNewsImage(file, token) {
  const extension = newsImageTypes[file?.type]
  if (!extension) throw new Error('Choose a JPG, PNG, WebP or AVIF image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('The image must be 5 MB or smaller.')

  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const objectPath = `${new Date().toISOString().slice(0, 10)}/${uniqueId}.${extension}`
  const response = await fetch(`${apiUrl}/storage/v1/object/news-images/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type,
      'x-upsert': 'false',
    },
    body: file,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'The news image could not be uploaded.')
  }

  return `${apiUrl}/storage/v1/object/public/news-images/${objectPath}`
}
