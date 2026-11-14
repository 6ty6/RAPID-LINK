import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { getNews, getVacancies, getProducts } from './content/index.js'
import { localContent } from './content/local.js'
import { PublicContentContext } from './content/PublicContentContext.jsx'
import { MetaContext } from './prerender/MetaContext.js'
import { publicSnapshot, safeSlug } from './prerender/snapshot.js'
import { config } from './config.js'

export const sitePolicy = { siteUrl: config.siteUrl, indexable: import.meta.env.VITE_INDEXABLE === 'true' }

export async function prepareContent(source = 'configured') {
  if (!['configured', 'bundled'].includes(source)) throw new Error('Unknown pre-render content source.')
  if (source === 'configured') {
    const contentSource = (import.meta.env.VITE_CONTENT_SOURCE || 'supabase').trim().toLowerCase()
    if (!['local', 'supabase', 'directus'].includes(contentSource)) throw new Error('Unknown public content source.')
    if (contentSource === 'supabase' && Boolean(import.meta.env.VITE_SUPABASE_URL) !== Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)) {
      throw new Error('Both public Supabase configuration values are required.')
    }
    if (contentSource === 'directus' && !import.meta.env.VITE_DIRECTUS_URL) {
      throw new Error('The Directus public URL is required.')
    }
  }
  const adapter = source === 'bundled' ? localContent : { getNews, getVacancies }
  let timer
  try {
    return await Promise.race([
      Promise.all([adapter.getNews(), adapter.getVacancies()]).then(([news, vacancies]) => publicSnapshot(news, vacancies)),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Public content retrieval timed out.')), 20000) }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export function getRoutes(snapshot) {
  const products = getProducts().map(product => {
    if (!safeSlug(product.slug)) throw new Error('Invalid product slug.')
    return `/${product.slug}`
  })
  return [...new Set([
    '/', '/home', '/apply-loan', '/open-account', '/institutional-profile',
    '/board-of-directors', '/digital-channels', '/rates', '/rate-chart', '/faqs',
    '/stories', '/rapidlink-careers', '/contact', ...products,
    ...snapshot.news.map(article => `/stories/${article.slug}`),
  ])]
}

export function renderPage(path, snapshot) {
  if (!getRoutes(snapshot).includes(path)) throw new Error('Route is not approved for pre-rendering.')
  return renderApplication(path, snapshot)
}

export function renderNotFound() {
  const result = renderApplication('/404.html', null)
  return { ...result, metadata: { ...result.metadata, robots: 'noindex, nofollow' } }
}

function renderApplication(path, snapshot) {
  const metadata = { current: null }
  const html = renderToString(
    <React.StrictMode>
      <PublicContentContext.Provider value={snapshot}>
        <MetaContext.Provider value={metadata}>
          <StaticRouter location={path}><App /></StaticRouter>
        </MetaContext.Provider>
      </PublicContentContext.Provider>
    </React.StrictMode>,
  )
  if (!metadata.current) throw new Error('Page metadata is missing.')
  return { html, metadata: metadata.current }
}
