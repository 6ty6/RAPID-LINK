import { useContext, useEffect, useRef, useState } from 'react'
import { PublicContentContext } from '../content/PublicContentContext.jsx'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Briefcase, Building2, CalendarDays, ChevronDown, Eye, Info, MapPin, Search, Target, Users, WalletCards, X } from '../icons'
import { AppDownload, PageHero, PageMeta } from '../components/Shared'
import { getBoard, getFaqs, getVacanciesSnapshot, getInstitutionalProfile, getVacancies, getSiteInformation, getPage } from '../content/index.js'
import usePublishedNews from '../hooks/usePublishedNews'

const faqs = getFaqs()
const board = getBoard()
const institutionalProfile = getInstitutionalProfile()
const siteInformation = getSiteInformation()

const institutionalIcons = {
  branches: Building2,
  customers: Users,
  mission: Target,
  products: WalletCards,
  vision: Eye,
  years: CalendarDays,
}

function AboutHero({ eyebrow = 'About RapidLink', title, intro, image, embeddedTitle = false, position = 'center' }) {
  return <>
    <PageMeta title={title} description={intro} />
    <section className={`about-hero${embeddedTitle ? ' about-hero-embedded' : ''}`} style={{ '--about-image-position': position }}>
      <img src={image} alt="" />
      {embeddedTitle ? <h1 className="visually-hidden">{title}</h1> : <div className="shell about-hero-content">
        <p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{intro && <p>{intro}</p>}
      </div>}
    </section>
  </>
}

function ImpactCounter({ target, suffix = '', label, icon: Icon }) {
  const snapshot = useContext(PublicContentContext)
  const [value, setValue] = useState(snapshot ? target : 0)
  const counterRef = useRef(null)

  useEffect(() => {
    const node = counterRef.current
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!node || reduceMotion || !('IntersectionObserver' in window)) {
      setValue(target)
      return undefined
    }

    let animationFrame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return

      const startedAt = performance.now()
      const duration = 1400
      const animate = now => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(target * eased))
        if (progress < 1) animationFrame = requestAnimationFrame(animate)
      }

      animationFrame = requestAnimationFrame(animate)
      observer.disconnect()
    }, { threshold: .35 })

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationFrame)
    }
  }, [target])

  return <article ref={counterRef} className="impact-stat">
    <div className="impact-icon"><Icon size={23} /></div>
    <div><strong>{value.toLocaleString()}{suffix}</strong><span>{label}</span></div>
  </article>
}

function PurposeFlipCard({ title, prompt, text, icon: Icon }) {
  const [flipped, setFlipped] = useState(false)

  return <button
    className={`purpose-flip-card${flipped ? ' is-flipped' : ''}`}
    type="button"
    aria-label={`${flipped ? 'Show front of' : 'Show details for'} ${title}`}
    aria-pressed={flipped}
    onClick={() => setFlipped(current => !current)}
  >
    <span className="purpose-flip-inner">
      <span className="purpose-face purpose-front" aria-hidden={flipped}>
        <span className="purpose-icon"><Icon size={32} /></span>
        <span className="purpose-kicker">What drives us</span>
        <strong>{title}</strong>
        <span className="purpose-prompt">{prompt}</span>
        <span className="purpose-action">Click to discover <ArrowRight size={17} /></span>
      </span>
      <span className="purpose-face purpose-back" aria-hidden={!flipped}>
        <span className="purpose-icon"><Icon size={28} /></span>
        <strong>{title}</strong>
        <span className="purpose-copy">{text}</span>
        <span className="purpose-action">Click to flip back</span>
      </span>
    </span>
  </button>
}

function ProfileParagraph({ paragraph }) {
  return <p>{paragraph.segments.map((segment, index) => {
    if (segment.emphasis === 'strong-italic') return <strong key={`${segment.text}-${index}`}><em>{segment.text}</em></strong>
    if (segment.emphasis === 'strong') return <strong key={`${segment.text}-${index}`}>{segment.text}</strong>
    return <span key={`${segment.text}-${index}`}>{segment.text}</span>
  })}</p>
}

