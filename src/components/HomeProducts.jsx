import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { products as localProducts } from '../content'
import { useManagedContent } from '../cms/public'

const featuredSlugs = ['rapid-savings', 'rapid-susu', 'rapid-edu-grow', 'personal-loan', 'business-loan', 'fixed-deposit']
// Reuse clean photographs for the older catalogue image paths on these cards.
// Custom CMS uploads continue to take precedence; product detail pages are unchanged.
const cardPhotographs = {
}

export default function HomeProducts() {
  const products = useManagedContent('product', Object.entries(localProducts).map(([slug, data]) => ({ ...data, slug })))
  const featured = featuredSlugs.map(slug => products.find(product => product.slug === slug)).filter(Boolean)
  const trackRef = useRef(null)
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
  function move(direction) {
    const track = trackRef.current
    const card = track.firstElementChild
    if (!card) return
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap)
    track.scrollBy({ left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  function goToPosition(index) {
    const track = trackRef.current
    track.scrollTo({ left: (track.scrollWidth - track.clientWidth) * index / 3, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section className="section home-products" aria-labelledby="home-products-title"><div className="shell">
    <div className="section-heading"><p className="eyebrow">Explore products</p><h2 id="home-products-title">Products for your next step.</h2></div>
    <div className="product-slider" id="home-product-slider" ref={trackRef} tabIndex={0} aria-label="Browse products" onKeyDown={event => {
      if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      if (event.key.startsWith('Arrow')) move(event.key === 'ArrowRight' ? 1 : -1)
      else event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: 'instant' })
    }}>{featured.map((product,index) => <Link className={`product-card product-photo-card ${index % 2 ? 'product-photo-card-blue' : 'product-photo-card-white'}`} key={product.slug} to={`/${product.slug}`} aria-labelledby={`product-${product.slug}-title`} aria-describedby={`product-${product.slug}-intro`}>
      <span className="product-card-photo">{product.image && <img src={cardPhotographs[product.image] || product.image} alt="" loading="lazy" decoding="async" />}</span>
      <div className="product-card-copy"><span className="product-card-category">{product.category}</span><h3 id={`product-${product.slug}-title`}>{product.title}</h3><p id={`product-${product.slug}-intro`}>{product.intro}</p></div>
      <span className="quick-access-fold" aria-hidden="true" />
    </Link>)}</div>
    {canScroll && <div className="product-slider-dots" role="group" aria-label="Product navigation" style={{ '--product-dot-colour': `color-mix(in srgb, var(--blue) ${(1 - progress) * 100}%, var(--orange))` }}>
      {[0, 1, 2, 3].map(index => <button key={index} type="button" className={Math.round(progress * 3) === index ? 'is-active' : ''} aria-label={`Show product group ${index + 1} of 4`} aria-current={Math.round(progress * 3) === index ? 'true' : undefined} aria-controls="home-product-slider" onClick={() => goToPosition(index)}><span aria-hidden="true" /></button>)}
    </div>}
  </div></section>
}
