// Runs before React and remains available for internal page navigation.
(() => {
  const loader = document.getElementById('site-loader')
  const root = document.getElementById('root')
  if (!loader || !root) return
  let finished, exitTimer, hideTimer, deadline, started, readyTimer, pageReady, animationReady, cycle = 0, logoUrl
  const logo = loader.querySelector('img')
  // Cache the artwork once; a fresh object URL restarts its pen animation on each page.
  const artwork = fetch(logo.src, { cache: 'force-cache' }).then(response => {
    if (!response.ok) throw Error('Logo unavailable')
    return response.blob()
  }).catch(() => null)
  const message = loader.querySelector('[data-loading-message]')
  const recovery = loader.querySelector('[data-loading-recovery]')
  const fail = () => {
    if (finished) return
    message.textContent = navigator.onLine ? 'This is taking longer than expected. You can retry or contact our team.' : 'You appear to be offline. Check your connection and try again.'
    recovery.hidden = false
  }
  const start = () => {
    cancelAnimationFrame(exitTimer); clearTimeout(readyTimer); clearTimeout(hideTimer); clearTimeout(deadline)
    exitTimer = null; readyTimer = null; finished = false; pageReady = false; animationReady = false
    const currentCycle = ++cycle
    loader.hidden = false
    loader.classList.remove('is-finished')
    message.textContent = 'Getting things ready for you…'
    recovery.hidden = true
    root.inert = true
    root.setAttribute('aria-hidden', 'true')
    document.documentElement.classList.add('site-is-loading')
    deadline = setTimeout(fail, 15000)
    const begin = () => {
      if (currentCycle !== cycle) return
      started = performance.now(); animationReady = true
      scheduleExit()
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) begin()
    else artwork.then(blob => {
      if (currentCycle !== cycle) return
      if (!blob) { begin(); return }
      if (logoUrl) URL.revokeObjectURL(logoUrl)
      logoUrl = URL.createObjectURL(blob)
      logo.onload = begin
      logo.onerror = begin
      logo.src = logoUrl
    })
  }
  const scheduleExit = () => {
    if (!pageReady || !animationReady || finished || exitTimer || readyTimer) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    // The full artwork finishes at 47%; reverse writing starts at 53% of 2400ms.
    // Reveal the website during that reverse phase, never halfway through writing.
    const phase = (performance.now() - started) % 2400
    const remaining = phase < 1320 ? 1320 - phase : phase <= 1560 ? 0 : 2400 - phase + 1320
    readyTimer = setTimeout(() => {
      exitTimer = requestAnimationFrame(() => { exitTimer = requestAnimationFrame(() => {
      finished = true
      clearTimeout(deadline)
      root.inert = false
      root.removeAttribute('aria-hidden')
      loader.classList.add('is-finished')
      document.documentElement.classList.remove('site-is-loading')
      const heading = (location.hash && document.getElementById(location.hash.slice(1))) || root.querySelector('main h1')
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }) }
      hideTimer = setTimeout(() => { loader.hidden = true }, reduced ? 0 : 540)
      }) })
    }, reduced ? 0 : remaining)
  }
  const ready = () => { pageReady = true; scheduleExit() }
  loader.querySelector('[data-loading-retry]').addEventListener('click', () => location.reload())
  window.addEventListener('rapidlink:loading', start)
  window.addEventListener('rapidlink:ready', ready)
  window.addEventListener('rapidlink:load-error', fail)
  window.addEventListener('offline', fail)
  start()
})()
