import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check } from '../icons'
import { config } from '../config'

export function PageMeta({ title, description, image = '/assets/rapidlink-logo.png', noIndex = false }) {
  const { pathname } = useLocation()

  useEffect(() => {
    const pageTitle = `${title} | RapidLink Microfinance`
    const pageDescription = description || 'Savings, loans, investments and digital banking from RapidLink Microfinance Limited.'
    const pagePath = pathname === '/' ? '/home' : pathname
    const canonicalUrl = `${config.siteUrl}${pagePath}`
    const socialImageUrl = image.startsWith('http') ? image : `${config.siteUrl}${image.startsWith('/') ? image : `/${image}`}`
    const setMeta = (attribute, key, content) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }
      element.content = content
    }

    document.title = pageTitle
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = pageDescription

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    setMeta('property', 'og:title', pageTitle)
    setMeta('property', 'og:description', pageDescription)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', socialImageUrl)
    setMeta('property', 'og:type', 'website')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', pageTitle)
    setMeta('name', 'twitter:description', pageDescription)
    setMeta('name', 'twitter:image', socialImageUrl)

    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = noIndex ? 'noindex, nofollow' : 'index, follow'
  }, [title, description, image, pathname, noIndex])

  return null
}

export function PageHero({ eyebrow, title, intro, image }) {
  return <>
    <PageMeta title={title} description={intro} image={image} />
    <section className={`page-hero${image ? ' has-image' : ''}`}>
      {image && <div className="page-hero-media" aria-hidden="true"><img src={image} alt="" /></div>}
      <div className="shell narrow">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  </>
}

export function Breadcrumb({ current }) {
  return <nav className="breadcrumbs shell" aria-label="Breadcrumb">
    <Link to="/home">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{current}</span>
  </nav>
}

export function CheckList({ items }) {
  return <ul className="check-list">{items.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
}

export function AppDownload() {
  return <section className="app-section" id="download">
    <div className="shell app-layout">
      <div className="app-device-visual">
        <img src="/assets/rapidlink-mobile-app.png" alt="RapidLink mobile app screens showing login, payments and account information" />
      </div>
      <div><p className="eyebrow">RapidLink mobile app</p><h2>Banking access in your pocket</h2><p>View account information, check balances, transfer funds and review transaction history from iOS or Android.</p></div>
      <div className="app-actions"><a className="button" href={config.appStoreUrl} target="_blank" rel="noopener noreferrer">Download for iOS</a><a className="button button-secondary" href={config.playStoreUrl} target="_blank" rel="noopener noreferrer">Get it on Google Play</a></div>
    </div>
  </section>
}

export function NotFound() {
  return <>
    <PageHero eyebrow="404" title="We couldn’t find that page" intro="The address may have changed or the page may no longer be available." />
    <section className="section"><div className="shell narrow centered"><Link className="button" to="/home">Return home</Link></div></section>
  </>
}
