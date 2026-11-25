# Integration notes

## General loan portal

Configuration key: `VITE_GENERAL_LOAN_PORTAL_URL`.

This may contain only a verified public destination; it is not a secret. Until supplied, `/apply-loan` shows the published support phone numbers and explains that the online connection is pending. MoneyQube remains a separate nano-loan link and is never treated as the general portal. Do not add applicant data to query parameters.

## Account-opening submission

The default `/open-account` route opens the five-step test form: account, personal details, residence/work, documents and review. Use fictional details and sample images only. There is no submission handler, API request, email delivery, persistent browser storage or CMS storage. Values and files remain in component memory and clear on refresh/unmount.

The form now follows the supplied confidential account-opening API developer guide v1.0 (25 November 2026), replacing the legacy HTML/multipart assumptions. The confidential PDF is not copied into the repository. Field definitions are in `src/content/accountApplication.js`.

- Account types: savings/current; optional branches: Asylum Down/Madina.
- Required personal and Ghana Card fields use the API field names and enumerations. Optional next-of-kin details remain optional.
- Photo and signature photo/scan are required JPG/PNG images; card front/back are optional. Typed signatures are not accepted by this contract.
- Each image is capped conservatively at 2,000,000 bytes, decoded for readability, and previewed with a temporary object URL. URLs are revoked on replacement/unmount.
- The complete future JSON size is estimated using base64 expansion and an allowance for keys/reference/metadata, capped at 9,000,000 bytes. Confirm the provider's precise MB interpretation before live use; repeat authoritative validation on the server.
- The review screen cannot submit, generate an officer reference or claim an account was created. No invented terms/consent checkbox is presented.

Before enabling live submissions obtain the HTTPS base URL, a server-only API key, an authorised synthetic-data test environment, approved privacy/terms wording, the verified verification-link origin, and confirmation of encoded/decoded image limits.

The future same-origin server adapter must call `/api/v1/account-openings` using JSON and Bearer authentication. Generate one `client_reference` per application and reuse it across validation fixes/retries. Handle documented errors, Retry-After and duplicate responses. Show the returned reference and the 24-hour verification link when available; explain officer follow-up when it is empty or images are rejected. Do not log request bodies; discard identity images following a 201 response. Status checks must be on demand or at most every few minutes. No endpoint returns an account number. Keep keys outside React, `VITE_` variables, Sanity and Git.

## Calculator

The previous site's approved behaviour is retained:

- the displayed, read-only rate is 6%;
- total interest is `principal × (rate / 100) × duration in months`;
- total repayment is `principal + total interest`;
- results are displayed to two decimal places in GHC.

The calculation is implemented as a pure function and covered by unit and browser tests. It does not include fees, insurance or other product charges.

## Search and hosting

- `_redirects` enables history fallback on Netlify-style static hosting. Equivalent rewrites must be configured on other hosts.
- Preview robots directives are intentionally `noindex`. Replace them only for an authorised production deployment.
- Route-specific client-side titles, descriptions and canonical links are implemented. If search/social crawlers require rendered route content, add a React/Vite-compatible prerender step before production release.
- No deployment or live infrastructure change was performed.
