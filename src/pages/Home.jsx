import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ChevronLeft, ChevronRight, CircleAlert, Landmark, Smartphone } from '../icons'
import { products as localProducts } from '../content'
import { useManagedContent } from '../cms/public'
import { AppDownload, PageMeta } from '../components/Shared'
import usePublishedNews from '../hooks/usePublishedNews'
import HomeFinancialTools from '../components/HomeFinancialTools'

export const localSlides = [
  { eyebrow: 'Everyday banking', title: 'Build steadily. Move confidently.', text: 'Practical savings, loans and digital channels for the moments that matter.', image: '/assets/hero-controller.png', link: '/apply-loan', action: 'Explore savings' },
  { eyebrow: 'Customer notice', title: 'Issue cheques with sufficient funds.', text: 'Repeated dud cheques may attract financial penalties, a cheque ban and credit restrictions.', image: '/assets/hero-notice.jpg', link: '/stories/bank-of-ghana-dud-cheque-sanctions', action: 'Read the full notice' },
  { eyebrow: 'Salary-backed credit', title: 'Controller loans for CAGD staff.', text: 'Published loan terms extend up to 60 months. Eligibility and current rates apply.', image: '/assets/controller-loan-flyer.png', link: '/deduct-at-source-loan', action: 'View loan information' },
]



function HeroSlider() {
  const slides = useManagedContent('slide', localSlides)
  const [current, setCurrent] = useState(0)
  const active = slides.length ? current % slides.length : 0
  const [interactionPaused, setInteractionPaused] = useState(false)
  const isPaused = interactionPaused
  const move = step => setCurrent(value => (value + step + slides.length) % slides.length)

  useEffect(() => {
    if (isPaused || slides.length < 2) return undefined
    const timer = window.setTimeout(() => move(1), 11000)
    return () => window.clearTimeout(timer)
  }, [isPaused, current, slides.length])

  if (!slides.length) return null
  return <section className="hero hero-flyer" aria-roledescription="carousel" aria-label={'Featured information'}
    onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)}
    onFocusCapture={() => setInteractionPaused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false) }}>
    <h1 className="visually-hidden">RapidLink savings, loans and financial services</h1>
    <div className="flyer-stage">
      {slides.map((item, index) => <div className={`hero-media ${index === active ? 'is-active' : ''}`} aria-hidden={index !== active} key={item.id || item.title}>
        <Link className="flyer-link" to={item.link || "/contact"} tabIndex={index === active ? 0 : -1} aria-label={item.imageAlt || (index === 0 ? 'Back to School Support Loan information' : item.title)}><picture><img src={item.image} alt={item.imageAlt || `RapidLink promotional flyer: ${item.title}`} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'low'} decoding="async" /></picture><span className="flyer-link-hint" aria-hidden="true"><ArrowRight size={28} /></span></Link>
      </div>)}
      <button className="flyer-arrow flyer-previous" onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button>
      <button className="flyer-arrow flyer-next" onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button>
    </div>
    <div className="hero-controls">
      <div className="dots">{slides.map((item, index) => <button key={item.id || item.title} className={active === index ? 'active' : ''} onClick={() => setCurrent(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={active === index ? 'true' : undefined}><span aria-hidden="true" /></button>)}</div>
    </div>

  </section>
}

function ProductCard({ productKey }) {
  const products = useManagedContent('product', Object.entries(localProducts).map(([slug, data]) => ({...data, slug})))
  const product = products.find(item => item.slug === productKey)
  if (!product) return null
  return <article className="product-card">
    <span>{product.category}</span><h3>{product.title}</h3><p>{product.intro}</p>
    <Link to={`/${productKey}`}>View details <ArrowRight size={16} /></Link>
  </article>
}

export default function Home() {
  const { articles } = usePublishedNews()
  const latestNews = [...articles].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)).slice(0, 3)

  return <>
    <PageMeta title="Home" description="Explore RapidLink savings, loans, investments and digital banking services in Ghana." />
    <HeroSlider />
    <HomeFinancialTools />
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
