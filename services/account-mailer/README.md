# Account application email service

Status: implemented for synthetic testing; disabled by default; not deployed or independently security-audited.

The public account-opening route now displays a coming-soon page. The retained form is `src/pages/AccountApplicationForm.jsx`; it is not linked or imported by the public route. Restore it only through a reviewed route change after the deployment and approval steps below. Environment variables alone do not expose it.

This is a separate Node service. It cannot run inside the existing Render static site. It emails every form field, a typed/drawn signature and three sanitised raster-image attachments to the fixed recipient `IT_office@rapidlinkfinance.com`. The report groups fields into readable sections and expands product/selection values. It does not open an account.

No database, application disk files or applicant-data logs are created. Sensitive information will persist in the receiving mailbox and email-provider systems; this is not end-to-end encrypted email. SMTP transport requires TLS. Approval of mailbox access, retention, deletion, backups and this delivery method is still required before enabling real submissions.

## Local checks (no email or credentials required)

From the repository root:

```powershell
npm.cmd --prefix services/account-mailer ci
npm.cmd --prefix services/account-mailer test
```

Tests use synthetic records, generated images and an in-process fake mail sender. They never contact the IT mailbox or SMTP server. The service starts disabled with `node services/account-mailer/server.mjs`; `/health` indicates whether applications are enabled.

## Deployment preparation

1. Obtain IT/Compliance approval for full applications/documents/signatures by email, the approved privacy notice/version and authorised synthetic test environment. Confirm the 1.5 MB-per-file interpretation. Record approval separately; setting an environment variable is not evidence of approval.
2. Deploy a **separate** maintained Node 22.15+ web service from repository root. Build command: `npm ci --prefix services/account-mailer`. Start command: `node services/account-mailer/server.mjs`. Use HTTPS ingress, an appropriate production plan and a host that allows the selected SMTP port. Do not attach it to the public CMS or expose SMTP credentials in frontend settings.
3. Copy environment variable names from `.env.example` in this folder to the service secret settings. Use a dedicated, least-privileged sender account/domain approved by IT, rather than a personal mailbox password. Configure SPF/DKIM/DMARC with the email administrator. Never disable certificate verification. Recipient is fixed in code.
4. Set `WEBSITE_ORIGIN` to the exact approved HTTPS origin, without trailing slash. Configure a Turnstile widget limited to that hostname, with its secret key on the server. Server verifies the token hostname and `account-opening` action. CAPTCHA is an abuse control, not applicant identity verification.
5. Configure ingress body size (8 MiB maximum), timeouts and per-client rate limiting. The service has a conservative **global**, process-local limit of 20 submissions/minute and two concurrent requests; it deliberately does not trust spoofable forwarded-IP headers. These limits are not a substitute for gateway limits, especially with multiple replicas. For high-volume use, add a shared limiter.
6. Approve the privacy/consent wording shown on the page. Set server `PRIVACY_NOTICE_VERSION` and `EMAIL_APPLICATION_APPROVAL_REFERENCE`, then `SUBMISSIONS_ENABLED=true` only after operational approval and synthetic end-to-end testing.
7. Set public website build variables: `VITE_ACCOUNT_API_BASE_URL` to the service HTTPS origin, `VITE_ACCOUNT_TURNSTILE_SITE_KEY` to the public widget key, `VITE_ACCOUNT_PRIVACY_NOTICE_URL` to the approved notice HTTPS URL, and `VITE_ACCOUNT_SUBMISSIONS_ENABLED=true`. Rebuild/deploy the static website. If CSP is configured, allow the exact API origin in `connect-src` and Cloudflare Turnstile in the required script/frame/connect directives; do not use wildcard allowances.
8. Test with synthetic data that SMTP delivery reaches the intended mailbox, files are readable, report values match all form choices, the sender domain authenticates, invalid/oversized images fail, rejected SMTP does not show success, and staff know how to handle duplicates and bounces. No live SMTP delivery has been tested here.

## Important behaviour and limits

- The server validates all steps, enum values, required documents, booleans and signature. PNG, JPEG and WebP only, 1.5 MiB each, decoded within a 20-megapixel cap and re-encoded as PNG without original filenames/metadata. SVG/PDF/office files and animations are not accepted. Attachments are sanitised images, not byte-for-byte originals. If originals must be retained, this design needs an approved private-storage/scanning workflow instead.
- The browser keeps values only in page memory. Its busy state prevents duplicate clicks; SMTP acceptance returns a reference. SMTP acceptance does **not** prove inbox delivery or account approval. Monitor delivery/bounces through the approved provider without copying full application content into logs.
- There is no durable queue or idempotency store in this email-only design. Network timeouts, service restarts or SMTP ambiguity can produce uncertain outcomes or duplicate deliveries. Users are told to contact RapidLink before retrying. If guaranteed recovery/deduplication is required, add the separate private store/outbox proposed earlier.
- Inputs are used only in a plain-text body and sanitised attachments. They cannot set recipient, sender, subject, headers, paths or URLs. No customer data is put in URL parameters.
- Private intake is outside the CMS, but email still carries sensitive data. This implementation is a tested starting point, not a guarantee of security or regulatory approval. Keep Node and dependencies patched, establish mailbox MFA/access controls, and complete an independent review before production.

Official references: [Nodemailer SMTP](https://nodemailer.com/smtp), [Busboy multipart limits](https://github.com/mscdex/busboy), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
