const target = process.argv[2] || process.env.SECURITY_HEADER_TEST_URL

if (!target) {
  console.error('Usage: node tools/verify-security-headers.mjs https://example.com/')
  process.exit(2)
}

let url
try {
  url = new URL(target)
} catch {
  console.error(`Invalid URL: ${target}`)
  process.exit(2)
}

if (url.protocol !== 'https:') {
  console.error('The security-header check requires an HTTPS URL.')
  process.exit(2)
}

const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
const required = [
  'content-security-policy',
  'permissions-policy',
  'referrer-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
]

console.log(`URL: ${response.url}`)
console.log(`HTTP: ${response.status}`)

let failed = false
for (const name of required) {
  const value = response.headers.get(name)
  if (!value) failed = true
  console.log(`${value ? 'PASS' : 'FAIL'} | ${name} | ${value || 'missing'}`)
}

const csp = response.headers.get('content-security-policy') || ''
const requiredCspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "connect-src 'self' https://*.supabase.co",
  'frame-src https://www.google.com https://maps.google.com',
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
]

for (const directive of requiredCspDirectives) {
  const present = csp.includes(directive)
  if (!present) failed = true
  console.log(`${present ? 'PASS' : 'FAIL'} | CSP directive | ${directive}`)
}

if (failed) process.exitCode = 1
