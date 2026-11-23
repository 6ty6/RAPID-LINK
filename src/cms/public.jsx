import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { refreshSavingsImage } from '../content/savingsImage'
export const cmsBase = (import.meta.env.VITE_CMS_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8791' : '')).replace(/\/$/, '')
export const customCmsEnabled = import.meta.env.VITE_CUSTOM_CMS_ENABLED === 'true'
const Context = createContext({ enabled: false, records: [], loading: false, error: false })
export function resolveMedia(value) {
  if (typeof value === 'string' && /^media:[a-f0-9-]{36}$/.test(value)) return `${cmsBase}/api/cms/media/${value.slice(6)}`
  if (Array.isArray(value)) return value.map(resolveMedia)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveMedia(item)]))
  return value
}
export function PublicCmsProvider({ children }) {
  const { pathname } = useLocation()
  const [state, setState] = useState({ enabled: customCmsEnabled, records: [], loading: customCmsEnabled, error: false, pathname })
  useEffect(() => {
    if (!customCmsEnabled) return
    let active = true, controller
    async function refresh() {
      controller?.abort(); controller = new AbortController()
      try {
        const response = await fetch(`${cmsBase}/api/cms/public`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]), credentials: 'omit', cache: 'no-store' })
        if (!response.ok) throw Error('Content unavailable')
        const result = await response.json()
        if (!Array.isArray(result.records)) throw Error('Invalid content response')
        const records = result.records.map(record => refreshSavingsImage({ ...resolveMedia(record.data), id: record.id, title: record.title, slug: record.slug, kind: record.kind }))
        if (active) setState({ enabled: true, records, loading: false, error: false, pathname })
      } catch (error) {
        if (active && error.name !== 'AbortError') setState({ enabled: true, records: [], loading: false, error: true, pathname })
      }
    }
    refresh()
    const timer = setInterval(refresh, 30000)
    const visible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', visible)
    return () => { active = false; controller?.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', visible) }
  }, [pathname])
  return <Context.Provider value={{ ...state, loading: state.loading || (customCmsEnabled && state.pathname !== pathname) }}>{children}</Context.Provider>
}
export function usePublicCms() { return useContext(Context) }
export function useManagedContent(kind, fallback) {
  const context = usePublicCms()
  return context.enabled ? context.records.filter(record => record.kind === kind).sort((a, b) => (a.order || 0) - (b.order || 0)) : fallback
}
export function PublicCmsStatus() {
  const { enabled, loading, error } = usePublicCms()
  if (!enabled || (!loading && !error)) return null
  return <p role="status" className="shell">{loading ? 'Loading published information…' : 'Some information is temporarily unavailable. Please contact our team for assistance.'}</p>
}
