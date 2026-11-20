import { useEffect, useState } from 'react'
import { getPublishedSharedContent, getSharedContentSnapshot } from '../content/index.js'

let cachedSettings = null
let pendingRequest = null

function loadSettings() {
  if (cachedSettings) return Promise.resolve(cachedSettings)
  if (!pendingRequest) {
    pendingRequest = getPublishedSharedContent()
      .then(settings => {
        cachedSettings = settings
        return settings
      })
      .finally(() => { pendingRequest = null })
  }
  return pendingRequest
}

export default function useSharedContent() {
  const [initial] = useState(() => getSharedContentSnapshot())
  const [settings, setSettings] = useState(() => cachedSettings || initial.record)

  useEffect(() => {
    if (!initial.loading) return undefined
    let active = true
    loadSettings()
      .then(record => { if (active) setSettings(record) })
      .catch(() => {})
    return () => { active = false }
  }, [initial.loading])

  return settings
}
