-- Publication-ready starter articles for every news category.
-- These records are intentionally saved as drafts so an authorised content
-- administrator can review and publish them from /content-management.

insert into public.news_articles (
  slug,
  title,
  category,
  published_at,
  summary,
  image,
  image_alt,
  featured,
  is_published,
  sections,
  external_link,
  external_label
)
values
(
  'rapidlink-strengthens-digital-customer-information',
  'RapidLink strengthens its digital customer information experience',
  'Company News',
  date '2026-11-05',
  'RapidLink is improving how customers find product information, service updates, branch contacts and approved digital channels online.',
  '/assets/about-institutional-profile.jpg',
  'RapidLink Microfinance institutional profile and customer-focused team',
  true,
  false,
  $sections$[
    {
      "heading": "Making important information easier to find",
      "paragraphs": [
        "RapidLink Microfinance is strengthening its public digital presence to make approved information easier for customers to find and understand. The improved experience brings together information about savings, investments, loans, current interest rates, digital channels, branch locations and customer support.",
        "The aim is to help customers reach the right information with fewer steps, whether they are comparing a product, looking for a branch or checking how to contact RapidLink."
      ]
    },
    {
      "heading": "A clearer customer journey",
      "paragraphs": [
        "Product pages are being organised around the questions customers commonly ask: what the product offers, who it is intended for, what may be required and how to take the next step.",
        "Customer notices and service information will also have dedicated spaces so that important updates remain visible and easy to revisit."
      ]
    },
    {
      "heading": "Reliable information and support",
      "paragraphs": [
        "RapidLink encourages customers to use the official contact details and digital links published on its website. This helps customers avoid unverified information and reach the appropriate support channel more quickly.",
        "The platform has been designed to support future customer information services while preserving clear access to RapidLink's existing products and support teams."
      ]
    }
  ]$sections$::jsonb,
  'https://rapidlinkgh.com/institutional-profile',
  'Learn about RapidLink'
),
(
  'bank-of-ghana-dud-cheque-sanctions',
  'Important notice on Bank of Ghana dud cheque sanctions',
  'Customer Notices',
  date '2026-11-05',
  'Customers who use cheques are reminded to maintain sufficient funds and understand the Bank of Ghana sanctions that may apply when a cheque is returned unpaid.',
  '/assets/hero-notice.jpg',
  'Customer reviewing an important banking notice about cheque payments',
  false,
  false,
  $sections$[
    {
      "heading": "What customers should know",
      "paragraphs": [
        "A dud cheque is a cheque that cannot be honoured because the account does not have enough funds or because of another issue attributable to the issuer. Customers should confirm that sufficient cleared funds are available before issuing a cheque.",
        "Bank of Ghana Notice No. BG/GOV/SEC/2026/12 sets out sanctions for dud cheques issued by customers of banks and specialised deposit-taking institutions."
      ]
    },
    {
      "heading": "Sanctions under the notice",
      "paragraphs": [
        "The notice provides for a levy of 10% of the cheque value for a first occurrence, 15% for a second occurrence and 20% for a third occurrence within the applicable period. Reporting, warnings, surveillance and additional restrictions may also apply as stated in the official notice.",
        "Customers should read the complete Bank of Ghana notice for the precise rules, timelines and consequences."
      ]
    },
    {
      "heading": "How to avoid a returned cheque",
      "paragraphs": [
        "Check your available balance before writing a cheque, allow for pending transactions and charges, and keep accurate records of all issued cheques.",
        "If your circumstances change after issuing a cheque, contact the receiving party and your financial institution promptly. Do not issue a replacement or make a new commitment until you understand the status of the original payment."
      ]
    }
  ]$sections$::jsonb,
  'https://www.bog.gov.gh/wp-content/uploads/2026/06/Notice-No.12-BOG-SEC-GOV-2026-Sanctions-for-the-Issuance-of-Dub-Cheques-1.pdf',
  'Read the Bank of Ghana notice'
),
(
  'moneyqube-digital-nano-loans',
  'Access MoneyQube digital nano loans',
  'Product News',
  date '2026-11-05',
  'MoneyQube provides eligible customers with access to small digital nano loans through a convenient online application process and a one-month repayment term.',
  '/assets/digital-moneyqube.png',
  'MoneyQube digital nano-loan service displayed on a mobile device',
  false,
  false,
  $sections$[
    {
      "heading": "Short-term credit through a digital channel",
      "paragraphs": [
        "MoneyQube is RapidLink's digital nano-loan service for eligible customers seeking access to a small, short-term credit facility. Applications are completed through the approved MoneyQube platform, and the product has a one-month repayment term.",
        "Submitting an application does not guarantee approval. Each request is considered according to the applicable eligibility and credit assessment requirements."
      ]
    },
    {
      "heading": "Review the terms before applying",
      "paragraphs": [
        "Before accepting a loan, review the amount offered, repayment date, interest, charges and the total amount due. Make sure the repayment obligation fits within your expected income and existing commitments.",
        "Use only the official MoneyQube link published by RapidLink and do not share passwords, verification codes or other confidential account information with unauthorised persons."
      ]
    },
    {
      "heading": "Borrow responsibly",
      "paragraphs": [
        "Short-term credit is most useful when it addresses a planned and manageable need. Customers are encouraged to borrow only what they can repay on time and to contact the approved support channel if they need clarification about the product."
      ]
    }
  ]$sections$::jsonb,
  'https://lendqubegh.loan',
  'Visit MoneyQube'
),
(
  'loan-support-contact-channels',
  'Use the right RapidLink channel for support',
  'Service Updates',
  date '2026-11-05',
  'Customers can use dedicated RapidLink contact numbers for Controller and SME loan enquiries, branch assistance, complaints and general support.',
  '/assets/contact-hero-v2.png',
  'RapidLink customer support representative assisting a customer',
  false,
  false,
  $sections$[
    {
      "heading": "Controller and SME loan support",
      "paragraphs": [
        "For Controller and SME loan enquiries, customers can contact RapidLink on 053 373 0336 or 030 224 6657. These channels can be used to request guidance about the relevant product and application process.",
        "Customers should have their questions ready but should never disclose a password, PIN or one-time verification code during an unsolicited call."
      ]
    },
    {
      "heading": "Complaints and general enquiries",
      "paragraphs": [
        "For complaints and general enquiries, call 030 395 5183. Explain the issue clearly and provide only the information needed for the support team to identify and review the matter.",
        "Where a reference number is provided, keep it safely and quote it in future communication about the same issue."
      ]
    },
    {
      "heading": "Branch assistance",
      "paragraphs": [
        "Customers who prefer in-person assistance can review the Contact page for RapidLink's current branch addresses, map directions, opening information and telephone numbers before travelling.",
        "Always confirm contact information through RapidLink's official website, especially before sending documents or acting on payment instructions."
      ]
    }
  ]$sections$::jsonb,
  'https://rapidlinkgh.com/contact',
  'View all contact information'
),
(
  'practical-financial-habits-for-everyday-planning',
  'Five practical financial habits for stronger everyday planning',
  'Community',
  date '2026-11-05',
  'Simple budgeting, regular saving and responsible borrowing habits can help individuals, families and small businesses plan with greater confidence.',
  '/assets/group-loan.jpg',
  'Ghanaian entrepreneurs working together toward shared financial goals',
  false,
  false,
  $sections$[
    {
      "heading": "1. Give every cedi a purpose",
      "paragraphs": [
        "Start each month by listing expected income and essential expenses. Set spending limits for flexible items and record what you actually spend so that you can adjust before small overruns become larger problems."
      ]
    },
    {
      "heading": "2. Build a regular saving habit",
      "paragraphs": [
        "Choose a realistic amount and save it consistently, even when the amount is small. Treating savings as a planned expense can make the habit easier to maintain than waiting to save whatever remains at the end of the month."
      ]
    },
    {
      "heading": "3. Keep emergency money separate",
      "paragraphs": [
        "An emergency fund is intended for unexpected and necessary expenses. Keeping it separate from everyday spending can reduce the temptation to use it for non-essential purchases."
      ]
    },
    {
      "heading": "4. Borrow with a repayment plan",
      "paragraphs": [
        "Before taking credit, understand the interest, fees, repayment dates and total amount due. Compare the repayment with your reliable income and existing obligations, and avoid borrowing more than you can reasonably repay."
      ]
    },
    {
      "heading": "5. Review your progress regularly",
      "paragraphs": [
        "Review your budget and savings goals at least once a month. Celebrate progress, identify unnecessary costs and revise the plan when your income, responsibilities or priorities change.",
        "Customers who want to explore an approved RapidLink savings option can review the Savings section or contact RapidLink for product information."
      ]
    }
  ]$sections$::jsonb,
  'https://rapidlinkgh.com/rapid-savings',
  'Explore savings options'
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  published_at = excluded.published_at,
  summary = excluded.summary,
  image = excluded.image,
  image_alt = excluded.image_alt,
  featured = excluded.featured,
  is_published = excluded.is_published,
  sections = excluded.sections,
  external_link = excluded.external_link,
  external_label = excluded.external_label,
  updated_at = now();
