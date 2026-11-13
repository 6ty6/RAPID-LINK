/**
 * Hosted Supabase RLS verification through the same public HTTP APIs used by
 * the website. No service-role key is accepted or required.
 *
 * Required environment variables:
 *   VITE_SUPABASE_URL (or HOSTED_SUPABASE_URL)
 *   VITE_SUPABASE_ANON_KEY (or HOSTED_SUPABASE_PUBLISHABLE_KEY)
 *   HOSTED_TEST_ADMIN_EMAIL
 *   HOSTED_TEST_ADMIN_PASSWORD
 *   HOSTED_TEST_NON_ADMIN_EMAIL
 *   HOSTED_TEST_NON_ADMIN_PASSWORD
 */

const env = process.env
const baseUrl = (env.HOSTED_SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const publishableKey = env.HOSTED_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''
const adminEmail = env.HOSTED_TEST_ADMIN_EMAIL || ''
const adminPassword = env.HOSTED_TEST_ADMIN_PASSWORD || ''
const nonAdminEmail = env.HOSTED_TEST_NON_ADMIN_EMAIL || ''
const nonAdminPassword = env.HOSTED_TEST_NON_ADMIN_PASSWORD || ''

const missing = [
  [baseUrl, 'VITE_SUPABASE_URL or HOSTED_SUPABASE_URL'],
  [publishableKey, 'VITE_SUPABASE_ANON_KEY or HOSTED_SUPABASE_PUBLISHABLE_KEY'],
  [adminEmail, 'HOSTED_TEST_ADMIN_EMAIL'],
  [adminPassword, 'HOSTED_TEST_ADMIN_PASSWORD'],
  [nonAdminEmail, 'HOSTED_TEST_NON_ADMIN_EMAIL'],
  [nonAdminPassword, 'HOSTED_TEST_NON_ADMIN_PASSWORD'],
].filter(([value]) => !value).map(([, name]) => name)

if (missing.length) {
  console.error(`Missing hosted-test configuration: ${missing.join(', ')}`)
  process.exit(2)
}

const results = []
const cleanupTargets = {
  newsIds: new Set(),
  newsSlugs: new Set(),
  vacancyIds: new Set(),
  vacancyTitles: new Set(),
}

function record(name, passed, evidence) {
  results.push({ name, passed, evidence })
  console.log(`${passed ? 'PASS' : 'FAIL'} | ${name} | ${evidence}`)
}

async function request(path, { method = 'GET', token, body, prefer } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token || publishableKey}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  return { ok: response.ok, status: response.status, data }
}

async function signIn(email, password) {
  const response = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })
  if (!response.ok || !response.data?.access_token) {
    throw new Error(`Test-account sign-in failed with HTTP ${response.status}`)
  }
  return response.data.access_token
}

function rows(response) {
  return Array.isArray(response.data) ? response.data : []
}

async function createAdminRecord(path, body, token) {
  const response = await request(path, {
    method: 'POST',
    token,
    body,
    prefer: 'return=representation',
  })
  if (!response.ok || rows(response).length !== 1) {
    throw new Error(`Could not create temporary hosted test data at ${path} (HTTP ${response.status})`)
  }
  return rows(response)[0]
}

const runId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
const originalNewsTitle = `RLS draft news ${runId}`
const originalVacancyTitle = `RLS draft vacancy ${runId}`
let adminToken = ''