export function InstitutionalProfile() {
  return <>
    <AboutHero title={institutionalProfile.hero.title} intro={institutionalProfile.hero.introduction} image={institutionalProfile.hero.image} position={institutionalProfile.hero.imagePosition} />
    <section className="section profile-copy-section"><div className="shell prose">
      {institutionalProfile.profileParagraphs.map((paragraph, index) => <ProfileParagraph paragraph={paragraph} key={index} />)}
    </div></section>
    <section className="purpose-section" aria-labelledby="purpose-title"><div className="shell">
      <div className="purpose-heading"><p className="eyebrow">{institutionalProfile.purpose.eyebrow}</p><h2 id="purpose-title">{institutionalProfile.purpose.title}</h2><p>{institutionalProfile.purpose.introduction}</p></div>
      <div className="purpose-flip-grid">
        {institutionalProfile.purpose.cards.map(card => <PurposeFlipCard {...card} icon={institutionalIcons[card.icon]} key={card.title} />)}
      </div>
    </div></section>
    <section className="impact-section" aria-labelledby="impact-title"><div className="shell impact-panel">
      <div className="impact-heading"><p className="eyebrow">{institutionalProfile.impact.eyebrow}</p><h2 id="impact-title">{institutionalProfile.impact.title}</h2></div>
      <div className="impact-grid">
        {institutionalProfile.impact.statistics.map(statistic => <ImpactCounter {...statistic} icon={institutionalIcons[statistic.icon]} key={statistic.label} />)}
      </div>
    </div></section>
  </>
}

export function PeoplePage() {
  const [selectedPerson, setSelectedPerson] = useState(null)
  const closeButtonRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!selectedPerson) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = event => event.key === 'Escape' && setSelectedPerson(null)
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      triggerRef.current?.focus()
    }
  }, [selectedPerson])

  const openBiography = (person, event) => {
    triggerRef.current = event.currentTarget
    setSelectedPerson(person)
  }

  const people = [...board.members].sort((left, right) => left.displayOrder - right.displayOrder)

  return <>
    <AboutHero title={board.hero.title} intro={board.hero.introduction} image={board.hero.image} />
    <section className="section"><div className="shell people-grid">{people.map(person => <article className="person-card" key={person.name}>
      <div className="person-image"><img src={person.image} alt={person.imageAlt} /><button className="person-info-button" type="button" onClick={event => openBiography(person, event)} aria-label={`${board.profileButtonLabel} for ${person.name}`}><Info size={24} /><span>{board.profileButtonLabel}</span></button></div>
      <h2>{person.name}</h2><p>{person.role}</p>
    </article>)}</div></section>
    {selectedPerson && <div className="board-modal" role="presentation" onMouseDown={event => event.target === event.currentTarget && setSelectedPerson(null)}>
      <section className="board-dialog" role="dialog" aria-modal="true" aria-labelledby="board-dialog-title" aria-describedby="board-dialog-biography">
        <button ref={closeButtonRef} className="board-dialog-close" type="button" onClick={() => setSelectedPerson(null)} aria-label="Close biography"><X size={22} /></button>
        <div className="board-dialog-heading"><div className="board-dialog-photo"><img src={selectedPerson.image} alt="" /></div><div><h2 id="board-dialog-title">{selectedPerson.name}</h2><p>{selectedPerson.role}</p></div></div>
        <p id="board-dialog-biography" className="board-dialog-biography">{selectedPerson.biography}</p>
      </section>
    </div>}
  </>
}

export function DigitalChannels() {
  const channels = siteInformation.digitalChannels
  const page = getPage('digital-channels')

  return <>
    <PageMeta {...page.meta} />
    <section className="digital-public-hero" aria-labelledby="digital-channels-title">
      <h1 id="digital-channels-title" className="visually-hidden">{page.hero.title}</h1>
      <img src={page.hero.image} alt={page.hero.imageAlt} />
    </section>
    <section className="digital-products-section"><div className="shell digital-grid">{channels.map(channel => <article className="digital-card" key={channel.title}>
      <div className="digital-card-image"><img src={channel.image} alt={channel.title} /></div>
      <h2>{channel.title}</h2>
      <details className="digital-card-details"><summary className="button">Learn More</summary><p>{channel.description}</p>{channel.link && <a href={channel.link} target="_blank" rel="noopener noreferrer">Open service <ArrowRight size={16} /></a>}</details>
    </article>)}</div></section>
    <AppDownload />
  </>
}

