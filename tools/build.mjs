import { build } from 'vite'
import { JSDOM } from 'jsdom'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { serializeSnapshot } from '../src/prerender/snapshot.js'
import { spaRoutes } from '../src/prerender/routes.js'

await build()
await build({ build: { ssr: 'src/entry-server.jsx', outDir: '.prerender', copyPublicDir: false } })
const { prepareContent, getRoutes, renderPage, renderNotFound, sitePolicy } = await import(pathToFileURL(resolve('.prerender/entry-server.js')).href)
const source = process.env.PRERENDER_SOURCE || 'configured'
const snapshot = await prepareContent(source)
const routes = getRoutes(snapshot)
const outputRoot = resolve('dist')
const template = await readFile(resolve(outputRoot, 'index.html'), 'utf8')
const canonicalUrls = new Set()

// Keep an unrendered, noindex shell for staff, calculator and other SPA URLs.
const shell = new JSDOM(template)
shell.window.document.querySelector('meta[name="robots"]').content = 'noindex, nofollow'
await writeFile(resolve(outputRoot, 'spa.html'), shell.serialize())

for (const route of routes) {
  const { html, metadata } = renderPage(route, snapshot)
  canonicalUrls.add(metadata.canonical)
  const dom = new JSDOM(template)
  const document = dom.window.document
  const root = document.getElementById('root')
  root.innerHTML = html
  root.dataset.prerendered = 'true'
  root.dataset.route = route
  document.title = metadata.title
  document.querySelector('link[rel="canonical"]').href = metadata.canonical
  const values = {
    description: metadata.description, robots: metadata.robots,
    'og:title': metadata.title, 'og:description': metadata.description,
    'og:url': metadata.canonical, 'og:image': metadata.image,
    'twitter:title': metadata.title, 'twitter:description': metadata.description,
    'twitter:image': metadata.image,
  }
  for (const [key, value] of Object.entries(values)) {
    document.querySelector(`meta[${key.startsWith('og:') ? 'property' : 'name'}="${key}"]`).content = value
  }
  const data = document.createElement('script')
  data.id = 'public-content-snapshot'
  data.type = 'application/json'
  data.textContent = serializeSnapshot(snapshot)
  root.after(data)
  const destination = resolve(outputRoot, `.${route}`, 'index.html')
  if (!destination.startsWith(`${outputRoot}${sep}`)) throw new Error('Unsafe route output path.')
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, dom.serialize())
  dom.window.close()
}
shell.window.close()
// Error responses have usable HTML without JavaScript and no public snapshot.
// The host supplies status 404; requesting the actual /404.html asset is a 200.
const missing = new JSDOM(template)
const errorPage = renderNotFound()
missing.window.document.getElementById('root').innerHTML = errorPage.html
missing.window.document.title = errorPage.metadata.title
missing.window.document.querySelector('link[rel="canonical"]').remove()
for (const selector of ['meta[name="robots"]']) missing.window.document.querySelector(selector).content = 'noindex, nofollow'
for (const [attribute, key, value] of [
  ['name', 'description', errorPage.metadata.description],
  ['property', 'og:title', errorPage.metadata.title],
  ['property', 'og:description', errorPage.metadata.description],
  ['property', 'og:url', errorPage.metadata.canonical],
  ['name', 'twitter:title', errorPage.metadata.title],
  ['name', 'twitter:description', errorPage.metadata.description],
]) missing.window.document.querySelector(`meta[${attribute}="${key}"]`).content = value
await writeFile(resolve(outputRoot, '404.html'), missing.serialize())
missing.window.close()
await writeFile(resolve(outputRoot, '_redirects'), `${spaRoutes.flatMap(route => [
  `${route} /spa.html 200`, `${route}/ /spa.html 200`,
]).join('\n')}\n/* /404.html 404\n`)
const escapeXml = value => value.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character])
await writeFile(resolve(outputRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...canonicalUrls].map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`)
await writeFile(resolve(outputRoot, 'robots.txt'), sitePolicy.indexable
  ? `User-agent: *\nDisallow: /content-management\nDisallow: /career-management\nDisallow: /accept-invite\nDisallow: /loan-calculator\nSitemap: ${sitePolicy.siteUrl}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n')
await writeFile(resolve(outputRoot, 'prerender-manifest.json'), JSON.stringify({ source, routes }, null, 2))
console.log(`Pre-rendered ${routes.length} public routes using ${source} content. Staff routes and the calculator use the SPA shell.`)
