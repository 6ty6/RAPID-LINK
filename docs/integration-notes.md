# Integration notes

## General loan portal

Configuration key: `VITE_GENERAL_LOAN_PORTAL_URL`.

This may contain only a verified public destination; it is not a secret. Until supplied, `/apply-loan` shows the published support phone numbers and explains that the online connection is pending. MoneyQube remains a separate nano-loan link and is never treated as the general portal. Do not add applicant data to query parameters.

## Account-opening submission

The React form intentionally does not submit. It keeps values, documents and signatures in page memory and displays an explicit non-submission status.

Live integration requires written confirmation of:

- endpoint origin and path;
- whether a same-origin adapter is required;
- CSRF-token acquisition and refresh behaviour;
- cookie/session and CORS requirements;
- exact multipart field names and accepted file types;
- 1.5 MB limit interpretation (per file or total);
- whether the signature is accepted as PNG data URL, blob or another format;
- validation-error schema, accepted response and failure response;
- duplicate/idempotency behaviour;
- authorised synthetic-data test environment.

Do not reuse a token from audited HTML. Do not put secrets in React code or `VITE_` variables. A same-origin server adapter will likely be necessary if the existing service depends on session cookies and CSRF state.

### Audited field names

`product_type`, `title`, `gender`, `first_name`, `last_name`, `initial_deposit`, `tin`, `dob`, `pob`, `marital_status`, `telephone`, `spouse_name`, `pep`, `id_form`, `id_number`, `id_issue_authority`, `id_expiry_date`, `id_issue_date`, `id_issue_place`, `nationality`, `social_security_no`, `region`, `suburb`, `residential_digital_address`, `postal_address`, `nearest_landmarks`, `occupation`, `source_of_fund`, `employer_contact_person`, `employer_contact_no`, `work_nearest_landmark`, `net_income`, `nok_first_name`, `nok_surname`, `nok_relationship`, `nok_phone_number`, `accept_terms`, `id_front`, `id_back`, `passport_picture`, and signature data.

## Calculator

The previous site's approved behaviour is retained:

- the displayed, read-only rate is 6%;
- total interest is `principal × (rate / 100) × duration in months`;
- total repayment is `principal + total interest`;
- results are displayed to two decimal places in GHC.

The calculation is implemented as a pure function and covered by unit and browser tests. It does not include fees, insurance or other product charges.

## Search and hosting

- Generated `_redirects` preserves public files, serves `/spa.html` only for exact valid staff/invitation/calculator routes, and sends other misses to `/404.html` with status 404 on Netlify. The Render blueprint also removes the wildcard 200 fallback; verify live host status codes and custom error handling after deployment.
- Preview robots directives are intentionally `noindex`. Replace them only for an authorised production deployment.
- `npm.cmd run build` now pre-renders public content with route-specific metadata, canonical links, a sitemap and a public hydration snapshot. Staff routes and the calculator remain client-only. See `docs/pre-rendering.md`. Published content changes require a rebuild to refresh the static HTML. Local HTTP 404 handling is implemented and tested; deployed-host verification remains required. See `docs/http-404.md`.
- No deployment or live infrastructure change was performed.

