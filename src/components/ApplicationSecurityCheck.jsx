import { useEffect, useRef, useState } from 'react'

let scriptPromise
function loadScript() {
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = resolve
    script.onerror = () => { scriptPromise = null; reject(Error('Security check unavailable.')) }
    document.head.append(script)
  })
  return scriptPromise
}

export default function ApplicationSecurityCheck({ siteKey, onToken }) {
  const container = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancelled = false, widget
    loadScript().then(() => {
      if (cancelled) return
      widget = window.turnstile.render(container.current, { sitekey: siteKey, action: 'account-opening', callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => { onToken(''); setFailed(true) } })
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true; if (widget !== undefined) window.turnstile?.remove(widget) }
  }, [siteKey, onToken])
  return <div><div ref={container} />{failed && <p role="alert">The security check is unavailable. Refresh the page before submitting.</p>}</div>
}
