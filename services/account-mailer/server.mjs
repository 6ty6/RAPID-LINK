import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import Busboy from 'busboy'
import nodemailer from 'nodemailer'
import { FILE_LIMIT, documentNames, prepareEmail } from './application.mjs'

export const RECIPIENT = 'IT_office@rapidlinkfinance.com'
const MAX_BODY = 8 * 1024 * 1024

function readMultipart(request) {
  return new Promise((resolve, reject) => {
    let parser
    try { parser = Busboy({ headers: request.headers, limits: { files: 3, fields: 3, parts: 7, fileSize: FILE_LIMIT, fieldSize: 2300000, fieldNameSize: 64 } }) } catch { reject(Error('Use multipart form data.')); return }
    const fields = Object.create(null), files = Object.create(null)
    let total = 0, invalid = false
    const fail = () => { invalid = true }
    request.on('data', chunk => { total += chunk.length; if (total > MAX_BODY) { fail(); request.unpipe(parser); parser.destroy(Error('Request too large.')); request.resume() } })
    request.once('aborted', () => { parser.destroy(); reject(Error('Upload interrupted.')) })
    request.once('error', reject)
    parser.on('field', (name, value, info) => {
      if (!['application', 'signature', 'captcha'].includes(name) || Object.hasOwn(fields, name) || info.valueTruncated || info.nameTruncated) fail()
      else fields[name] = value
    })
    parser.on('file', (name, stream) => {
      const chunks = []
      if (!documentNames.includes(name) || Object.hasOwn(files, name)) { fail(); stream.resume(); return }
      files[name] = null
      stream.on('limit', fail)
      stream.on('error', fail)
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('end', () => { files[name] = Buffer.concat(chunks) })
    })
    for (const event of ['filesLimit', 'fieldsLimit', 'partsLimit']) parser.on(event, fail)
    parser.once('error', () => reject(Error('Invalid or oversized upload.')))
    parser.once('close', () => invalid ? reject(Error('Invalid or oversized upload.')) : resolve({ fields, files }))
    request.pipe(parser)
  })
}

export function loadConfig(env = process.env) {
  const enabled = env.SUBMISSIONS_ENABLED === 'true'
  const config = { enabled, origin: env.WEBSITE_ORIGIN, privacyVersion: env.PRIVACY_NOTICE_VERSION, approval: env.EMAIL_APPLICATION_APPROVAL_REFERENCE, secret: env.TURNSTILE_SECRET_KEY, from: env.SMTP_FROM, host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 465), user: env.SMTP_USER, password: env.SMTP_PASSWORD }
  if (enabled) {
    if (Object.values(config).some(value => value === undefined || value === '') || !config.approval.trim()) throw Error('Submission configuration is incomplete.')
    const origin = new URL(config.origin)
    if (origin.origin !== config.origin || origin.protocol !== 'https:') throw Error('Use the exact HTTPS website origin.')
    if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(config.from) || ![465, 587].includes(config.port)) throw Error('Invalid sender or SMTP TLS port.')
  }
  return config
}

export function createMailerServer({ config, sendMail, verifyCaptcha }) {
  let active = 0, attempts = 0, windowStart = Date.now()
  // Single-instance conservative global limit; also configure gateway IP limits.
  const server = http.createServer(async (request, response) => {
    const reply = (code, message) => { if (!response.writableEnded) { response.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(message)) } }
    response.setHeader('Referrer-Policy', 'no-referrer')
    if (request.method === 'GET' && request.url === '/health') return reply(200, { status: 'ok', acceptingApplications: config.enabled })
    if (request.url !== '/api/account-applications') return reply(404, { error: 'Not found.' })
    if (!config.enabled) return reply(503, { error: 'Applications are not enabled. Please contact RapidLink.' })
    if (request.headers.origin !== config.origin) return reply(403, { error: 'Origin not allowed.' })
    response.setHeader('Access-Control-Allow-Origin', config.origin)
    response.setHeader('Vary', 'Origin')
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'POST')
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      return reply(204, {})
    }
    if (request.method !== 'POST') return reply(405, { error: 'Method not allowed.' })
    if (Date.now() - windowStart > 60000) { attempts = 0; windowStart = Date.now() }
    if (++attempts > 20 || active >= 2) { response.setHeader('Retry-After', '60'); return reply(429, { error: 'Please wait before trying again.' }) }
    if (Number(request.headers['content-length']) > MAX_BODY) return reply(413, { error: 'The application upload is too large.' })
    active++
    try {
      let upload, data, email
      try {
        upload = await readMultipart(request)
        if (!upload.fields.captcha || upload.fields.captcha.length > 2048) throw Error('Missing security check.')
        data = JSON.parse(upload.fields.application)
      } catch { return reply(400, { error: 'Check the application and upload sizes. PNG, JPEG and WebP only; 1.5 MB per file.' }) }
      if (!await verifyCaptcha(upload.fields.captcha)) return reply(400, { error: 'Security check expired or failed. Please complete it again.' })
      const reference = randomUUID()
      try { email = await prepareEmail(data, upload.fields.signature, upload.files, reference, config.privacyVersion) }
      catch { return reply(400, { error: 'Check all application fields, consent, signature and three required images.' }) }
      const result = await sendMail({ from: config.from, to: RECIPIENT, envelope: { from: config.from, to: [RECIPIENT] }, subject: `Account application ${reference}`, ...email, disableFileAccess: true, disableUrlAccess: true })
      if (!result.accepted?.some(address => address.toLowerCase() === RECIPIENT.toLowerCase())) throw Error('Recipient not accepted.')
      return reply(200, { reference, status: 'accepted-by-mail-server' })
    } catch {
      // No applicant data, SMTP details or raw provider errors in logs/responses.
      return reply(502, { error: 'Delivery could not be confirmed. Contact RapidLink before retrying to avoid a duplicate application.' })
    } finally { active-- }
  })
  server.requestTimeout = 30000
  server.headersTimeout = 15000
  server.maxHeadersCount = 40
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig()
  const transport = config.enabled ? nodemailer.createTransport({ host: config.host, port: config.port, secure: config.port === 465, requireTLS: true, auth: { user: config.user, pass: config.password }, tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000, logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true }) : null
  const verifyCaptcha = async token => {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: config.secret, response: token }), signal: AbortSignal.timeout(10000) })
    if (!result.ok) return false
    const verification = await result.json()
    return verification.success === true && verification.hostname === new URL(config.origin).hostname && verification.action === 'account-opening'
  }
  createMailerServer({ config, sendMail: mail => transport.sendMail(mail), verifyCaptcha }).listen(Number(process.env.PORT || 8787), () => console.log('Account mailer listening; applicant information is never logged.'))
}
