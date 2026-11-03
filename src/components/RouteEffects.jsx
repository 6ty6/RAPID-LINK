import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function RouteEffects() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.tabIndex = -1
        target.focus({ preventScroll: true })
        target.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    const heading = document.querySelector('main h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [pathname, hash])

  return null
}
