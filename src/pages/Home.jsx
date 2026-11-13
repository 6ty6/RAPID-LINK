import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, ChevronLeft, ChevronRight, Landmark, Smartphone, WalletCards } from '../icons'
import { getHomepageContent, getProductBySlug } from '../content/index.js'
import { AppDownload, PageMeta } from '../components/Shared'
import usePublishedNews from '../hooks/usePublishedNews'

const homepage = getHomepageContent()
const slides = homepage.hero.slides
const icons = { business: Building2, calendar: CalendarDays, mobile: Smartphone, rates: WalletCards, savings: Landmark }

function DigitalHero() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = slides[current]
  const move = step => setCurrent(value => (value + step + slides.length) % slides.length)
  useEffect(() => { if (paused) return undefined; const timer = window.setTimeout(() => move(1), 7500); return () => window.clearTimeout(timer) }, [current, paused])

  return <section className="hero df-hero" aria-label={homepage.hero.accessibleLabel} aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => !event.currentTarget.contains(event.relatedTarget) && setPaused(false)}>
    <div className="df-grid-lines" aria-hidden="true" />
    <div className="shell df-hero-layout">
      <div className="hero-content df-hero-copy" aria-hidden="false" aria-live={paused ? 'polite' : 'off'}>
        <div className="df-live"><i />RapidLink service hub</div><p className="eyebrow">{slide.eyebrow}</p><h1>{slide.title}</h1><p>{slide.text}</p>
        <div className="df-hero-actions"><Link className="button" to={slide.link}>{slide.action}<ArrowRight size={18} /></Link><Link to="/digital-channels">Explore digital channels</Link></div>
        <div className="df-slider-index">{slides.map((item, index) => <button className={index === current ? 'active' : ''} key={item.title} onClick={() => setCurrent(index)} aria-label={`Show slide ${index + 1}: ${item.title}`}><span>0{index + 1}</span><i /></button>)}</div>
      </div>
      <div className="df-hero-media">
        {slides.map((item, index) => <picture className={index === current ? 'is-active' : ''} key={item.title} aria-hidden={index !== current}>{item.mobileImage && <source media="(max-width:760px)" srcSet={item.mobileImage} />}<img src={item.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} /></picture>)}
        <div className="df-image-tag"><span>Featured update</span><strong>{slide.eyebrow}</strong></div>
        <div className="df-arrow-controls"><button onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button><button onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button></div>
      </div>
    </div>
  </section>
}

export default function Home() {
  const { articles } = usePublishedNews()
  const latestNews = [...articles].sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0,3)
  return <>
    <PageMeta title={homepage.meta.title} description={homepage.meta.description} image={homepage.meta.image} />
    <DigitalHero />

    <section className="df-tool-dock"><div className="shell">
      <div className="quick-access-heading"><span>Quick access</span><h2>Tools at your fingertips</h2></div>
      {homepage.quickAccess.items.map(item => { const Icon = icons[item.icon]; return <Link className="quick-access-card" key={item.href} to={item.href}><Icon /><div><strong>{item.title}</strong><small>{item.description}</small></div><ArrowRight /></Link> })}
      <Link className="df-dock-action" to="/open-account"><span>Become a customer</span><strong>Open an account</strong><ArrowRight /></Link>
      <Link className="df-dock-action" to="/contact"><span>Need support?</span><strong>Contact RapidLink</strong><ArrowRight /></Link>
    </div></section>

    <section className="section df-service-console"><div className="shell">
      <div className="df-heading"><div><p className="eyebrow">Service console</p><h2>Choose how you want to move.</h2></div><p>{homepage.services.introduction}</p></div>
      <div className="df-service-grid">{homepage.services.items.map((item,index) => { const Icon = icons[item.icon]; return <Link key={item.href} to={item.href}><span>0{index+1}</span><Icon /><h3>{item.label}</h3><p>{index === 0 ? 'Build reserves and work toward personal goals.' : index === 1 ? 'Explore credit options for people and enterprises.' : 'Access approved services from your mobile phone.'}</p><strong>Open service <ArrowRight size={16} /></strong></Link> })}</div>
    </div></section>

    <section className="section df-product-index"><div className="shell">
      <div className="df-heading"><div><p className="eyebrow">Product index</p><h2>Compare the routes available.</h2></div><Link to="/rapid-savings">View savings products <ArrowRight size={16} /></Link></div>
      <div className="df-product-table"><div className="df-table-head"><span>Product</span><span>Category</span><span>Designed for</span><span>Explore</span></div>{homepage.products.featuredKeys.map(slug => { const product = getProductBySlug(slug); return <Link key={slug} to={`/${slug}`}><strong>{product.title}</strong><span>{product.category}</span><p>{product.intro}</p><ArrowRight /></Link> })}</div>
    </div></section>

    <section className="section df-updates"><div className="shell df-updates-layout">
      <div className="df-updates-title"><p className="eyebrow">Information stream</p><h2>Latest from RapidLink.</h2><Link to="/stories">Open all updates <ArrowRight size={16} /></Link></div>
      <div className="df-update-list">{latestNews.map(article => <article key={article.slug}><div><span>{article.category}</span><time>{article.publishedAt}</time></div><h3>{article.title}</h3><p>{article.summary}</p><Link to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>Read update <ArrowRight size={16} /></Link></article>)}</div>
    </div></section>
    <AppDownload />
  </>
}