export function FAQs() {
  return <>
    <PageHero {...getPage('faqs').hero} />
    <section className="section"><div className="shell narrow accordion">{faqs.map(({ id, question, answer }) => <details key={id}>
      <summary>{question}<ChevronDown aria-hidden="true" /></summary><p>{answer}</p>
    </details>)}</div></section>
  </>
}

const formatNewsDate = value => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))

function NewsCard({ article }) {
  return <article className="news-card">
    <Link className="news-card-image" to={`/stories/${article.slug}`} aria-label={`Read ${article.title}`}><img src={article.image} alt={article.imageAlt} /></Link>
    <div className="news-card-content"><div className="news-meta"><span>{article.category}</span><time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time></div>
      <h2><Link to={`/stories/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p>
      <Link className="text-link" to={`/stories/${article.slug}`}>Read more <ArrowRight size={17} /></Link>
    </div>
  </article>
}

export function Stories() {
  const { articles: newsArticles, loading, error } = usePublishedNews()
  const [category, setCategory] = useState('All News')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)
  const categories = ['All News', ...new Set(newsArticles.map(article => article.category))]
  const featured = newsArticles.find(article => article.featured) || newsArticles[0]
  const isFiltering = category !== 'All News' || query.trim()
  const filtered = newsArticles.filter(article => {
    const matchesCategory = category === 'All News' || article.category === category
    const searchText = `${article.title} ${article.summary} ${article.category}`.toLowerCase()
    return matchesCategory && searchText.includes(query.trim().toLowerCase())
  })
  const cardArticles = (isFiltering ? filtered : filtered.filter(article => article.slug !== featured?.slug)).slice(0, visibleCount)

  const selectCategory = nextCategory => {
    setCategory(nextCategory)
    setVisibleCount(6)
  }

  return <>
    <PageHero {...getPage('stories').hero} />
    <section className="news-section"><div className="shell">
      {!isFiltering && featured && <article className="news-featured">
        <div className="news-featured-image"><img src={featured.image} alt={featured.imageAlt} /></div>
        <div className="news-featured-content"><p className="eyebrow">Featured story</p><div className="news-meta"><span>{featured.category}</span><time dateTime={featured.publishedAt}>{formatNewsDate(featured.publishedAt)}</time></div><h2>{featured.title}</h2><p>{featured.summary}</p><Link className="button" to={`/stories/${featured.slug}`}>Read full story <ArrowRight size={18} /></Link></div>
      </article>}

      <div className="news-browser" aria-labelledby="latest-news-title">
        <div className="news-browser-heading"><div><p className="eyebrow">Latest updates</p><h2 id="latest-news-title">Explore the newsroom</h2></div><label className="news-search"><span className="visually-hidden">Search news</span><Search size={20} /><input type="search" placeholder="Search news" value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(6) }} /></label></div>
        <div className="news-filter-row" aria-label="Filter news by category">{categories.map(item => <button type="button" className={category === item ? 'is-active' : ''} aria-pressed={category === item} onClick={() => selectCategory(item)} key={item}>{item}</button>)}</div>
        <p className="news-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'story' : 'stories'} found</p>
        {loading ? <div className="career-empty panel" role="status"><h3>Loading approved news…</h3></div> : error && !newsArticles.length ? <div className="career-empty panel" role="alert"><Info size={30} /><h3>News is temporarily unavailable</h3><p>Please try again later or follow RapidLink on its official social channels.</p></div> : cardArticles.length ? <div className="news-grid">{cardArticles.map(article => <NewsCard article={article} key={article.slug} />)}</div> : <div className="career-empty panel"><Search size={30} /><h3>No stories found</h3><p>Try another search term or select a different category.</p></div>}
        {cardArticles.length < (isFiltering ? filtered.length : Math.max(filtered.length - 1, 0)) && <div className="news-load-more"><button className="button button-secondary" type="button" onClick={() => setVisibleCount(count => count + 6)}>Load more stories</button></div>}
      </div>
    </div></section>
  </>
}

export function StoryArticle() {
  const { slug } = useParams()
  const { articles: newsArticles, loading } = usePublishedNews()
  const article = newsArticles.find(item => item.slug === slug)

  if (loading) return <><PageMeta {...getPage('story-loading').meta} /><section className="section centered" role="status"><h1>{getPage('story-loading').heading}</h1></section></>

  if (!article) return <>
    <PageMeta {...getPage('story-not-found').meta} noIndex />
    <PageHero {...getPage('story-not-found').hero} noIndex />
    <section className="section centered"><Link className="button" to="/stories">Return to News</Link></section>
  </>

  const related = newsArticles.filter(item => item.slug !== article.slug).slice(0, 2)
  return <>
    <PageMeta title={article.title} description={article.summary} />
    <article className="news-article">
      <header className="news-article-header"><div className="shell narrow"><Link className="news-back-link" to="/stories">← Back to all news</Link><div className="news-meta"><span>{article.category}</span><time dateTime={article.publishedAt}>{formatNewsDate(article.publishedAt)}</time></div><h1>{article.title}</h1><p>{article.summary}</p></div></header>
      <div className="shell news-article-image"><img src={article.image} alt={article.imageAlt} /></div>
      <div className="shell narrow news-article-body">{article.sections.map((section, index) => <section key={`${section.heading || 'introduction'}-${index}`}>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
        {article.externalLink && <a className="button" href={article.externalLink} target="_blank" rel="noopener noreferrer">{article.externalLabel} <ArrowRight size={18} /></a>}
      </div>
    </article>
    {related.length > 0 && <section className="section news-related"><div className="shell"><div className="section-heading"><p className="eyebrow">Continue reading</p><h2>Related updates</h2></div><div className="news-grid">{related.map(item => <NewsCard article={item} key={item.slug} />)}</div></div></section>}
  </>
}

export function Careers() {
  const snapshot = useContext(PublicContentContext)
  const [initial] = useState(() => snapshot ? { records: snapshot.vacancies, loading: false } : getVacanciesSnapshot())
  const [vacancies, setVacancies] = useState(initial.records)
  const [loading, setLoading] = useState(initial.loading)
  const [loadError, setLoadError] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All departments')
  const closeButtonRef = useRef(null)

  useEffect(() => {
    getVacancies().then(setVacancies).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedVacancy) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = event => event.key === 'Escape' && setSelectedVacancy(null)
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedVacancy])

  const departments = ['All departments', ...new Set(vacancies.map(vacancy => vacancy.department))]
  const visibleVacancies = vacancies.filter(vacancy => {
    const searchText = `${vacancy.title} ${vacancy.department} ${vacancy.location}`.toLowerCase()
    return searchText.includes(query.toLowerCase()) && (department === 'All departments' || vacancy.department === department)
  })

  return <>
    <AboutHero {...getPage('rapidlink-careers').hero} />
    <section className="section careers-section"><div className="shell">
      <div className="careers-heading"><div><p className="eyebrow">Current opportunities</p><h2>Find your place on our team</h2><p>Explore available positions and discover where your experience can make an impact.</p></div><div className="careers-count"><strong>{visibleVacancies.length}</strong><span>{visibleVacancies.length === 1 ? 'position' : 'positions'}</span></div></div>
      <div className="career-filters">
        <label><span className="visually-hidden">Search vacancies</span><Search size={20} /><input type="search" placeholder="Search by role or location" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label><span className="visually-hidden">Filter by department</span><select value={department} onChange={event => setDepartment(event.target.value)}>{departments.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      {loading ? <div className="career-empty panel" role="status"><h3>Loading opportunities…</h3></div> : loadError && !vacancies.length ? <div className="career-empty panel" role="alert"><Briefcase size={30} /><h3>Opportunities are temporarily unavailable</h3><p>Please contact <a href={`mailto:${siteInformation.contact.email}`}>{siteInformation.contact.email}</a> for approved vacancy information.</p></div> : visibleVacancies.length ? <div className="vacancy-grid">{visibleVacancies.map(vacancy => <article className="vacancy-card" key={vacancy.id}>
        <div className="vacancy-card-top"><div className="vacancy-icon"><Briefcase size={23} /></div><span className={`vacancy-status is-${vacancy.status}`}>{vacancy.status === 'open' ? 'Open' : 'Closed'}</span></div>
        <p className="vacancy-department">{vacancy.department}</p><h3>{vacancy.title}</h3>
        <div className="vacancy-meta"><span><MapPin size={17} />{vacancy.location}</span><span><Briefcase size={17} />{vacancy.employment_type}</span></div>
        <p className="vacancy-summary">{vacancy.summary}</p>
        <div className="vacancy-actions"><button className="button button-secondary" type="button" onClick={() => setSelectedVacancy(vacancy)}>View details</button>{vacancy.status === 'open' ? <a className="button" href={`mailto:${vacancy.application_email}?subject=${encodeURIComponent(`Application: ${vacancy.title}`)}`}>Apply now <ArrowRight size={17} /></a> : <span className="vacancy-closed-label">Applications closed</span>}</div>
      </article>)}</div> : <div className="career-empty panel"><Briefcase size={30} /><h3>No matching positions</h3><p>Try changing your search or department filter. You can also contact <a href={`mailto:${siteInformation.contact.email}`}>{siteInformation.contact.email}</a>.</p></div>}
    </div></section>
    {selectedVacancy && <div className="board-modal" role="presentation" onMouseDown={event => event.target === event.currentTarget && setSelectedVacancy(null)}><section className="board-dialog vacancy-dialog" role="dialog" aria-modal="true" aria-labelledby="vacancy-dialog-title">
      <button ref={closeButtonRef} className="board-dialog-close" type="button" onClick={() => setSelectedVacancy(null)} aria-label="Close vacancy details"><X size={22} /></button>
      <p className="eyebrow">{selectedVacancy.department}</p><h2 id="vacancy-dialog-title">{selectedVacancy.title}</h2>
      <div className="vacancy-meta"><span><MapPin size={17} />{selectedVacancy.location}</span><span><Briefcase size={17} />{selectedVacancy.employment_type}</span></div>
      <p className="vacancy-dialog-summary">{selectedVacancy.summary}</p><h3>Key responsibilities</h3><ul>{selectedVacancy.responsibilities.map(item => <li key={item}>{item}</li>)}</ul>
      {selectedVacancy.status === 'open' && <a className="button" href={`mailto:${selectedVacancy.application_email}?subject=${encodeURIComponent(`Application: ${selectedVacancy.title}`)}`}>Apply for this position <ArrowRight size={17} /></a>}
    </section></div>}
  </>
}

function Branch({ title, address, digital, phones }) {
  return <article>
    <p className="eyebrow">{title}</p><h2>{address}</h2><p>Digital address: {digital}</p>
    {phones.map(phone => <a className="contact-link" key={phone} href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>)}
    <a className="contact-link" href={`mailto:${siteInformation.contact.email}`}>{siteInformation.contact.email}</a>
  </article>
}

export function Contact() {
  const branches = siteInformation.branches.map(branch => ({
    ...branch,
    query: `${branch.mapName}, ${branch.fullAddress}`,
  }))
  const mapUrl = `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(branches[0].query)}&daddr=${encodeURIComponent(branches[1].query)}`

  return <>
    <PageHero {...getPage('contact').hero} />
    <section className="section"><div className="shell two-cards">
      {branches.map(branch => <Branch key={branch.id} title={branch.contactTitle} address={branch.address} digital={branch.digitalAddress} phones={branch.phones} />)}
    </div></section>
    <section className="section contact-map-section" aria-labelledby="branch-map-title">
      <div className="shell contact-map-panel">
        <div className="contact-map-copy">
          <span className="contact-map-icon" aria-hidden="true"><MapPin size={28} /></span>
          <p className="eyebrow">Find a branch</p>
          <h2 id="branch-map-title">Visit either Accra location</h2>
          <p>View both RapidLink branches on the map and choose directions to the location most convenient for you.</p>
          <div className="contact-map-locations">
            {branches.map(branch => <article className="contact-map-location" key={branch.title}>
              <h3>{branch.title}</h3>
              <p>{branch.address}</p>
              <span>Digital address: {branch.digitalAddress}</span>
              <a className="button button-secondary contact-directions" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branch.query)}`} target="_blank" rel="noopener noreferrer">Directions to {branch.title} <ArrowRight size={17} /></a>
            </article>)}
          </div>
        </div>
        <div className="contact-map-frame">
          <iframe
            title="Map showing RapidLink Head Office and Madina Branch"
            src={mapUrl}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  </>
}
