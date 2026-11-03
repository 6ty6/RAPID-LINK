import { careerVacancies } from '../content'

const apiUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const careersAdminConfigured = Boolean(apiUrl && anonKey)

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
    throw new Error(error.message || error.error_description || 'The careers service could not complete this request.')
  }

  if (response.status === 204) return null
  return response.json()
}

export async function getPublishedVacancies() {
  if (!careersAdminConfigured) return careerVacancies
  return request('/rest/v1/career_vacancies?select=*&is_published=eq.true&order=created_at.desc')
}

export async function signInCareerAdmin(email, password) {
  const session = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } })
  const allowed = await request('/rest/v1/rpc/is_career_admin', { method: 'POST', token: session.access_token })
  if (!allowed) throw new Error('This account is not authorised to manage vacancies.')
  return session
}

export async function signOutCareerAdmin(token) {
  return request('/auth/v1/logout', { method: 'POST', token })
}

export function getManagedVacancies(token) {
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

  if (vacancy.id) {
    const rows = await request(`/rest/v1/career_vacancies?id=eq.${encodeURIComponent(vacancy.id)}`, { method: 'PATCH', body: payload, token, prefer: 'return=representation' })
    return rows[0]
  }

  const rows = await request('/rest/v1/career_vacancies', { method: 'POST', body: payload, token, prefer: 'return=representation' })
  return rows[0]
}
