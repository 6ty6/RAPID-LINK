import { useEffect, useState } from 'react'
import {
  getLoanCalculatorSettingsSnapshot,
  getPublishedLoanCalculatorSettings,
} from '../content/index.js'

let cachedSettings = null
let pendingRequest = null

function loadSettings() {
  if (cachedSettings) return Promise.resolve(cachedSettings)
  if (!pendingRequest) {
    pendingRequest = getPublishedLoanCalculatorSettings()
      .then(settings => {
        cachedSettings = settings
        return settings
      })
      .finally(() => { pendingRequest = null })
  }
  return pendingRequest
}

export default function useLoanCalculatorSettings() {
  const [initial] = useState(() => getLoanCalculatorSettingsSnapshot())
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