try {
  adminToken = await signIn(adminEmail, adminPassword)
  const nonAdminToken = await signIn(nonAdminEmail, nonAdminPassword)

  const adminCheck = await request('/rest/v1/rpc/is_content_admin', { method: 'POST', token: adminToken })
  const nonAdminCheck = await request('/rest/v1/rpc/is_content_admin', { method: 'POST', token: nonAdminToken })
  record('Approved test user is a content administrator', adminCheck.ok && adminCheck.data === true, `HTTP ${adminCheck.status}`)
  record('Ordinary signed-in test user is not an administrator', nonAdminCheck.ok && nonAdminCheck.data === false, `HTTP ${nonAdminCheck.status}`)

  if (!(adminCheck.ok && adminCheck.data === true) || !(nonAdminCheck.ok && nonAdminCheck.data === false)) {
    throw new Error('Test-account roles are not configured correctly; write tests were not started.')
  }

  const draftNews = await createAdminRecord('/rest/v1/news_articles', {
    slug: `rls-api-draft-news-${runId}`,
    title: originalNewsTitle,
    category: 'Security Test',
    summary: 'Temporary draft used for public API security verification.',
    image: '/assets/rapidlink-logo.png',
    image_alt: 'RapidLink logo',
    is_published: false,
    sections: [],
  }, adminToken)
  cleanupTargets.newsIds.add(draftNews.id)

  const publishedNews = await createAdminRecord('/rest/v1/news_articles', {
    slug: `rls-api-published-news-${runId}`,
    title: `RLS published news ${runId}`,
    category: 'Security Test',
    summary: 'Temporary published record used for public API security verification.',
    image: '/assets/rapidlink-logo.png',
    image_alt: 'RapidLink logo',
    is_published: true,
    sections: [],
  }, adminToken)
  cleanupTargets.newsIds.add(publishedNews.id)

  const draftVacancy = await createAdminRecord('/rest/v1/career_vacancies', {
    title: originalVacancyTitle,
    department: 'Security Test',
    location: 'Accra',
    employment_type: 'Temporary',
    summary: 'Temporary draft used for public API security verification.',
    responsibilities: [],
    status: 'closed',
    is_published: false,
    application_email: 'security-test@example.invalid',
  }, adminToken)
  cleanupTargets.vacancyIds.add(draftVacancy.id)

  const publishedVacancy = await createAdminRecord('/rest/v1/career_vacancies', {
    title: `RLS published vacancy ${runId}`,
    department: 'Security Test',
    location: 'Accra',
    employment_type: 'Temporary',
    summary: 'Temporary published record used for public API security verification.',
    responsibilities: [],
    status: 'closed',
    is_published: true,
    application_email: 'security-test@example.invalid',
  }, adminToken)
  cleanupTargets.vacancyIds.add(publishedVacancy.id)

  const encodedDraftNewsId = encodeURIComponent(draftNews.id)
  const encodedPublishedNewsId = encodeURIComponent(publishedNews.id)
  const encodedDraftVacancyId = encodeURIComponent(draftVacancy.id)
  const encodedPublishedVacancyId = encodeURIComponent(publishedVacancy.id)

  const anonPublishedNews = await request(`/rest/v1/news_articles?id=eq.${encodedPublishedNewsId}&select=id`)
  const anonDraftNews = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}&select=id`)
  const anonPublishedVacancy = await request(`/rest/v1/career_vacancies?id=eq.${encodedPublishedVacancyId}&select=id`)
  const anonDraftVacancy = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}&select=id`)
  record('Anonymous visitors can read published news', anonPublishedNews.ok && rows(anonPublishedNews).length === 1, `HTTP ${anonPublishedNews.status}`)
  record('Anonymous visitors cannot read draft news', anonDraftNews.ok && rows(anonDraftNews).length === 0, `HTTP ${anonDraftNews.status}`)
  record('Anonymous visitors can read published vacancies', anonPublishedVacancy.ok && rows(anonPublishedVacancy).length === 1, `HTTP ${anonPublishedVacancy.status}`)
  record('Anonymous visitors cannot read draft vacancies', anonDraftVacancy.ok && rows(anonDraftVacancy).length === 0, `HTTP ${anonDraftVacancy.status}`)

  const nonAdminDraftNews = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}&select=id`, { token: nonAdminToken })
  const nonAdminDraftVacancy = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}&select=id`, { token: nonAdminToken })
  record('Ordinary signed-in users cannot read draft news', nonAdminDraftNews.ok && rows(nonAdminDraftNews).length === 0, `HTTP ${nonAdminDraftNews.status}`)
  record('Ordinary signed-in users cannot read draft vacancies', nonAdminDraftVacancy.ok && rows(nonAdminDraftVacancy).length === 0, `HTTP ${nonAdminDraftVacancy.status}`)

  const anonInsertNewsSlug = `rls-api-anon-insert-${runId}`
  cleanupTargets.newsSlugs.add(anonInsertNewsSlug)
  const anonNewsInsert = await request('/rest/v1/news_articles', {
    method: 'POST',
    body: { slug: anonInsertNewsSlug, title: 'Blocked', category: 'Test', summary: 'Blocked', image: '/test.jpg', image_alt: 'Blocked' },
    prefer: 'return=representation',
  })
  record('Anonymous visitors cannot create news', !anonNewsInsert.ok, `HTTP ${anonNewsInsert.status}`)

  const anonVacancyInsertTitle = `RLS anonymous insert ${runId}`
  cleanupTargets.vacancyTitles.add(anonVacancyInsertTitle)
  const anonVacancyInsert = await request('/rest/v1/career_vacancies', {
    method: 'POST',
    body: { title: anonVacancyInsertTitle, department: 'Test', location: 'Accra', summary: 'Blocked', application_email: 'security-test@example.invalid' },
    prefer: 'return=representation',
  })
  record('Anonymous visitors cannot create vacancies', !anonVacancyInsert.ok, `HTTP ${anonVacancyInsert.status}`)

  const anonNewsUpdate = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}`, {
    method: 'PATCH', body: { title: 'Anonymous update should fail' }, prefer: 'return=representation',
  })
  const anonVacancyUpdate = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}`, {
    method: 'PATCH', body: { title: 'Anonymous update should fail' }, prefer: 'return=representation',
  })
  record('Anonymous visitors cannot update news', anonNewsUpdate.ok && rows(anonNewsUpdate).length === 0, `HTTP ${anonNewsUpdate.status}; 0 rows changed`)
  record('Anonymous visitors cannot update vacancies', anonVacancyUpdate.ok && rows(anonVacancyUpdate).length === 0, `HTTP ${anonVacancyUpdate.status}; 0 rows changed`)

  const anonNewsDelete = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}`, { method: 'DELETE', prefer: 'return=representation' })
  const anonVacancyDelete = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}`, { method: 'DELETE', prefer: 'return=representation' })
  record('Anonymous visitors cannot delete news', anonNewsDelete.ok && rows(anonNewsDelete).length === 0, `HTTP ${anonNewsDelete.status}; 0 rows deleted`)
  record('Anonymous visitors cannot delete vacancies', anonVacancyDelete.ok && rows(anonVacancyDelete).length === 0, `HTTP ${anonVacancyDelete.status}; 0 rows deleted`)

  const nonAdminInsertNewsSlug = `rls-api-user-insert-${runId}`
  cleanupTargets.newsSlugs.add(nonAdminInsertNewsSlug)
  const nonAdminNewsInsert = await request('/rest/v1/news_articles', {
    method: 'POST', token: nonAdminToken,
    body: { slug: nonAdminInsertNewsSlug, title: 'Blocked', category: 'Test', summary: 'Blocked', image: '/test.jpg', image_alt: 'Blocked' },
    prefer: 'return=representation',
  })
  record('Ordinary signed-in users cannot create news', !nonAdminNewsInsert.ok, `HTTP ${nonAdminNewsInsert.status}`)

  const nonAdminVacancyInsertTitle = `RLS ordinary-user insert ${runId}`
  cleanupTargets.vacancyTitles.add(nonAdminVacancyInsertTitle)
  const nonAdminVacancyInsert = await request('/rest/v1/career_vacancies', {
    method: 'POST', token: nonAdminToken,
    body: { title: nonAdminVacancyInsertTitle, department: 'Test', location: 'Accra', summary: 'Blocked', application_email: 'security-test@example.invalid' },
    prefer: 'return=representation',
  })
  record('Ordinary signed-in users cannot create vacancies', !nonAdminVacancyInsert.ok, `HTTP ${nonAdminVacancyInsert.status}`)

  const nonAdminNewsUpdate = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}`, {
    method: 'PATCH', token: nonAdminToken, body: { title: 'Ordinary-user update should fail' }, prefer: 'return=representation',
  })
  const nonAdminVacancyUpdate = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}`, {
    method: 'PATCH', token: nonAdminToken, body: { title: 'Ordinary-user update should fail' }, prefer: 'return=representation',
  })
  record('Ordinary signed-in users cannot update news', nonAdminNewsUpdate.ok && rows(nonAdminNewsUpdate).length === 0, `HTTP ${nonAdminNewsUpdate.status}; 0 rows changed`)
  record('Ordinary signed-in users cannot update vacancies', nonAdminVacancyUpdate.ok && rows(nonAdminVacancyUpdate).length === 0, `HTTP ${nonAdminVacancyUpdate.status}; 0 rows changed`)

  const nonAdminNewsDelete = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}`, { method: 'DELETE', token: nonAdminToken, prefer: 'return=representation' })
  const nonAdminVacancyDelete = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}`, { method: 'DELETE', token: nonAdminToken, prefer: 'return=representation' })
  record('Ordinary signed-in users cannot delete news', nonAdminNewsDelete.ok && rows(nonAdminNewsDelete).length === 0, `HTTP ${nonAdminNewsDelete.status}; 0 rows deleted`)
  record('Ordinary signed-in users cannot delete vacancies', nonAdminVacancyDelete.ok && rows(nonAdminVacancyDelete).length === 0, `HTTP ${nonAdminVacancyDelete.status}; 0 rows deleted`)

  const adminNewsProof = await request(`/rest/v1/news_articles?id=eq.${encodedDraftNewsId}&select=id,title`, { token: adminToken })
  const adminVacancyProof = await request(`/rest/v1/career_vacancies?id=eq.${encodedDraftVacancyId}&select=id,title`, { token: adminToken })
  record('Blocked news operations left the draft unchanged', rows(adminNewsProof)[0]?.title === originalNewsTitle, `HTTP ${adminNewsProof.status}`)
  record('Blocked vacancy operations left the draft unchanged', rows(adminVacancyProof)[0]?.title === originalVacancyTitle, `HTTP ${adminVacancyProof.status}`)
} catch (error) {
  console.error(`ERROR | ${error.message}`)
  process.exitCode = 1
} finally {
  if (adminToken) {
    for (const id of cleanupTargets.newsIds) {
      await request(`/rest/v1/news_articles?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token: adminToken }).catch(() => {})
    }
    for (const slug of cleanupTargets.newsSlugs) {
      await request(`/rest/v1/news_articles?slug=eq.${encodeURIComponent(slug)}`, { method: 'DELETE', token: adminToken }).catch(() => {})
    }
    for (const id of cleanupTargets.vacancyIds) {
      await request(`/rest/v1/career_vacancies?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token: adminToken }).catch(() => {})
    }
    for (const title of cleanupTargets.vacancyTitles) {
      await request(`/rest/v1/career_vacancies?title=eq.${encodeURIComponent(title)}`, { method: 'DELETE', token: adminToken }).catch(() => {})
    }
  }
}

const failed = results.filter(result => !result.passed)
console.log(`\n${results.length - failed.length}/${results.length} hosted public-API checks passed.`)
if (failed.length) process.exitCode = 1
