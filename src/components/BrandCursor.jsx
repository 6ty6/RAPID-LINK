import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

const preferenceKey = 'rapidlink-standard-cursor'
const nativeTargets = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],iframe,embed,object,dialog[open],[data-native-cursor]'
const interactiveTargets = 'a[href],button,summary,[role="button"],[role="link"],label[for],[data-cursor-link]'

export default function BrandCursor() {
  const { pathname } = useLocation()
  const staffPage = ['/cms', '/content-management', '/career-management', '/accept-invite'].includes(pathname.replace(/\/$/, ''))
  const cursorRef = useRef(null)
  const [supported, setSupported] = useState(false)
  const [standard, setStandard] = useState(() => {
    try { return window.localStorage.getItem(preferenceKey) === 'true' } catch { return false }
  })
  const [preferenceHost, setPreferenceHost] = useState(null)
  useEffect(() => {
    if (!window.matchMedia) return
    const media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)')
    const update = () => setSupported(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => { setPreferenceHost(staffPage ? null : document.querySelector('.footer-bottom')) }, [pathname, staffPage])
  useEffect(() => {
    if (!supported || standard || staffPage) return
    const cursor = cursorRef.current
    let frame = 0, x = 0, y = 0, target = null
    const hide = () => { cancelAnimationFrame(frame); frame = 0; target = null; document.documentElement.classList.remove('brand-cursor-active'); cursor.dataset.visible = 'false'; cursor.dataset.pressed = 'false' }
    const move = event => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element) || event.target.closest(nativeTargets)) { hide(); return }
      x = event.clientX; y = event.clientY
      if (event.target !== target) {
        target = event.target
        const interactive = target.closest(interactiveTargets)
        cursor.dataset.interactive = String(Boolean(interactive && !interactive.matches(':disabled,[aria-disabled="true"]')))
        let dark = false
        for (let element = target; element; element = element.parentElement) {
          const values = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number)
          if (values?.length >= 3 && (values.length === 3 || values[3] >= .9)) {
            dark = values[0] * .2126 + values[1] * .7152 + values[2] * .0722 < 125
            break
          }
        }
        cursor.dataset.dark = String(dark)
      }
      if (!frame) frame = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
        cursor.dataset.visible = 'true'
        document.documentElement.classList.add('brand-cursor-active')
        frame = 0
      })
    }
    const down = () => { cursor.dataset.pressed = 'true' }
    const up = () => { cursor.dataset.pressed = 'false' }
    const keyboard = () => hide()
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerdown', down, { passive: true })
    document.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('pointerleave', hide)
    document.addEventListener('keydown', keyboard)
    window.addEventListener('blur', hide)
    document.addEventListener('visibilitychange', hide)
    return () => {
      cancelAnimationFrame(frame); hide()
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', hide)
      document.removeEventListener('keydown', keyboard)
      window.removeEventListener('blur', hide)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [supported, standard, staffPage, pathname])
  function toggle() {
    const value = !standard
    setStandard(value)
    try { window.localStorage.setItem(preferenceKey, String(value)) } catch { /* Keep the preference for this visit. */ }
  }
  if (!supported || staffPage) return null
  return <>
    {!standard && <div ref={cursorRef} className="brand-cursor" aria-hidden="true" data-visible="false"><span className="brand-cursor-ring" /><span className="brand-cursor-dot" /><svg className="brand-cursor-pointer" width="16" height="18" viewBox="0 0 16 18"><path d="M2 1.5 14 10l-6 .5-2.5 5Z" fill="white" stroke="#102b46" strokeWidth="1.3" strokeLinejoin="round" /></svg></div>}
    {preferenceHost && createPortal(<button type="button" className="cursor-preference" onClick={toggle} aria-pressed={standard}>{standard ? 'Use RapidLink cursor' : 'Use standard cursor'}</button>, preferenceHost)}
  </>
}
