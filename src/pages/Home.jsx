import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Landmark, Smartphone, WalletCards } from '../icons'
import { newsArticles, products } from '../content'
import { AppDownload, PageMeta } from '../components/Shared'

const slides = [
  { eyebrow: 'Everyday banking', title: 'Build steadily. Move confidently.', text: 'Practical savings, loans and digital channels for the moments that matter.', image: '/assets/hero-controller.png', link: '/rapid-savings', action: 'Explore savings' },
  { eyebrow: 'Customer notice', title: 'Issue cheques with sufficient funds.', text: 'Repeated dud cheques may attract financial penalties, a cheque ban and credit restrictions.', image: '/assets/hero-notice.jpg', link: '/stories/bank-of-ghana-dud-cheque-sanctions', action: 'Read the full notice' },
  { eyebrow: 'Salary-backed credit', title: 'Controller loans for CAGD staff.', text: 'Published loan terms extend up to 60 months. Eligibility and current rates apply.', image: '/assets/hero-controller.png', link: '/deduct-at-source-loan', action: 'View loan information' },
]

const mobileSliderQuery = '(max-width: 760px)'

function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [isMobileSlider, setIsMobileSlider] = useState(() => Boolean(window.matchMedia?.(mobileSliderQuery).matches))
  const [showCopy, setShowCopy] = useState(() => Boolean(window.matchMedia?.(mobileSliderQuery).matches))
  const slide = slides[current]
  const isPaused = interactionPaused
  const move = (step) => {
    setShowCopy(isMobileSlider)
    setCurrent(value => (value + step + slides.length) % slides.length)
  }
  const showSlide = (index) => {
    setShowCopy(isMobileSlider)
    setCurrent(index)
  }

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mediaQuery = window.matchMedia(mobileSliderQuery)
    const updateSliderTiming = event => {
      setIsMobileSlider(event.matches)
      setShowCopy(event.matches)
    }
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
    aria-label="Featured information"
    onMouseEnter={() => setInteractionPaused(true)}
    onMouseLeave={() => setInteractionPaused(false)}
    onFocusCapture={() => setInteractionPaused(true)}
    onBlurCapture={leaveFocus}
  >
    {slides.map((item, index) => <div className={`hero-media ${index === current ? 'is-active' : ''}`} aria-hidden={index !== current} key={item.title}>
      <img src={item.image} alt="" />
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

function ProductCard({ productKey }) {
  const product = products[productKey]
  return <article className="product-card">
    <span>{product.category}</span><h3>{product.title}</h3><p>{product.intro}</p>
    <Link to={`/${productKey}`}>View details <ArrowRight size={16} /></Link>
  </article>
}

export default function Home() {
  const latestNews = [...newsArticles].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)).slice(0, 3)

  return <>
    <PageMeta title="Home" description="Explore RapidLink savings, loans, investments and digital banking services in Ghana." />
    <HeroSlider />
    <section className="home-quick-access" aria-labelledby="quick-access-title"><div className="shell quick-access-layout">
      <div className="quick-access-heading"><p className="eyebrow">Plan with confidence</p><h2 id="quick-access-title">Loan tools at your fingertips</h2></div>
      <div className="quick-access-links">
        <Link className="quick-access-card" to="/rates"><span><WalletCards /></span><div><strong>Current Loan Rates</strong><small>Review the current rates table</small></div><ArrowRight /></Link>
        <Link className="quick-access-card" to="/loan-calculator"><span><CalendarDays /></span><div><strong>Loan Calculator</strong><small>Estimate interest and repayment</small></div><ArrowRight /></Link>
      </div>
    </div></section>
    <section className="section notices"><div className="shell">
      <div className="section-heading"><p className="eyebrow">Latest news</p><h2>Updates from RapidLink</h2></div>
      <div className="notice-grid">{latestNews.map(article => <article className="notice-card" key={article.slug}>
        <CircleAlert aria-hidden="true" /><p className="notice-category">{article.category}</p><h3>{article.title}</h3><p>{article.summary}</p>
        <Link to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>Read full story <ArrowRight size={16} /></Link>
      </article>)}</div>
      <div className="news-home-action"><Link className="button button-secondary" to="/stories">View all news <ArrowRight size={17} /></Link></div>
    </div></section>
    <section className="section warm"><div className="shell split">
      <div><p className="eyebrow">What we provide</p><h2>Financial tools for real life</h2><p className="lead">Save consistently, access responsible credit, support your business and manage everyday banking from your phone.</p><Link className="text-link" to="/institutional-profile">Learn about RapidLink <ArrowRight size={17} /></Link></div>
      <div className="service-list">{[['Savings & deposits', Landmark], ['Micro & SME loans', Building2], ['Mobile and USSD banking', Smartphone]].map(([label, Icon]) => <Link key={label} to={label.includes('loan') ? '/business-loan' : label.includes('Mobile') ? '/digital-channels' : '/rapid-savings'}><Icon /><span>{label}</span><ArrowRight /></Link>)}</div>
    </div></section>
    <section className="section"><div className="shell">
      <div className="section-heading"><p className="eyebrow">Explore products</p><h2>A clearer route to your next step</h2></div>
      <div className="card-grid">{['rapid-savings', 'rapid-susu', 'rapid-edu-grow', 'personal-loan', 'business-loan', 'fixed-deposit'].map(key => <ProductCard key={key} productKey={key} />)}</div>
    </div></section>
    <AppDownload />
  </>
}
