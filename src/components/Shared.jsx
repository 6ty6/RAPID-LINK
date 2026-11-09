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
  const page = getPage('not-found').hero

  return <div className="not-found-page">
    <PageMeta title={page.title} description={page.intro} noIndex />
    <section className="not-found-hero">
      <div className="shell not-found-layout">
        <div className="not-found-content">
          <p className="not-found-code">{page.eyebrow}</p>
          <p className="eyebrow not-found-status"><span aria-hidden="true" />Connection interrupted</p>
          <h1>{page.title}</h1>
          <p className="not-found-intro">{page.intro}</p>
          <div className="not-found-actions">
            <Link className="button" to="/home">Return home</Link>
          </div>
        </div>

        <div className="not-found-visual" aria-hidden="true">
          <div className="not-found-orbit not-found-orbit-one" />
          <div className="not-found-orbit not-found-orbit-two" />
          <svg viewBox="0 0 620 360" focusable="false">
            <path className="cable-shadow" d="M-20 190 C70 190 72 128 162 128" />
            <path className="cable cable-left" d="M-20 190 C70 190 72 128 162 128" />
            <g className="plug plug-left">
              <path d="M156 104h62c13 0 24 11 24 24s-11 24-24 24h-62z" />
              <path d="M218 115h25v26h-25z" />
              <path className="plug-pin" d="M243 120h19M243 136h19" />
            </g>

            <path className="cable-shadow" d="M640 190 C550 190 548 232 458 232" />
            <path className="cable cable-right" d="M640 190 C550 190 548 232 458 232" />
            <g className="plug plug-right">
              <path d="M464 208h-62c-13 0-24 11-24 24s11 24 24 24h62z" />
              <path d="M402 219h-25v26h25z" />
              <path className="plug-pin" d="M377 224h-19M377 240h-19" />
            </g>

            <circle className="signal-pulse signal-pulse-left" cx="75" cy="168" r="8" />
            <circle className="signal-pulse signal-pulse-right" cx="545" cy="207" r="8" />
            <g className="disconnect-spark">
              <path d="M304 119l-11 25M334 131l-18 20M347 163l-26 8M276 196l-23 12M294 176l-25-2" />
            </g>
          </svg>
          <div className="not-found-signal-card">
            <span className="not-found-signal-icon"><i /><i /><i /></span>
            <strong>Page connection lost</strong>
            <small>Let’s get you back on track</small>
          </div>
        </div>
      </div>
    </section>
  </div>
}
