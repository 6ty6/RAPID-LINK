import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Briefcase, Building2, CalendarDays, ChevronDown, Eye, Info, MapPin, Search, Target, Users, WalletCards, X } from '../icons'
import { config } from '../config'
import { faqs } from '../content'
import { AppDownload, PageHero, PageMeta } from '../components/Shared'
import { careerVacancies } from '../content'
import { careersAdminConfigured, getPublishedVacancies } from '../services/careers'
import usePublishedNews from '../hooks/usePublishedNews'

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
  const [value, setValue] = useState(0)
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

export function InstitutionalProfile() {
  return <>
    <AboutHero title="Our institutional profile" intro="A customer-centred deposit-taking microfinance company established in June 2010." image="/assets/about-institutional-profile.jpg" position="center 58%" />
    <section className="section profile-copy-section"><div className="shell prose">
      <p><strong><em>RapidLink Microfinance Ltd</em></strong>, a registered Non-Bank Financial Institution (Deposit Taking Microfinance Company) established in June 2010, is a trusted and customer-centric force in Ghana’s financial sector. Recognized by the Registrar General’s Department of Ghana, our mission is to transform lives and foster economic empowerment through inclusive and innovative financial services.</p>
      <p>In October 2013, we received full authorization from the Bank of Ghana to operate as a licensed Microfinance Company — a milestone that affirms our dedication to regulatory compliance, financial integrity, and sustainable growth. Our headquarters, located in the heart of Accra at <strong>Asylum Down; 17 Farrar Avenue</strong>, symbolizes trust, accessibility, and our deep connection with the communities we serve. Over the years, RapidLink has built a strong reputation for providing responsive financial solutions, including savings, personal and group loans, salary advances, susu contributions, and digital banking services.</p>
      <p>We are committed to bridging the financial gap for individuals, SMEs, and underserved sectors by offering tailored products that promote stability and progress. With a team of experienced professionals and a forward-thinking approach, RapidLink Microfinance continues to evolve — embracing technology, financial literacy, and customer care as the foundation of our promise to make finance more human, more inclusive, and more empowering.</p>
    </div></section>
    <section className="purpose-section" aria-labelledby="purpose-title"><div className="shell">
      <div className="purpose-heading"><p className="eyebrow">Our purpose</p><h2 id="purpose-title">The future we see. The work we do.</h2><p>Explore the vision that guides RapidLink and the mission that moves us forward.</p></div>
      <div className="purpose-flip-grid">
        <PurposeFlipCard title="Our Vision" prompt="Where we are going" icon={Eye} text="A leading financial institution recognised for innovative solutions, a client-centric approach and commitment to social impact." />
        <PurposeFlipCard title="Our Mission" prompt="How we will get there" icon={Target} text="To provide accessible, affordable and sustainable financial services to underserved individuals and small businesses, improving quality of life and fostering economic growth." />
      </div>
    </div></section>
    <section className="impact-section" aria-labelledby="impact-title"><div className="shell impact-panel">
      <div className="impact-heading"><p className="eyebrow">Our reach</p><h2 id="impact-title">Our Impact in Numbers</h2></div>
      <div className="impact-grid">
        <ImpactCounter target={2} label="Branches Nationwide" icon={Building2} />
        <ImpactCounter target={7000} suffix="+" label="Happy Customers" icon={Users} />
        <ImpactCounter target={15} suffix="+" label="Years of Service" icon={CalendarDays} />
        <ImpactCounter target={5} suffix="+" label="Financial Products" icon={WalletCards} />
      </div>
    </div></section>
  </>
}

