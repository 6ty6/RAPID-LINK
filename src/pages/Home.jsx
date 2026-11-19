import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Landmark, Smartphone, WalletCards } from '../icons'
import { getHomepageContent, getProductBySlug } from '../content/index.js'
import { AppDownload, PageMeta } from '../components/Shared'
import usePublishedNews from '../hooks/usePublishedNews'

const homepage = getHomepageContent()
const slides = homepage.hero.slides
const homepageIcons = {
  business: Building2,
  calendar: CalendarDays,
  mobile: Smartphone,
  rates: WalletCards,
  savings: Landmark,
}

const mobileSliderQuery = '(max-width: 760px)'

function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [flyerOpen, setFlyerOpen] = useState(false)
  const [manualPaused, setManualPaused] = useState(false)
  const flyerDialog = useRef(null)
  const slide = slides[current]
  const isPaused = interactionPaused || flyerOpen
  const move = step => setCurrent(value => (value + step + slides.length) % slides.length)

  useEffect(() => {
    if (isPaused) return undefined
    const timer = window.setTimeout(() => move(1), 11000)
    return () => window.clearTimeout(timer)
  }, [isPaused, current])

  useEffect(() => {
    if (!flyerOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [flyerOpen])

  function openFlyer() {
    flyerDialog.current.showModal()
    setFlyerOpen(true)
  }

  return <section className="hero hero-flyer" aria-roledescription="carousel" aria-label={homepage.hero.accessibleLabel}
    onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)}
    onFocusCapture={() => setInteractionPaused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false) }}>
    <div className="flyer-stage">
      {slides.map((item, index) => <div className={`hero-media ${index === current ? 'is-active' : ''}`} aria-hidden={index !== current} key={item.title}>
        <picture><img src={item.image} alt={`RapidLink promotional flyer: ${item.title}`} loading={index === 0 ? 'eager' : 'lazy'} fetchpriority={index === 0 ? 'high' : 'low'} decoding="async" /></picture>
      </div>)}
      <button className="flyer-arrow flyer-previous" onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button>
      <button className="flyer-arrow flyer-next" onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button>
    </div>
    <div className="flyer-caption"><div className="shell hero-content" key={slide.title} aria-live={isPaused ? 'polite' : 'off'}>
      <p className="eyebrow">{slide.eyebrow}</p>
      <h1>{slide.title}</h1>
      <p>{slide.text}</p>
      <div className="button-row"><Link className="button flyer-action" to={slide.link}>{slide.action}</Link><button className="button flyer-view" onClick={openFlyer}>View full flyer</button></div>
    </div></div>
    <div className="hero-controls">
      <div className="dots">{slides.map((item, index) => <button key={item.title} className={current === index ? 'active' : ''} onClick={() => setCurrent(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={current === index ? 'true' : undefined}><span aria-hidden="true" /></button>)}</div>
    </div>
    <dialog ref={flyerDialog} className="flyer-dialog" aria-labelledby="flyer-dialog-title" onClose={() => setFlyerOpen(false)} onClick={event => { if (event.target === event.currentTarget) flyerDialog.current.close() }}>
      <div className="flyer-dialog-toolbar"><h2 id="flyer-dialog-title">Full flyer</h2><button className="button button-secondary" onClick={() => flyerDialog.current.close()} autoFocus>Close flyer</button></div>
      <p>Scroll to read the flyer, or open the original image to zoom in.</p>
      <a href={slide.image} target="_blank" rel="noopener noreferrer">Open original image in a new tab</a>
      <div className="flyer-dialog-image"><img src={slide.image} alt={`RapidLink promotional flyer: ${slide.title}`} /></div>
    </dialog>
  </section>
}

function ProductCard({ productKey, detailLabel }) {
  const product = getProductBySlug(productKey)
  return <article className="product-card">
    <span>{product.category}</span><h3>{product.title}</h3><p>{product.intro}</p>
    <Link to={`/${productKey}`}>{detailLabel} <ArrowRight size={16} /></Link>
  </article>
}

export default function Home() {
  const { articles } = usePublishedNews()
  const latestNews = [...articles].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)).slice(0, homepage.news.maximumItems)

  return <>
    <PageMeta title={homepage.meta.title} description={homepage.meta.description} image={homepage.meta.image} />
    <HeroSlider />
    <section className="home-quick-access" aria-labelledby="quick-access-title"><div className="shell quick-access-layout">
      <div className="quick-access-heading"><p className="eyebrow">{homepage.quickAccess.eyebrow}</p><h2 id="quick-access-title">{homepage.quickAccess.title}</h2></div>
      <div className="quick-access-links">
        {homepage.quickAccess.items.map(item => {
          const Icon = homepageIcons[item.icon]
          return <Link className="quick-access-card" to={item.href} key={item.href}><span><Icon /></span><div><strong>{item.title}</strong><small>{item.description}</small></div><ArrowRight /></Link>
        })}
      </div>
    </div></section>
    <section className="section notices"><div className="shell">
      <div className="section-heading"><p className="eyebrow">{homepage.news.eyebrow}</p><h2>{homepage.news.title}</h2></div>
      <div className="notice-grid">{latestNews.map(article => <article className="notice-card" key={article.slug}>
        <CircleAlert aria-hidden="true" /><p className="notice-category">{article.category}</p><h3>{article.title}</h3><p>{article.summary}</p>
        <Link to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>Read full story <ArrowRight size={16} /></Link>
      </article>)}</div>
      <div className="news-home-action"><Link className="button button-secondary" to={homepage.news.allNewsHref}>{homepage.news.allNewsLabel} <ArrowRight size={17} /></Link></div>
    </div></section>
    <section className="section warm"><div className="shell split">
      <div><p className="eyebrow">{homepage.services.eyebrow}</p><h2>{homepage.services.title}</h2><p className="lead">{homepage.services.introduction}</p><Link className="text-link" to={homepage.services.profileHref}>{homepage.services.profileLabel} <ArrowRight size={17} /></Link></div>
      <div className="service-list">{homepage.services.items.map(item => {
        const Icon = homepageIcons[item.icon]
        return <Link key={item.label} to={item.href}><Icon /><span>{item.label}</span><ArrowRight /></Link>
      })}</div>
    </div></section>
    <section className="section"><div className="shell">
      <div className="section-heading"><p className="eyebrow">{homepage.products.eyebrow}</p><h2>{homepage.products.title}</h2></div>
      <div className="card-grid">{homepage.products.featuredKeys.map(key => <ProductCard key={key} productKey={key} detailLabel={homepage.products.detailLabel} />)}</div>
    </div></section>
    <AppDownload />
  </>
}
