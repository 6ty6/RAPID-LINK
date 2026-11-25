import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function StartupReady() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useLayoutEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      window.dispatchEvent(new Event('rapidlink:loading'))
    }
  }, [pathname])
  useEffect(() => {
    // Text and controls are ready; images can finish loading in the page.
    window.dispatchEvent(new Event('rapidlink:ready'))
  }, [pathname])
  return null
}
