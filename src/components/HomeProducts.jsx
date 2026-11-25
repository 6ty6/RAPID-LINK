import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import usePageContent from '../hooks/usePageContent.js'

export default function HomeProducts() {
  const {data:homepage}=usePageContent('homepage')
  const {data:products}=usePageContent('products')
  const featured = homepage.products.featuredSlugs.map(slug => products.find(product => product.slug === slug)).filter(Boolean)
  const trackRef = useRef(null)
  const interaction = useRef({hovered:false,focused:false,resumeAt:0})
  const [progress, setProgress] = useState(0)
  const [canScroll, setCanScroll] = useState(false)
  useEffect(() => {
    const track = trackRef.current
    const update = () => {
      const maximum = track.scrollWidth - track.clientWidth
      setCanScroll(maximum > 2)
      setProgress(maximum > 0 ? Math.max(0, Math.min(1, track.scrollLeft / maximum)) : 0)
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(track)
    window.addEventListener('resize', update)
    track.addEventListener('scroll', update, { passive: true })
    update()
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); track.removeEventListener('scroll', update) }
  }, [featured.length])
  useEffect(() => {
    const timer = window.setInterval(() => {
      const track = trackRef.current
      const state = interaction.current
      if (!track || document.hidden || state.hovered || state.focused || Date.now() < state.resumeAt || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const bounds = track.getBoundingClientRect()
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return
      const maximum = track.scrollWidth - track.clientWidth
      const card = track.firstElementChild
      if (maximum <= 2 || !card) return
      const step = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0)
      track.scrollTo({left:track.scrollLeft >= maximum - 3 ? 0 : Math.min(maximum,track.scrollLeft + step),behavior:'smooth'})
    }, 6000)
    return () => window.clearInterval(timer)
  }, [featured.length])
  function pauseAfterInteraction() {
    interaction.current.resumeAt = Date.now() + 9000
  }
  function move(direction) {
    const track = trackRef.current
    const card = track.firstElementChild
    if (!card) return
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap)
    track.scrollBy({ left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  function goToPosition(index) {
    pauseAfterInteraction()
    const track = trackRef.current
    track.scrollTo({ left: (track.scrollWidth - track.clientWidth) * index / 3, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section className="section home-products" aria-labelledby="home-products-title"
    onPointerEnter={event => { if (event.pointerType === 'mouse') interaction.current.hovered = true }}
    onPointerLeave={event => { if (event.pointerType === 'mouse') { interaction.current.hovered = false; pauseAfterInteraction() } }}
    onFocusCapture={() => { interaction.current.focused = true }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) { interaction.current.focused = false; pauseAfterInteraction() } }}
    onPointerDown={pauseAfterInteraction} onWheel={pauseAfterInteraction} onKeyDownCapture={pauseAfterInteraction}><div className="shell">
    <div className="section-heading"><p className="eyebrow">{homepage.products.eyebrow}</p><h2 id="home-products-title">{homepage.products.title}</h2></div>
    <div className="product-slider" id="home-product-slider" ref={trackRef} tabIndex={0} aria-label="Browse products" onKeyDown={event => {
      if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      if (event.key.startsWith('Arrow')) move(event.key === 'ArrowRight' ? 1 : -1)
      else event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: 'instant' })
    }}>{featured.map((product,index) => <Link className={`product-card product-photo-card ${index % 2 ? 'product-photo-card-blue' : 'product-photo-card-white'}`} key={product.slug} to={`/${product.slug}`} aria-labelledby={`product-${product.slug}-title`} aria-describedby={`product-${product.slug}-intro`}>
      <span className="product-card-photo">{product.image && <img data-product={product.slug} src={product.image} alt="" loading="lazy" decoding="async" />}</span>
      <div className="product-card-copy"><span className="product-card-category">{product.category}</span><h3 id={`product-${product.slug}-title`}>{product.title}</h3><p id={`product-${product.slug}-intro`}>{product.intro}</p></div>
      <span className="quick-access-fold" aria-hidden="true" />
    </Link>)}</div>
    {canScroll && <div className="product-slider-dots" role="group" aria-label="Product navigation" style={{ '--product-dot-colour': `color-mix(in srgb, var(--blue) ${(1 - progress) * 100}%, var(--orange))` }}>
      {[0, 1, 2, 3].map(index => <button key={index} type="button" className={Math.round(progress * 3) === index ? 'is-active' : ''} aria-label={`Show product group ${index + 1} of 4`} aria-current={Math.round(progress * 3) === index ? 'true' : undefined} aria-controls="home-product-slider" onClick={() => goToPosition(index)}><span aria-hidden="true" /></button>)}
    </div>}
  </div></section>
}
