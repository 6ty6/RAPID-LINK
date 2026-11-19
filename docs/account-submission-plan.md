# Secure account-opening submission plan

Prepared 19 November 2026. Original proposal: private storage with notification links. The user subsequently chose full application delivery by email to `IT_office@rapidlinkfinance.com`. A disabled-by-default email-only implementation is now in `services/account-mailer/`. See its README for the implemented controls, deployment requirements and limitations. No live deployment or SMTP delivery is configured. The private-storage design below remains an alternative, not the implemented flow.

## Intended behaviour

The applicant completes the existing form and submits to a dedicated account-opening backend over HTTPS. That backend validates the complete application, stores it privately, and records a notification for delivery. The website shows a receipt reference only after durable acceptance. A received application is not an opened account or an approval.

The notification goes to an approved, server-configured recipient. It contains a reference and a link to the authorised staff system, without identity numbers, financial information, signatures or attachments. The recipient and the staff URL must never come from applicant input. The link must require staff sign-in and authorisation; possession of the link alone must not grant access.

The staff application view groups every submitted choice under Product, Personal and identification details, Residence, Employment and source of funds, Next of kin, Documents, and Signature and consent. Machine values such as `rapid_savings` must have clear human-readable labels. Missing optional fields should say 'Not supplied'. Submitted values must be escaped when rendered, never interpreted as HTML.

## Backend requirements

- Separate this service and its records from the public CMS. No customer records in Sanity, public storage buckets, Git, browser local storage, or public content APIs.
- Validate all steps on the server, including enumerated options, lengths, dates, amounts, consent and all required documents. Browser validation is only a usability aid.
- Enforce request and file limits at the ingress and parser, not after loading an unrestricted body. Confirm the business interpretation of the current 1.5 MB limit before enforcing the final contract.
- Allow only agreed image formats, verify actual file contents, scan uploads and quarantine them until accepted. Use server-generated storage keys and disable public access. Do not trust filenames or MIME headers.
- Encrypt storage and transport, keep credentials server-side, restrict storage/service identities, and keep decrypted applicant information out of request logs, analytics and error trackers.
- Authenticate staff with MFA and enforce departmental access on the backend. Audit access and changes without duplicating full applications in audit logs. Document account revocation.
- Use origin checks, the appropriate CSRF protection for the selected session model, abuse controls and rate limits. CORS is not authentication or an anti-abuse mechanism.
- Use an idempotency reference to prevent retry duplicates. Persist receipt and notification outbox together; retry email independently. An email outage must not lose or duplicate an accepted application.
- Define retention, deletion, backup and restore processes with IT/Compliance. Retention periods must be supplied, not invented.
- Test failure paths with synthetic data, including invalid files, unauthorised retrieval, failed storage, timeouts, duplicate retries and notification failures.

## Decisions required before implementation can be finalised

1. Approved notification recipient and sender domain.
2. Approved backend hosting, private storage and email service; their owner and maintenance responsibility.
3. Existing authorised staff application system, or approval and requirements for a separate authenticated review interface.
4. Privacy notice, consent wording/version, retention rules and permission to collect the listed identity documents and signature.
5. Accepted fields/formats, signature representation, file-size interpretation, and authorised test environment.

Credentials belong in the backend deployment's secret manager. Do not send credentials in chat or add them to React or `VITE_` variables.

## Current state

The existing form remains non-submitting by default. A local email backend and guarded frontend integration have been implemented and tested with synthetic data. No private storage, email account, reviewer system, production secret or live customer-data transfer was created. The receiving address is confirmed; approval of full-application email delivery, credentials, privacy wording and retention remain outstanding. The earlier private-storage proposal is not a requirement of the selected email-only implementation.
