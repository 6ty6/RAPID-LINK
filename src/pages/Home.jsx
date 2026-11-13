import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, ChevronLeft, ChevronRight, Landmark, Smartphone, WalletCards } from '../icons'
import { getHomepageContent, getProductBySlug } from '../content/index.js'
import { AppDownload, PageMeta } from '../components/Shared'
import usePublishedNews from '../hooks/usePublishedNews'

const homepage = getHomepageContent()
const slides = homepage.hero.slides
const icons = { business: Building2, calendar: CalendarDays, mobile: Smartphone, rates: WalletCards, savings: Landmark }

function StoryHero() {
  const [current, setCurrent] = useState(0)
  const [showCopy, setShowCopy] = useState(true)
  const [paused, setPaused] = useState(false)
  const slide = slides[current]
  const show = index => { setShowCopy(false); setCurrent(index); window.setTimeout(() => setShowCopy(true), 450) }
  const move = step => show((current + step + slides.length) % slides.length)

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setTimeout(() => move(1), 8000)
    return () => window.clearTimeout(timer)
  }, [current, paused])

  return <section className="hero hc-hero" aria-label={homepage.hero.accessibleLabel} aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => !event.currentTarget.contains(event.relatedTarget) && setPaused(false)}>
    {slides.map((item, index) => <picture className={`hc-hero-image${index === current ? ' is-active' : ''}`} key={item.title} aria-hidden={index !== current}>
      {item.mobileImage && <source media="(max-width: 760px)" srcSet={item.mobileImage} />}<img src={item.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
    </picture>)}
    <div className="hc-hero-shade" aria-hidden="true" />
    <div className="shell hc-hero-shell">
      <div className={`hero-content hc-story-card${showCopy ? ' is-visible' : ''}`} aria-hidden={!showCopy} aria-live={paused ? 'polite' : 'off'}>
        <p className="eyebrow">{slide.eyebrow}</p><h1>{slide.title}</h1><p>{slide.text}</p>
        <Link className="button" to={slide.link}>{slide.action}<ArrowRight size={18} /></Link>
      </div>
      <div className="hc-hero-nav"><span>{String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span><button onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button><button onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button></div>
    </div>
  </section>
}

function GoalCard({ slug, label, copy, icon: Icon }) {
  const product = getProductBySlug(slug)
  return <Link className="hc-goal-card" to={`/${slug}`}><Icon /><span>{label}</span><h3>{product.title}</h3><p>{copy}</p><strong>See how it works <ArrowRight size={16} /></strong></Link>
}

export default function Home() {
  const { articles } = usePublishedNews()
  const latestNews = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3)

  return <>
    <PageMeta title={homepage.meta.title} description={homepage.meta.description} image={homepage.meta.image} />
    <StoryHero />

    <section className="hc-shortcuts"><div className="shell">
      <div className="quick-access-heading"><span>Helpful tools</span><h2>Tools at your fingertips</h2></div>
      {homepage.quickAccess.items.map(item => { const Icon = icons[item.icon]; return <Link className="quick-access-card" key={item.href} to={item.href}><Icon /><div><strong>{item.title}</strong><small>{item.description}</small></div><ArrowRight /></Link> })}
      <Link className="hc-help-link" to="/contact"><span>Need a person?</span><strong>Talk to our team</strong><ArrowRight /></Link>
    </div></section>

    <section className="section hc-goals"><div className="shell">
      <div className="hc-centred-heading"><p className="eyebrow">Built around real life</p><h2>Start with what matters to you.</h2><p>Choose the goal closest to yours and explore a practical route forward.</p></div>
      <div className="hc-goal-grid">
        <GoalCard slug="rapid-savings" label="Everyday confidence" copy="Build a dependable saving rhythm with flexible access." icon={Landmark} />
        <GoalCard slug="rapid-edu-grow" label="A child’s future" copy="Prepare steadily for school fees and education needs." icon={CalendarDays} />
        <GoalCard slug="business-loan" label="A growing business" copy="Explore financing designed for entrepreneurs and SMEs." icon={Building2} />
      </div>
    </div></section>

    <section className="hc-products section"><div className="shell hc-products-layout">
      <div className="hc-products-image"><img src="/assets/rapid-susu.jpg" alt="A market trader standing in front of her produce stall" loading="lazy" /><div><span>Banking that comes closer</span><strong>Save consistently with Rapid Susu.</strong><Link to="/rapid-susu">Explore Rapid Susu <ArrowRight size={16} /></Link></div></div>
      <div className="hc-products-list"><p className="eyebrow">More ways forward</p><h2>Find something that fits.</h2>{homepage.products.featuredKeys.slice(3).map(slug => { const product = getProductBySlug(slug); return <Link key={slug} to={`/${slug}`}><div><small>{product.category}</small><strong>{product.title}</strong></div><ArrowRight /></Link> })}</div>
    </div></section>

    <section className="section hc-news"><div className="shell">
      <div className="hc-news-heading"><div><p className="eyebrow">From RapidLink</p><h2>News that helps you stay informed.</h2></div><Link to="/stories">All news <ArrowRight size={16} /></Link></div>
      <div className="hc-news-rail">{latestNews.map((article, index) => <article key={article.slug}>
        <span>{String(index + 1).padStart(2, '0')}</span><div><small>{article.category}</small><h3>{article.title}</h3><p>{article.summary}</p><Link to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>Read the story <ArrowRight size={16} /></Link></div>
      </article>)}</div>
    </div></section>
    <AppDownload />
  </>
}
