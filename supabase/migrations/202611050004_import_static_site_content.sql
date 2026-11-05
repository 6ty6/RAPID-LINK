-- Import the content that originally lived only in src/content.js.
-- Existing matching news records are published without replacing their newer
-- edited content. The vacancy is inserted only when no matching record exists.

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
  'bank-of-ghana-dud-cheque-sanctions',
  'Bank of Ghana revises sanctions for dud cheques',
  'Customer Notices',
  date '2026-06-24',
  'Customers are reminded to ensure sufficient funds are available before issuing cheques under the revised sanctions regime.',
  '/assets/hero-notice.jpg',
  'Customer notice about issuing cheques with sufficient funds',
  true,
  true,
  $sections$[
    {
      "heading": "",
      "paragraphs": [
        "A dud cheque is one that cannot be honoured because the account has insufficient funds. The revised directive took effect on 24 June 2026."
      ]
    },
    {
      "heading": "First offence",
      "paragraphs": [
        "A 10% levy, formal warning, reporting to credit reference bureaus and the Bank of Ghana, and surveillance for at least one year."
      ]
    },
    {
      "heading": "Second offence within one year",
      "paragraphs": [
        "A 15% levy, a second formal warning and further reporting."
      ]
    },
    {
      "heading": "Third offence within one year",
      "paragraphs": [
        "A 20% levy, a minimum three-year ban from issuing cheques, a one-year restriction on new credit facilities and recall of unused cheque books. The Bank of Ghana may publish names of third-time offenders."
      ]
    },
    {
      "heading": "Returning cheque books",
      "paragraphs": [
        "Failure to return unused cheque books within ten working days after notification may lead to further sanctions.",
        "Customers should ensure sufficient funds are available before issuing cheques. A cheque restriction does not prevent receipt of funds or other approved electronic transactions."
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
  date '2026-05-20',
  'MoneyQube offers access to small digital loans with a convenient one-month repayment period.',
  '/assets/digital-moneyqube.png',
  'MoneyQube digital lending service',
  false,
  true,
  $sections$[
    {
      "heading": "",
      "paragraphs": [
        "RapidLink's MoneyQube platform provides digital nano loans for customers who need access to small, short-term credit. The published repayment period is one month."
      ]
    },
    {
      "heading": "Confirm the current terms",
      "paragraphs": [
        "Eligibility, charges and current lending terms should be reviewed on the MoneyQube platform before applying."
      ]
    }
  ]$sections$::jsonb,
  'https://lendqubegh.loan',
  'Visit MoneyQube'
),
(
  'loan-support-contact-channels',
  'Where to get support for your loan enquiry',
  'Service Updates',
  date '2026-04-15',
  'Use the appropriate RapidLink support number for Controller loans, SME loans, complaints and general enquiries.',
  '/assets/hero-controller.png',
  'RapidLink loan support information',
  false,
  true,
  $sections$[
    {
      "heading": "Controller and SME loan support",
      "paragraphs": [
        "For Controller or SME loan enquiries, call 053 373 0336 or 030 224 6657."
      ]
    },
    {
      "heading": "Complaints and general enquiries",
      "paragraphs": [
        "For complaints or other enquiries, call 030 395 5183 or email info@rapidlinkfinance.com."
      ]
    },
    {
      "heading": "Before sharing personal information",
      "paragraphs": [
        "Confirm that you are communicating through an official RapidLink contact channel before sharing account or application details."
      ]
    }
  ]$sections$::jsonb,
  'https://rapidlinkgh.com/contact',
  'View contact information'
)
on conflict (slug) do update set
  is_published = true,
  updated_at = now();

-- Publish a previously imported copy of the static vacancy, if one exists.
update public.career_vacancies
set is_published = true,
    updated_at = now()
where title = 'Deposit Mobilization Lead'
  and department = 'Sales and Business Development';

-- Otherwise create the original website vacancy as a managed database record.
insert into public.career_vacancies (
  title,
  department,
  location,
  employment_type,
  summary,
  responsibilities,
  status,
  is_published,
  application_email
)
select
  'Deposit Mobilization Lead',
  'Sales and Business Development',
  'Head Office, Asylum Down — Accra',
  'Full-time',
  'Responsible for overseeing the entire sales pipeline and cycle while growing deposits and customer relationships.',
  $responsibilities$[
    "Oversee the full sales cycle, from prospecting and engagement through conversion and relationship management.",
    "Identify and develop target markets for deposit mobilisation.",
    "Maintain effective customer relationship management processes and accurate sales records.",
    "Prepare sales reports, forecasts and performance updates for management.",
    "Monitor market trends, customer needs and competitor activity.",
    "Manage agreed targets, key performance indicators and the sales budget."
  ]$responsibilities$::jsonb,
  'open',
  true,
  'info@rapidlinkfinance.com'
where not exists (
  select 1
  from public.career_vacancies
  where title = 'Deposit Mobilization Lead'
    and department = 'Sales and Business Development'
);
