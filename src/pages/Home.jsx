import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, ChevronLeft, ChevronRight, Landmark, Smartphone, WalletCards } from '../icons'
import { getHomepageContent, getProductBySlug } from '../content/index.js'
import { AppDownload, PageMeta } from '../components/Shared'
import usePublishedNews from '../hooks/usePublishedNews'

const homepage = getHomepageContent()
const slides = homepage.hero.slides
const icons = { business: Building2, calendar: CalendarDays, mobile: Smartphone, rates: WalletCards, savings: Landmark }

function AdvisoryHero() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = slides[current]
  const move = step => setCurrent(value => (value + step + slides.length) % slides.length)

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setTimeout(() => move(1), 9000)
    return () => window.clearTimeout(timer)
  }, [current, paused])

  return <section className="hero ct-hero" aria-label={homepage.hero.accessibleLabel} aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => !event.currentTarget.contains(event.relatedTarget) && setPaused(false)}>
    <div className="shell ct-hero-layout">
      <div className="hero-content ct-hero-copy" aria-hidden="false" aria-live={paused ? 'polite' : 'off'}>
        <div className="ct-slide-count"><span>0{current + 1}</span><i /><span>0{slides.length}</span></div>
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="ct-hero-actions"><Link className="button" to={slide.link}>{slide.action}<ArrowRight size={18} /></Link><Link className="ct-text-action" to="/institutional-profile">Why RapidLink</Link></div>
      </div>
      <div className="ct-hero-visual">
        {slides.map((item, index) => <picture className={index === current ? 'is-active' : ''} key={item.title} aria-hidden={index !== current}>
          {item.mobileImage && <source media="(max-width: 760px)" srcSet={item.mobileImage} />}
          <img src={item.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
        </picture>)}
        <div className="ct-hero-controls">
          <button onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button>
          <div>{slides.map((item, index) => <button key={item.title} className={index === current ? 'active' : ''} aria-label={`Show slide ${index + 1}: ${item.title}`} onClick={() => setCurrent(index)} />)}</div>
          <button onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button>
        </div>
      </div>
    </div>
  </section>
}

function ProductRow({ slug, index }) {
  const product = getProductBySlug(slug)
  return <Link className="ct-product-row" to={`/${slug}`}>
    <span>0{index + 1}</span><div><small>{product.category}</small><h3>{product.title}</h3><p>{product.intro}</p></div><ArrowRight />
  </Link>
}

export default function Home() {
  const { articles } = usePublishedNews()
  const latestNews = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3)

  return <>
    <PageMeta title={homepage.meta.title} description={homepage.meta.description} image={homepage.meta.image} />
    <AdvisoryHero />

    <section className="ct-intent" aria-labelledby="intent-title"><div className="shell ct-intent-layout">
      <div><p className="eyebrow">Start with your goal</p><h2 id="intent-title">What would you like to do?</h2></div>
      <div className="ct-intent-actions">
        <Link to="/rapid-savings"><Landmark /><span><strong>Grow my savings</strong><small>Everyday and goal-based options</small></span><ArrowRight /></Link>
        <Link to="/personal-loan"><WalletCards /><span><strong>Find a loan</strong><small>Personal and business support</small></span><ArrowRight /></Link>
        <Link to="/digital-channels"><Smartphone /><span><strong>Bank digitally</strong><small>Mobile, USSD and payments</small></span><ArrowRight /></Link>
      </div>
    </div></section>

    <section className="ct-overview section"><div className="shell ct-overview-layout">
      <div className="ct-overview-copy"><p className="eyebrow">Financial clarity</p><h2>Practical solutions, presented clearly.</h2><p>{homepage.services.introduction}</p><Link className="ct-text-action" to={homepage.services.profileHref}>{homepage.services.profileLabel}<ArrowRight size={16} /></Link></div>
      <div className="ct-tools-panel"><div className="quick-access-heading"><span>Useful now</span><h2>Tools at your fingertips</h2></div>{homepage.quickAccess.items.map(item => {
        const Icon = icons[item.icon]
        return <Link className="quick-access-card" key={item.href} to={item.href}><Icon /><div><strong>{item.title}</strong><small>{item.description}</small></div><ArrowRight /></Link>
      })}</div>
    </div></section>

    <section className="ct-products section"><div className="shell">
      <div className="ct-section-heading"><div><p className="eyebrow">Products & services</p><h2>Choose a route that fits your plans.</h2></div><Link to="/rapid-savings">Explore savings <ArrowRight size={16} /></Link></div>
      <div className="ct-product-directory">{homepage.products.featuredKeys.map((slug, index) => <ProductRow key={slug} slug={slug} index={index} />)}</div>
    </div></section>

    <section className="ct-news section"><div className="shell">
      <div className="ct-section-heading"><div><p className="eyebrow">News & notices</p><h2>Information worth knowing.</h2></div><Link to="/stories">View all news <ArrowRight size={16} /></Link></div>
      <div className="ct-news-grid">{latestNews.map((article, index) => <article key={article.slug} className={index === 0 ? 'is-featured' : ''}>
        <div><span>{article.category}</span><time>{new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</time></div>
        <h3>{article.title}</h3><p>{article.summary}</p><Link to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>Read story <ArrowRight size={16} /></Link>
      </article>)}</div>
    </div></section>
    <AppDownload />
  </>
}
