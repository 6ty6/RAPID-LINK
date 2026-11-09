import { useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check } from '../icons'
import { config } from '../config'
import { getPage, getSharedContent } from '../content/index.js'
import { MetaContext } from '../prerender/MetaContext.js'
import { getMetadata } from '../prerender/metadata.js'

export function PageMeta({ title, description, image = '/assets/rapidlink-logo.png', noIndex = false }) {
  const { pathname } = useLocation()
  const collector = useContext(MetaContext)
  const metadata = getMetadata({ title, description, image, noIndex }, pathname, config.siteUrl, import.meta.env.VITE_INDEXABLE === 'true')
  if (collector) collector.current = metadata

  useEffect(() => {
    const pageTitle = metadata.title
    const pageDescription = metadata.description
    const canonicalUrl = metadata.canonical
    const socialImageUrl = metadata.image
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
    robots.content = metadata.robots
  }, [title, description, image, pathname, noIndex])

  return null
}

export function PageHero({ eyebrow, title, intro, image, noIndex = false }) {
  return <>
    <PageMeta title={title} description={intro} image={image} noIndex={noIndex} />
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
  const { appDownload } = getSharedContent()
  return <section className="app-section" id="download">
    <div className="shell app-layout">
      <div className="app-device-visual">
        <img src={appDownload.image} alt={appDownload.imageAlt} />
      </div>
      <div><p className="eyebrow">{appDownload.eyebrow}</p><h2>{appDownload.title}</h2><p>{appDownload.description}</p></div>
      <div className="app-actions"><a className="button" href={config.appStoreUrl} target="_blank" rel="noopener noreferrer">{appDownload.iosLabel}</a><a className="button button-secondary" href={config.playStoreUrl} target="_blank" rel="noopener noreferrer">{appDownload.androidLabel}</a></div>
    </div>
  </section>
}

export function NotFound() {
  return <>
    <PageHero {...getPage('not-found').hero} noIndex />
    <section className="section"><div className="shell narrow centered"><Link className="button" to="/home">Return home</Link></div></section>
  </>
}
