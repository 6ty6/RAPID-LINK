import { useEffect, useState } from 'react'
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
  const [loadedSlides, setLoadedSlides] = useState(() => new Set([0]))
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [isMobileSlider, setIsMobileSlider] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const slide = slides[current]
  const isPaused = interactionPaused
  const move = (step) => {
    const next = (current + step + slides.length) % slides.length
    setShowCopy(isMobileSlider)
    setLoadedSlides(value => new Set(value).add(next))
    setCurrent(next)
  }
  const showSlide = (index) => {
    setShowCopy(isMobileSlider)
    setLoadedSlides(value => new Set(value).add(index))
    setCurrent(index)
  }

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mediaQuery = window.matchMedia(mobileSliderQuery)
    const updateSliderTiming = event => {
      setIsMobileSlider(event.matches)
      setShowCopy(event.matches)
    }
    updateSliderTiming(mediaQuery)
    mediaQuery.addEventListener('change', updateSliderTiming)
    return () => mediaQuery.removeEventListener('change', updateSliderTiming)
  }, [])

  useEffect(() => {
    if (isPaused) return undefined
    const timer = window.setTimeout(() => {
      if (isMobileSlider || showCopy) move(1)
      else setShowCopy(true)
    }, isMobileSlider ? 11000 : showCopy ? 8000 : 3000)
    return () => window.clearTimeout(timer)
  }, [isPaused, isMobileSlider, showCopy, current])

  const leaveFocus = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false)
  }

  return <section
    className="hero"
    aria-roledescription="carousel"
    aria-label={homepage.hero.accessibleLabel}
    onMouseEnter={() => setInteractionPaused(true)}
    onMouseLeave={() => setInteractionPaused(false)}
    onFocusCapture={() => setInteractionPaused(true)}
    onBlurCapture={leaveFocus}
  >
    {slides.map((item, index) => <div className={`hero-media ${index === current ? 'is-active' : ''}`} aria-hidden={index !== current} key={item.title}>
      {loadedSlides.has(index) && <picture>
        {item.mobileImage && <source media={mobileSliderQuery} srcSet={item.mobileImage} />}
        <img
          src={item.image}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchpriority={index === 0 ? 'high' : 'low'}
          decoding="async"
        />
      </picture>}
    </div>)}
    <div className={`shell hero-content slide-content-fade ${showCopy ? 'is-visible' : ''}`} aria-hidden={!showCopy} aria-live={isPaused ? 'polite' : 'off'} key={slide.title}>
      <p className="eyebrow animated-copy">{slide.eyebrow}</p>
      <h1 className="animated-title">{slide.title.split(' ').map((word, index) => <span className="animated-word" style={{ '--word-index': index }} key={`${word}-${index}`}>{word}</span>)}</h1>
      <p className="animated-copy copy-delay-one">{slide.text}</p>
      <Link className="button animated-copy copy-delay-two" to={slide.link}>{slide.action}<ArrowRight size={18} /></Link>
    </div>
    <div className="hero-controls">
      <button onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button>
      <div className="dots">{slides.map((item, index) => <button key={item.title} className={current === index ? 'active' : ''} onClick={() => showSlide(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={current === index ? 'true' : undefined} />)}</div>
      <button onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button>
    </div>
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
