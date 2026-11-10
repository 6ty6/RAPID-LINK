# Security-header verification

**Checked:** 10 November 2026  
**Method:** Direct HTTPS response-header request and repeatable repository script

## Production demonstration service

URL checked: `https://rapid-link.onrender.com/home`

The direct response contains:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; frame-src https://www.google.com https://maps.google.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=315360000; includeSubdomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

This is the service measured by the saved SecurityHeaders.com A+ result.

## Branch preview discrepancy

URL checked: `https://rapid-link-pr-1.onrender.com/`

The direct response contains `Strict-Transport-Security` and
`X-Content-Type-Options`, but the following configured application headers were
missing at the time of the check:

- `Content-Security-Policy`;
- `Permissions-Policy`;
- `Referrer-Policy`; and
- `X-Frame-Options`.

The preview also correctly returned `X-Robots-Tag: noindex`.

The current `render.yaml` contains the required header definitions. The missing
preview headers therefore need to be resolved in the Render preview service or
by redeploying/synchronising the Blueprint before preview evidence is accepted.

## Repeat the check

```powershell
node tools/verify-security-headers.mjs https://rapid-link.onrender.com/home
node tools/verify-security-headers.mjs https://rapid-link-pr-1.onrender.com/
```

Repeat the same command against `https://rapidlinkgh.com/` immediately before
production approval. A missing required header or CSP directive causes the
script to exit with an error.
