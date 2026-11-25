import { useEffect, useState } from 'react'
import { sanityEnabled } from '../services/content/sanityContentRepository.js'

// One in-flight read and refresh timer per content type, shared by all consumers.
// Completed responses are not cached; unchanged data keeps its object identity.
const subscriptions = new Map()
export default function useSanityContent(key, load, fallback, { clearOnError = false } = {}) {
  const [state, setState] = useState(() => ({ data: fallback, loading: sanityEnabled, error: false }))
  useEffect(() => {
    if (!sanityEnabled) return undefined
    let entry = subscriptions.get(key)
    if (!entry) {
      entry = { listeners:new Set(), pending:null }
      entry.refresh = () => {
        if (entry.pending) return
        entry.pending = Promise.resolve().then(load)
          .then(data => entry.listeners.forEach(listener => listener(data, false)))
          .catch(() => entry.listeners.forEach(listener => listener(undefined, true)))
          .finally(() => { entry.pending = null })
      }
      entry.visible = () => { if (!document.hidden) entry.refresh() }
      entry.timer = setInterval(entry.visible, 5000)
      document.addEventListener('visibilitychange', entry.visible)
      window.addEventListener('focus', entry.visible)
      subscriptions.set(key, entry)
    }
    const listener = (data, error) => setState(previous => {
      const nextData = error ? (clearOnError ? [] : previous.data) : data
      const unchanged = JSON.stringify(previous.data) === JSON.stringify(nextData)
      if (unchanged && !previous.loading && previous.error === error) return previous
      return { data:unchanged ? previous.data : nextData, loading:false, error }
    })
    entry.listeners.add(listener)
    entry.refresh()
    return () => {
      entry.listeners.delete(listener)
      if (!entry.listeners.size) {
        clearInterval(entry.timer)
        document.removeEventListener('visibilitychange', entry.visible)
        window.removeEventListener('focus', entry.visible)
        if (subscriptions.get(key) === entry) subscriptions.delete(key)
      }
    }
  }, [key, load, clearOnError])
  return state
}
