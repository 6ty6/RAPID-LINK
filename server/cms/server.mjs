import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { CmsStore, CmsError } from './store.mjs'
import { models, departments } from '../../src/cms/models.js'

export const demoStaff = [
  { user_id: '11111111-1111-4111-8111-111111111111', name: 'Demo administrator', role: 'admin', department: 'Marketing/Sales' },
  { user_id: '22222222-2222-4222-8222-222222222222', name: 'Demo writer', role: 'writer', department: 'Marketing/Sales' },
  { user_id: '33333333-3333-4333-8333-333333333333', name: 'Demo approver', role: 'approver', department: 'Marketing/Sales' },
  { user_id: '44444444-4444-4444-8444-444444444444', name: 'Demo Credit writer', role: 'writer', department: 'Credit' },
]
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
export function loadConfig(env = process.env) {
  const demo = env.CMS_DEMO === 'true'
  if (demo && env.NODE_ENV === 'production') throw Error('Demonstration authentication cannot run in production.')
  const origin = env.CMS_WEBSITE_ORIGIN || (demo ? 'http://127.0.0.1:5182' : '')
  const url = new URL(origin)
  if (url.origin !== origin || (url.protocol !== 'https:' && !(demo && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw Error('Configure the exact approved HTTPS website origin.')
  const config = { demo, origin, host: demo ? '127.0.0.1' : '0.0.0.0', port: Number(env.PORT || 8791), dataDir: resolve(env.CMS_DATA_DIR || '.cms-data'), authUrl: (env.SUPABASE_URL || '').replace(/\/$/, ''), key: env.SUPABASE_PUBLISHABLE_KEY || '', requireMfa: env.CMS_REQUIRE_MFA !== 'false', bootstrap: [] }
  if (demo) config.bootstrap = demoStaff
  else {
    if (!config.authUrl.startsWith('https://') || !config.key || config.key.startsWith('sb_secret_')) throw Error('Configure Supabase public authentication values, never a secret/service-role key.')
    try { if (JSON.parse(Buffer.from(config.key.split('.')[1] || '', 'base64url')).role === 'service_role') throw Error('service-role') } catch (error) { if (error.message === 'service-role') throw Error('Service-role keys are not accepted.') }
    if (env.CMS_BOOTSTRAP_ADMIN_ID) {
      if (!uuid.test(env.CMS_BOOTSTRAP_ADMIN_ID)) throw Error('Invalid bootstrap administrator UUID.')
      config.bootstrap = [{ user_id: env.CMS_BOOTSTRAP_ADMIN_ID, name: 'CMS administrator', role: 'admin', department: 'Strategy Support' }]
    }
  }
  return config
}

async function body(request, limit = 200000) {
  const chunks = []; let size = 0
  if (Number(request.headers['content-length']) > limit) throw new CmsError('Upload is too large.', 413)
  for await (const chunk of request) { size += chunk.length; if (size > limit) throw new CmsError('Upload is too large.', 413); chunks.push(chunk) }
  return Buffer.concat(chunks)
}
async function json(request) { try { return JSON.parse((await body(request)).toString('utf8')) } catch (error) { if (error instanceof CmsError) throw error; throw new CmsError('Invalid request body.') } }

export async function verifyUser(token, config) {
  if (config.demo) {
    const member = demoStaff.find(item => token === `demo:${item.user_id}`)
    if (!member) throw new CmsError('Choose a local demo account.', 401)
    return member.user_id
  }
  if (!token || token.length > 8192) throw new CmsError('Sign in again.', 401)
  const response = await fetch(`${config.authUrl}/auth/v1/user`, { headers: { apikey: config.key, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new CmsError('Your session is no longer valid. Sign in again.', 401)
  const user = await response.json()
  if (!uuid.test(user.id || '') || !user.invited_at) throw new CmsError('Access is invitation-only.', 403)
  if (config.requireMfa) {
    let claims
    try { claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')) } catch { throw new CmsError('Invalid session.', 401) }
    // Claims are read only AFTER Supabase has validated this exact token.
    if (claims.aal !== 'aal2') throw new CmsError('Complete multi-factor authentication before opening the CMS.', 403)
  }
  return user.id
}

export function createServer({ store, config, authenticate = token => verifyUser(token, config) }) {
  mkdirSync(join(config.dataDir, 'media'), { recursive: true })
  let uploads = 0, count = 0, minute = Date.now()
  const server = http.createServer(async (request, response) => {
    const send = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(data)) }
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Referrer-Policy', 'no-referrer')
    response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
    if (request.headers.origin === config.origin) { response.setHeader('Access-Control-Allow-Origin', config.origin); response.setHeader('Vary', 'Origin') }
    try {
      const path = new URL(request.url, 'http://cms.local').pathname
      if (request.method === 'GET' && path === '/health') return send(200, { status: 'ok' })
      if (request.method === 'OPTIONS') {
        if (request.headers.origin !== config.origin) return send(403, { error: 'Origin not allowed.' })
        response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
        response.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,X-CMS-Department,X-CMS-Label')
        response.writeHead(204); return response.end()
      }
      if (request.method === 'GET' && path === '/api/cms/config') return send(200, { demo: config.demo, authUrl: config.demo ? '' : config.authUrl, publishableKey: config.demo ? '' : config.key, requireMfa: config.requireMfa, demoStaff: config.demo ? demoStaff : [] })
      if (request.method === 'GET' && path === '/api/cms/public') return send(200, { records: store.publicEntries() })
      const mediaMatch = path.match(/^\/api\/cms\/media\/([a-f0-9-]{36})$/)
      if (request.method === 'GET' && mediaMatch && store.canReadMedia(null, mediaMatch[1])) return image(mediaMatch[1])
      if (request.headers.origin !== config.origin) throw new CmsError('Origin not allowed.', 403)
      if (Date.now() - minute > 60000) { minute = Date.now(); count = 0 }
      if (++count > 240) { response.setHeader('Retry-After', '60'); throw new CmsError('Please wait before trying again.', 429) }
      const token = (request.headers.authorization || '').replace(/^Bearer /, '')
      const userId = await authenticate(token)
      const member = store.who(userId)
      if (request.method === 'GET' && path === '/api/cms/session') return send(200, member)
      if (request.method === 'GET' && path === '/api/cms/entries') return send(200, store.entries(userId))
      if (request.method === 'POST' && path === '/api/cms/entries') return send(200, store.save(userId, await json(request)))
      const action = path.match(/^\/api\/cms\/entries\/([a-f0-9-]{36})\/(action|history|restore)$/)
      if (action) {
        if (request.method === 'GET' && action[2] === 'history') return send(200, store.history(userId, action[1]))
        if (request.method === 'POST') {
          const input = await json(request)
          if (action[2] === 'action') return send(200, store.action(userId, action[1], input.action, input.version, input.note))
          if (action[2] === 'restore') return send(200, store.restore(userId, action[1], input.revision, input.version))
        }
      }
      if (request.method === 'GET' && path === '/api/cms/staff') return send(200, store.staff(userId))
      if (request.method === 'PUT' && path === '/api/cms/staff') return send(200, store.saveStaff(userId, await json(request)))
      if (request.method === 'GET' && path === '/api/cms/audit') return send(200, store.auditLog(userId))
      if (request.method === 'GET' && path === '/api/cms/export') return send(200, store.export(userId))
      if (request.method === 'GET' && path === '/api/cms/media') return send(200, store.assets(userId))
      if (request.method === 'GET' && mediaMatch) { if (!store.canReadMedia(userId, mediaMatch[1])) throw new CmsError('Image was not found.', 404); return image(mediaMatch[1]) }
      if (request.method === 'POST' && path === '/api/cms/media') {
        if (uploads >= 2) throw new CmsError('Please wait for the current uploads to finish.', 429)
        uploads++
        try {
          const department = request.headers['x-cms-department']
          store.scope(member, { department })
          if (!departments.includes(department)) throw new CmsError('Choose the image owner department.')
          const input = await body(request, 5 * 1024 * 1024)
          const png = input.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
          const jpeg = input[0] === 255 && input[1] === 216 && input[2] === 255
          const webp = input.toString('ascii', 0, 4) === 'RIFF' && input.toString('ascii', 8, 12) === 'WEBP'
          if (!(png || jpeg || webp)) throw new CmsError('Choose a PNG, JPEG or WebP image.')
          let cleaned
          try {
            const decoder = sharp(input, { limitInputPixels: 20000000, failOn: 'warning' })
            const meta = await decoder.metadata()
            if (meta.pages > 1) throw Error('Animated image')
            cleaned = await decoder.rotate().webp({ quality: 88 }).toBuffer()
          } catch { throw new CmsError('The image could not be decoded safely.') }
          if (cleaned.length > 8 * 1024 * 1024) throw new CmsError('The processed image is too large.', 413)
          const id = randomUUID(), filename = join(config.dataDir, 'media', `${id}.webp`)
          writeFileSync(filename, cleaned, { flag: 'wx', mode: 0o600 })
          try { store.addMedia(userId, { id, department, label: decodeURIComponent(request.headers['x-cms-label'] || 'Public image'), bytes: cleaned.length }) }
          catch (error) { unlinkSync(filename); throw error }
          return send(201, { id, reference: `media:${id}` })
        } finally { uploads-- }
      }
      return send(404, { error: 'Not found.' })
      function image(id) {
        const filename = join(config.dataDir, 'media', `${id}.webp`)
        if (!existsSync(filename)) throw new CmsError('Image was not found.', 404)
        response.writeHead(200, { 'Content-Type': 'image/webp', 'Content-Disposition': 'inline', 'Cache-Control': 'no-store' }); response.end(readFileSync(filename))
      }
    } catch (error) {
      if (!response.headersSent) send(error.status || (error.name === 'TypeError' ? 400 : 500), { error: error.status || error.message?.startsWith('Check ') || error.message?.includes('required') ? error.message : 'The request could not be completed. Please check the content and try again.' })
    }
  })
  server.requestTimeout = 30000; server.headersTimeout = 15000; server.maxHeadersCount = 50
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  mkdirSync(config.dataDir, { recursive: true, mode: 0o700 })
  const store = new CmsStore(join(config.dataDir, 'cms.sqlite'), config.bootstrap)
  createServer({ store, config }).listen(config.port, config.host, () => console.log(`Public-content CMS listening on ${config.host}:${config.port}${config.demo ? ' (LOCAL SYNTHETIC DEMO)' : ''}`))
}
