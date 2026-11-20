import { createClient } from '@supabase/supabase-js'
export const cmsBase = (import.meta.env.VITE_CMS_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8791' : '')).replace(/\/$/, '')
let sessionToken = ''
export function setCmsToken(value) { sessionToken = value || '' }
export function hasCmsSession() { return Boolean(sessionToken) }
export async function cmsRequest(path, { method = 'GET', body, headers = {} } = {}) {
  if (!cmsBase) throw Error('The CMS service is not configured.')
  const response = await fetch(`${cmsBase}/api/cms${path}`, { method, credentials: 'omit', headers: { ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}), ...(body !== undefined && !(body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body instanceof Blob ? body : body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) })
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw Error(error.error || 'The CMS service could not complete this request.') }
  if (response.headers.get('Content-Type')?.startsWith('image/')) return response.blob()
  return response.json()
}
let authClient
export function getCmsAuth(config) {
  if (!authClient) authClient = createClient(config.authUrl, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false } })
  return authClient
}
export function mediaUrl(value) { return value?.startsWith('media:') ? `${cmsBase}/api/cms/media/${value.slice(6)}` : value }
