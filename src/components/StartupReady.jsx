import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePublicCms } from '../cms/public'

export default function StartupReady() {
  const cms = usePublicCms()
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useLayoutEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      window.dispatchEvent(new Event('rapidlink:loading'))
    }
  }, [pathname])
  useEffect(() => {
    if (cms.loading) return
    if (cms.error) { window.dispatchEvent(new Event('rapidlink:load-error')); return }
    // Text and controls are ready; images can finish loading in the page.
    window.dispatchEvent(new Event('rapidlink:ready'))
  }, [cms.loading, cms.error, pathname])
  return null
}