const people = [
  {
    name: 'Dr. Emmanuel Debrah', role: 'Board Chairman', image: '/assets/board-emmanuel-debrah.png',
    biography: 'Dr. Emmanuel Debrah, our distinguished Board Chair, brings over 12 years banking experience with an extensive knowledge and skills in various aspects of banking including Credit Appraisal/Analysis, Risk Management, Loan Recovery and Compliance, Financial Analysis/Interpretation, Financial Reporting, Sales and Customer Relationship Building, Banking Operations, General Management as well as Project Finance, Organizational Restructuring and Commodities Finance. He holds a PhD in Business Administration from CASS European Institute of Management Studies (France) in collaboration with Ghana Communication Technology University; an MSc. in International Accounting from Göteborg University, Sweden; an MSc. in Economics from the University of Skövde, Sweden and a Bachelor of Commerce (B.Com) from the University of Cape Coast. Besides, he is an Associate of the Chartered Institute of Bankers (Ghana) and a holder of Ghana Stock Exchange Securities Certificate as well as a Diploma in Theology from Kenneth Hagin’s Rhema Bible Training College, Ghana. Before working in the financial sector, Dr. Debrah taught business courses in Regent University College of Science and Technology, Accra. He also served as an adjunct lecturer in Ghana Communication Technology University (Takoradi campus) and on the Distance Education of the University of Education, Kumasi campus. Dr. Debrah is currently with the Faculty of Accounting and Finance of the University of Professional Studies as a lecturer. His research interests are in Corporate Governance, Risk Management, Auditing and Accounting Information Quality, Financial Economics, Banking and Economic Growth and Development.',
  },
  {
    name: 'Edward Opare-Donkor', role: 'Managing Director', image: '/assets/board-edward-opare-donkor.png',
    biography: 'Edward Opare-Donkor, our CEO and board member, brings over two decades of financial expertise to RapidLink Microfinance Ltd. His illustrious career is marked by his commitment to values such as integrity, transparency, and efficiency. With over 22 years in the Financial Services Sector, Edward has held pivotal senior executive roles that have honed his financial acumen and instilled in him a passion for transformation and customer-centricity. During his tenure at Fidelity Bank Ghana Limited, where he served in various roles, including deputy Managing Director, Edward demonstrated exceptional leadership and a commitment to values. Edward is a visionary in business and digital transformation. His dedication to financial inclusion and responsible banking perfectly aligns with RapidLink Microfinance Ltd’s ethos.',
  },
  {
    name: 'Henrici Daniel Aboa', role: 'Board Member', image: '/assets/board-henrici-daniel-aboa.png',
    biography: 'Henrici Daniel Aboa, an esteemed board member at RapidLink Microfinance Ltd, brings a wealth of expertise and training to our institution. With a background in Credit Analysis, Banking Operations Management, Treasury Management, Internal Auditing, and Coaching and Mentoring, Henrici has honed his skills through his experience spanning 28 years at Cal Bank. At Cal Bank, he served in pivotal roles, including Financial Controller and Head of Internal Audit. He is a Chartered Accountant and a member of the Institute of Chartered Accountants Ghana. Henrici holds an EMBA from the University of Ghana Graduate School of Business and is a member of the Institute of Internal Auditors Ghana. His seasoned knowledge and dedication contribute significantly to our mission and vision at RapidLink Microfinance Ltd.',
  },
]

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

  return <>
    <AboutHero title="Board of Directors" intro="Meet the experienced leaders guiding RapidLink’s governance, growth and commitment to financial inclusion." image="/assets/about-board-directors-v2.png" />
    <section className="section"><div className="shell people-grid">{people.map(person => <article className="person-card" key={person.name}>
      <div className="person-image"><img src={person.image} alt={`${person.name}, ${person.role}`} /><button className="person-info-button" type="button" onClick={event => openBiography(person, event)} aria-label={`View profile for ${person.name}`}><Info size={24} /><span>View profile</span></button></div>
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
  const channels = [
    ['RapidLink mobile app', 'Real-time account access, balance enquiries, fund transfers and transaction history.', '/assets/digital-mobile-app.png', config.playStoreUrl],
    ['RapidPay USSD', 'Dial *899*727# on all networks to access the USSD service.', '/assets/digital-rapidpay-ussd.png', null],
    ['MTN Merchant ID', 'Dial *170#, choose MoMoPay, then enter Merchant ID 219440. Confirm the recipient is RapidLink Microfinance Limited.', '/assets/digital-mtn-merchant.png', null],
    ['Telecel Merchant ID', 'Dial *110#, choose Make Payments and Pay Merchant, then enter Till number 394675. Confirm the recipient before proceeding.', '/assets/digital-telecel-merchant.png', null],
    ['MoneyQube', 'Digital nano loans with a one-month repayment period.', '/assets/digital-moneyqube.png', config.moneyQubeUrl],
  ]

  return <>
    <PageMeta title="Digital channels" description="Access RapidLink services from your phone." />
    <section className="digital-public-hero" aria-labelledby="digital-channels-title">
      <h1 id="digital-channels-title" className="visually-hidden">Digital channels</h1>
      <img src="/assets/digital-channels-hero.png" alt="Digital Products: RapidLink mobile app and RapidPay USSD" />
    </section>
    <section className="digital-products-section"><div className="shell digital-grid">{channels.map(([title, text, image, link]) => <article className="digital-card" key={title}>
      <div className="digital-card-image"><img src={image} alt={title} /></div>
      <h2>{title}</h2>
      <details className="digital-card-details"><summary className="button">Learn More</summary><p>{text}</p>{link && <a href={link} target="_blank" rel="noopener noreferrer">Open service <ArrowRight size={16} /></a>}</details>
    </article>)}</div></section>
    <AppDownload />
  </>
}

export function FAQs() {
  return <>
    <PageHero eyebrow="Help centre" title="Frequently asked questions" intro="Clear answers to common questions about RapidLink products and services." image="/assets/faq-hero-v3.png" />
    <section className="section"><div className="shell narrow accordion">{faqs.map(([question, answer]) => <details key={question}>
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
    <PageHero eyebrow="Newsroom" title="News, notices and useful updates" intro="Stay informed about RapidLink services, customer notices and financial information." image="/assets/news-hero-v3.png" />
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

  if (loading) return <><PageMeta title="Loading story" description="Loading the requested RapidLink story." /><section className="section centered" role="status"><h1>Loading story…</h1></section></>

  if (!article) return <>
    <PageMeta title="Story not found" description="The requested RapidLink story could not be found." />
    <PageHero eyebrow="Newsroom" title="Story not found" intro="This story may have moved or is no longer available." />
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
  const [vacancies, setVacancies] = useState(careerVacancies)
  const [loading, setLoading] = useState(careersAdminConfigured)
  const [loadError, setLoadError] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All departments')
  const closeButtonRef = useRef(null)

  useEffect(() => {
    getPublishedVacancies().then(setVacancies).catch(() => setLoadError(true)).finally(() => setLoading(false))
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
    <AboutHero eyebrow="Careers" title="Work with RapidLink" intro="Be part of an institution focused on financial inclusion in Ghana." image="/assets/about-careers.jpeg" />
    <section className="section careers-section"><div className="shell">
      <div className="careers-heading"><div><p className="eyebrow">Current opportunities</p><h2>Find your place on our team</h2><p>Explore available positions and discover where your experience can make an impact.</p></div><div className="careers-count"><strong>{visibleVacancies.length}</strong><span>{visibleVacancies.length === 1 ? 'position' : 'positions'}</span></div></div>
      <div className="career-filters">
        <label><span className="visually-hidden">Search vacancies</span><Search size={20} /><input type="search" placeholder="Search by role or location" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label><span className="visually-hidden">Filter by department</span><select value={department} onChange={event => setDepartment(event.target.value)}>{departments.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      {loading ? <div className="career-empty panel" role="status"><h3>Loading opportunities…</h3></div> : loadError && !vacancies.length ? <div className="career-empty panel" role="alert"><Briefcase size={30} /><h3>Opportunities are temporarily unavailable</h3><p>Please contact <a href="mailto:info@rapidlinkfinance.com">info@rapidlinkfinance.com</a> for approved vacancy information.</p></div> : visibleVacancies.length ? <div className="vacancy-grid">{visibleVacancies.map(vacancy => <article className="vacancy-card" key={vacancy.id}>
        <div className="vacancy-card-top"><div className="vacancy-icon"><Briefcase size={23} /></div><span className={`vacancy-status is-${vacancy.status}`}>{vacancy.status === 'open' ? 'Open' : 'Closed'}</span></div>
        <p className="vacancy-department">{vacancy.department}</p><h3>{vacancy.title}</h3>
        <div className="vacancy-meta"><span><MapPin size={17} />{vacancy.location}</span><span><Briefcase size={17} />{vacancy.employment_type}</span></div>
        <p className="vacancy-summary">{vacancy.summary}</p>
        <div className="vacancy-actions"><button className="button button-secondary" type="button" onClick={() => setSelectedVacancy(vacancy)}>View details</button>{vacancy.status === 'open' ? <a className="button" href={`mailto:${vacancy.application_email}?subject=${encodeURIComponent(`Application: ${vacancy.title}`)}`}>Apply now <ArrowRight size={17} /></a> : <span className="vacancy-closed-label">Applications closed</span>}</div>
      </article>)}</div> : <div className="career-empty panel"><Briefcase size={30} /><h3>No matching positions</h3><p>Try changing your search or department filter. You can also contact <a href="mailto:info@rapidlinkfinance.com">info@rapidlinkfinance.com</a>.</p></div>}
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
    <a className="contact-link" href="mailto:info@rapidlinkfinance.com">info@rapidlinkfinance.com</a>
  </article>
}

export function Contact() {
  const headOfficeAddress = '17 Farrar Avenue, Asylum Down, Accra, Ghana'
  const madinaAddress = 'Madina Taxi Rank, Madina, Accra, Ghana'
  const headOfficeMapQuery = `Rapidlink Microfinance Head Office, ${headOfficeAddress}`
  const madinaMapQuery = `Rapidlink Microfinance Madina Branch, ${madinaAddress}`
  const branches = [
    { title: 'Head Office', address: '17 Farrar Avenue, Asylum Down, Accra', digital: 'GA-049-5378', query: headOfficeMapQuery },
    { title: 'Madina Branch', address: 'Madina Taxi Rank, Madina, Accra', digital: 'GM-000-3774', query: madinaMapQuery },
  ]
  const mapUrl = `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(headOfficeMapQuery)}&daddr=${encodeURIComponent(madinaMapQuery)}`

  return <>
    <PageHero eyebrow="Contact" title="We’re here to help" intro="Call, email or visit one of RapidLink’s Accra branches." image="/assets/contact-hero-v2.png" />
    <section className="section"><div className="shell two-cards">
      <Branch title="Head office" address="17 Farrar Avenue, Asylum Down, Accra" digital="GA-049-5378" phones={['+233 30 224 7951', '+233 30 224 6657', '+233 53 373 0336']} />
      <Branch title="Madina branch" address="Madina Taxi Rank, Madina, Accra" digital="GM-000-3774" phones={['+233 30 395 5183', '+233 55 102 3151']} />
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
              <span>Digital address: {branch.digital}</span>
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
