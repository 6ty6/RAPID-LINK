import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from '../icons'
import { AppDownload, PageMeta } from '../components/Shared'
import usePublishedNews from '../hooks/usePublishedNews'
import HomeFinancialTools from '../components/HomeFinancialTools'
import HomeProducts from '../components/HomeProducts'
import HomeServicePathway from '../components/HomeServicePathway'
import usePageContent from '../hooks/usePageContent.js'
import {selectHomepageNews} from '../content/homepageNews.js'

export const localSlides = [
  { eyebrow: 'Everyday banking', title: 'Build steadily. Move confidently.', text: 'Practical savings, loans and digital channels for the moments that matter.', image: '/assets/hero-controller.png', link: '/apply-loan', action: 'Explore savings' },
  { eyebrow: 'Customer notice', title: 'Issue cheques with sufficient funds.', text: 'Repeated dud cheques may attract financial penalties, a cheque ban and credit restrictions.', image: '/assets/hero-notice.jpg', link: '/stories/bank-of-ghana-dud-cheque-sanctions', action: 'Read the full notice' },
  { eyebrow: 'Salary-backed credit', title: 'Controller loans for CAGD staff.', text: 'Published loan terms extend up to 60 months. Eligibility and current rates apply.', image: '/assets/controller-loan-flyer.png', link: '/deduct-at-source-loan', action: 'View loan information' },
]



function HeroSlider() {
  const {data:page}=usePageContent('homepage')
  const slides = page.slides
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
        <Link className="flyer-link" to={item.link || "/contact"} tabIndex={index === active ? 0 : -1} aria-label={item.linkLabel || (index === 0 ? 'Back to School Support Loan information' : item.title)}><picture><img src={item.image} alt={item.imageAlt || `RapidLink promotional flyer: ${item.title}`} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'low'} decoding="async" /></picture><span className="flyer-link-hint" aria-hidden="true"><ArrowRight size={28} /></span></Link>
      </div>)}
      <button className="flyer-arrow flyer-previous" onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button>
      <button className="flyer-arrow flyer-next" onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button>
    </div>
    <div className="hero-controls">
      <div className="dots">{slides.map((item, index) => <button key={item.id || item.title} className={active === index ? 'active' : ''} onClick={() => setCurrent(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={active === index ? 'true' : undefined}><span aria-hidden="true" /></button>)}</div>
    </div>

  </section>
}

export default function Home() {
  const {data:page}=usePageContent('homepage')
  const { articles, loading, error } = usePublishedNews()
  const latestNews = loading || error ? [] : selectHomepageNews(articles)

  return <>
    <PageMeta title={page.meta.title} description={page.meta.description} />
    <HeroSlider />
    <HomeProducts />
    <HomeServicePathway />
    <HomeFinancialTools />
    <section className="section home-newsroom" aria-labelledby="home-newsroom-title"><div className="shell">
      <div className="home-newsroom-heading"><div><p className="eyebrow">{page.news.eyebrow}</p><h2 id="home-newsroom-title">{page.news.title}</h2></div><Link className="text-link" to="/stories">{page.news.allLabel}</Link></div>
      <div className={`home-newsroom-layout ${latestNews.length === 1 ? 'has-one-story' : ''}`}>
        {latestNews.slice(0, 1).map(article => <article className="home-newsroom-feature" key={article.slug}>
          {article.image && <div className="home-newsroom-image"><img src={article.image} alt={article.imageAlt || ''} loading="lazy" decoding="async" onError={event => { event.currentTarget.parentElement.hidden = true }} /></div>}
          <p className="notice-category">{article.category}</p><h3><Link to={`/stories/${article.slug}`}>{article.title}</Link></h3><p className="home-newsroom-summary">{article.summary}</p>
          <Link className="text-link" to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>{page.news.storyLabel}</Link>
        </article>)}
        {latestNews.length > 1 && <div className="home-newsroom-briefs">{latestNews.slice(1).map(article => <article className="home-newsroom-brief" key={article.slug}>
          <p className="notice-category">{article.category}</p><h3><Link to={`/stories/${article.slug}`}>{article.title}</Link></h3><p className="home-newsroom-summary">{article.summary}</p>
          <Link className="text-link" to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}>{page.news.storyLabel}</Link>
        </article>)}</div>}
      </div>
      {!latestNews.length && <p className="home-newsroom-summary" role="status">{loading ? 'Loading the latest updates…' : error ? 'News is temporarily unavailable. Please check back soon.' : 'There are no published updates at the moment. Please check back soon.'}</p>}
    </div></section>
    <AppDownload />
  </>
}
