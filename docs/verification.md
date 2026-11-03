# Verification report

Verification date: 2 November 2026.

## Automated evidence

| Check | Result | Status |
|---|---|---|
| `npm test` | 10 unit/component tests passed | PASS |
| `npm run build` | Vite production build completed; 51 modules transformed | PASS |
| Playwright interaction suite | 6 passed, 2 intentionally skipped by device scope | PASS |
| Responsive visual suite | 5 passed at 360, 390, 768, 1024 and 1440 px | PASS |
| Horizontal-overflow assertion | No document-level overflow at all five widths | PASS |

Unit tests cover audited product routing and image mappings, slider controls, blocked general-loan state, account-form step validation, the retained loan calculation and the controller-rate route. Browser tests cover direct product loads, desktop navigation, mobile-menu operation, slider advancement, account-form progression, calculator results, the rate-guide viewer and the image-led Loan, Savings and Investment layouts.

## Browser inspection

Completed in the locally installed Google Chrome through Playwright. Full-page screenshots were captured at 360, 390, 768, 1024 and 1440 px and visually inspected. The image-led product sections were additionally checked at 390, 1024 and 1440 px. Header/menu changes, hero crop, product imagery, compact cards, app panel and footer reflow without overlap. Mobile and desktop interaction tests passed.

The initial Playwright browser download was unavailable; the suite was reconfigured to use the already-installed Chrome. This does not affect the final results above.

## Accessibility checks

- PASS: semantic landmarks, skip link, page headings, keyboard-triggered menus and Escape-to-close.
- PASS: labelled slider controls and indicators, focus-visible styles and reduced-motion CSS.
- PASS: labelled form controls, native validation, status region, accessible typed signature alternative and touch pointer support.
- PASS: FAQ uses native `details`/`summary` disclosure semantics.
- NOT TESTED: screen-reader announcements with named assistive technology.
- NOT TESTED: formal WCAG audit and manual contrast measurement across every state.
- NOT TESTED: 200%/400% zoom on physical devices.

## Integration verification

- General loan application: BLOCKED. Existing page says “Feature Coming Soon”; no verified portal URL exists.
- Account submission: BLOCKED. UI does not send applications or simulate success.
- Calculator: PASS. The previous site's fixed 6% input and month-based calculation were restored after business confirmation.
- Rate-chart document: PASS. The original `/document-viewer` destination and viewer/download behaviour were restored.
- App Store, Google Play, phone, email and MoneyQube destinations: preserved from the live site.

## Release assessment

The front-end redesign and its portable local build pass. The release is **not production-ready** because the general loan portal and account-submission contract remain unverified, and approved legal/privacy content is missing.

