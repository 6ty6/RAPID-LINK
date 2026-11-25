import { useEffect, useState } from 'react'
import { sanityEnabled } from '../services/content/sanityContentRepository.js'

// Share in-flight reads across the header/footer and reuse short-lived public results.
const reads = new Map()
export default function useSanityContent(key, load, fallback, { clearOnError = false } = {}) {
  const [state, setState] = useState(() => ({ data: fallback, loading: sanityEnabled, error: false }))
  useEffect(() => {
    if (!sanityEnabled) return undefined
    let active = true
    const refresh = () => {
      let entry = reads.get(key)
      if (!entry || Date.now() - entry.started > 30000) {
        entry = { started: Date.now(), promise: Promise.resolve().then(load) }
        reads.set(key, entry)
      }
      entry.promise.then(data => {
        if (active) setState({ data, loading: false, error: false })
      }).catch(() => {
        if (reads.get(key) === entry) reads.delete(key)
        if (active) setState(previous => ({ data: clearOnError ? [] : previous.data, loading: false, error: true }))
      })
    }
    const visible = () => { if (!document.hidden) refresh() }
    refresh()
    document.addEventListener('visibilitychange', visible)
    return () => { active = false; document.removeEventListener('visibilitychange', visible) }
  }, [key, load, clearOnError])
  return state
}
