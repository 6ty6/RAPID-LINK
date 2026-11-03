export const announcements = [
  'NEW: RapidLink introduces MoneyQube, a digital nano-loan platform offering small loans with a convenient one-month repayment period.',
  'IMPORTANT NOTICE: Customers who repeatedly issue dud cheques risk financial penalties, a cheque ban and restrictions on new credit facilities.',
  'For Controller or SME loan enquiries, call 053 373 0336 or 030 224 6657.',
  'For complaints or general enquiries, call 030 395 5183.',
  'RAPID SME LOAN PROMO: Access up to GH¢20,000 with a maximum term of six months. Terms and conditions apply.',
  'RAPID CONTROLLER LOAN: Available to CAGD staff with published loan terms of up to 60 months. Terms and conditions apply.',
  'RAPID POLICE LOAN: Available to Ghana Police Service employees for up to 30 months. Terms and conditions apply.',
]

export const newsArticles = [
  {
    slug: 'bank-of-ghana-dud-cheque-sanctions',
    title: 'Bank of Ghana revises sanctions for dud cheques',
    category: 'Customer Notices',
    publishedAt: '2026-06-24',
    summary: 'Customers are reminded to ensure sufficient funds are available before issuing cheques under the revised sanctions regime.',
    image: '/assets/hero-notice.jpg',
    imageAlt: 'Customer notice about issuing cheques with sufficient funds',
    featured: true,
    sections: [
      { paragraphs: ['A dud cheque is one that cannot be honoured because the account has insufficient funds. The revised directive took effect on 24 June 2026.'] },
      { heading: 'First offence', paragraphs: ['A 10% levy, formal warning, reporting to credit reference bureaus and the Bank of Ghana, and surveillance for at least one year.'] },
      { heading: 'Second offence within one year', paragraphs: ['A 15% levy, a second formal warning and further reporting.'] },
      { heading: 'Third offence within one year', paragraphs: ['A 20% levy, a minimum three-year ban from issuing cheques, a one-year restriction on new credit facilities and recall of unused cheque books. The Bank of Ghana may publish names of third-time offenders.'] },
      { heading: 'Returning cheque books', paragraphs: ['Failure to return unused cheque books within ten working days after notification may lead to further sanctions.', 'Customers should ensure sufficient funds are available before issuing cheques. A cheque restriction does not prevent receipt of funds or other approved electronic transactions.'] },
    ],
  },
  {
    slug: 'moneyqube-digital-nano-loans',
    title: 'Access MoneyQube digital nano loans',
    category: 'Product News',
    publishedAt: '2026-05-20',
    summary: 'MoneyQube offers access to small digital loans with a convenient one-month repayment period.',
    image: '/assets/digital-moneyqube.png',
    imageAlt: 'MoneyQube digital lending service',
    externalLink: 'https://lendqubegh.loan',
    externalLabel: 'Visit MoneyQube',
    sections: [
      { paragraphs: ['RapidLink’s MoneyQube platform provides digital nano loans for customers who need access to small, short-term credit. The published repayment period is one month.'] },
      { heading: 'Confirm the current terms', paragraphs: ['Eligibility, charges and current lending terms should be reviewed on the MoneyQube platform before applying.'] },
    ],
  },
  {
    slug: 'loan-support-contact-channels',
    title: 'Where to get support for your loan enquiry',
    category: 'Service Updates',
    publishedAt: '2026-04-15',
    summary: 'Use the appropriate RapidLink support number for Controller loans, SME loans, complaints and general enquiries.',
    image: '/assets/hero-controller.png',
    imageAlt: 'RapidLink loan support information',
    sections: [
      { heading: 'Controller and SME loan support', paragraphs: ['For Controller or SME loan enquiries, call 053 373 0336 or 030 224 6657.'] },
      { heading: 'Complaints and general enquiries', paragraphs: ['For complaints or other enquiries, call 030 395 5183 or email info@rapidlinkfinance.com.'] },
      { heading: 'Before sharing personal information', paragraphs: ['Confirm that you are communicating through an official RapidLink contact channel before sharing account or application details.'] },
    ],
  },
]

export const careerVacancies = [
  {
    id: 'deposit-mobilization-lead',
    title: 'Deposit Mobilization Lead',
    department: 'Sales and Business Development',
    location: 'Head Office, Asylum Down — Accra',
    employment_type: 'Full-time',
    summary: 'Responsible for overseeing the entire sales pipeline and cycle while growing deposits and customer relationships.',
    responsibilities: [
      'Oversee the full sales cycle, from prospecting and engagement through conversion and relationship management.',
      'Identify and develop target markets for deposit mobilisation.',
      'Maintain effective customer relationship management processes and accurate sales records.',
      'Prepare sales reports, forecasts and performance updates for management.',
      'Monitor market trends, customer needs and competitor activity.',
      'Manage agreed targets, key performance indicators and the sales budget.',
    ],
    status: 'open',
    is_published: true,
    application_email: 'info@rapidlinkfinance.com',
  },
]

export const products = {
  'personal-loan': { category: 'Loans', title: 'Personal Loans', intro: 'Designed to help you manage life’s important moments—whether covering unexpected expenses, funding education or fulfilling personal goals.', heroImage: '/assets/personal-loan-hero.png', image: '/assets/personal-loan-public.webp', imageAlt: 'Ghana cedi notes arranged beside a black wallet', benefits: ['Fast and easy application process', 'Flexible repayment terms', 'Competitive interest rates', 'No hidden charges', 'Access to financial advice'], requirements: ['National ID (Ghana Card / Voter’s ID / Passport)', 'Recent passport-sized photograph', 'Proof of income or employment', 'Completed loan application form', 'Guarantor information (if applicable)', 'Utility bill or proof of residence'], loan: true },
  'group-loan': { category: 'Loans', title: 'Group Loans', intro: 'Empowering small groups with collective access to credit—promoting shared responsibility, financial inclusion and community growth.', heroImage: '/assets/group-loan-hero.webp', image: '/assets/group-loan.jpg', imageAlt: 'Illustration of business planning, shared goals and financial growth', benefits: ['Fast and easy application process', 'Flexible repayment terms', 'Competitive interest rates', 'No hidden charges', 'Access to financial advice'], requirements: ['National ID (Ghana Card / Voter’s ID / Passport)', 'Recent passport-sized photograph', 'Proof of income or employment', 'Completed loan application form', 'Guarantor information (if applicable)', 'Utility bill or proof of residence'], loan: true },
  'deduct-at-source-loan': { category: 'Loans', title: 'Deduction at Source', intro: 'Convenient access to credit with automatic repayments directly from your salary—making borrowing simple, secure and stress-free.', heroImage: '/assets/deduct-loan-hero.jpg', image: '/assets/deduct-loan.jpg', imageAlt: 'Three professionals reviewing financial information together', benefits: ['Fast and easy application process', 'Flexible repayment terms', 'Competitive interest rates', 'No hidden charges', 'Access to financial advice'], requirements: ['National ID (Ghana Card / Voter’s ID / Passport)', 'Recent passport-sized photograph', 'Proof of income or employment', 'Completed loan application form', 'Guarantor information (if applicable)', 'Utility bill or proof of residence'], loan: true },
  'business-loan': { category: 'Loans', title: 'Business Loans', intro: 'Flexible financing designed to support entrepreneurs, startups and growing enterprises.', heroImage: '/assets/business-loan-hero.png', image: '/assets/business-loan.jpg', imageAlt: 'A business team collaborating around a table', benefits: ['Fast and easy application process', 'Flexible repayment terms', 'Competitive interest rates', 'No hidden charges', 'Access to financial advice'], requirements: ['National ID (Ghana Card / Voter’s ID / Passport)', 'Recent passport-sized photograph', 'Proof of income or employment', 'Completed loan application form', 'Guarantor information (if applicable)', 'Utility bill or proof of residence'], loan: true },
  'rapid-savings': { category: 'Savings', title: 'Rapid Savings', intro: 'Build a strong financial future with reliable savings tailored to your needs.', heroImage: '/assets/rapid-savings-hero.png', image: '/assets/rapid-savings.jpg', imageAlt: 'A smiling man taking a break after exercising outdoors', benefits: ['Published interest rate of 6% per annum', 'Unlimited access to your funds', 'No service or withdrawal charges', 'Savings may qualify you for a loan facility', 'Free passbook and withdrawal booklet'], requirements: ['2 passport-size photographs', 'Valid Ghana Card', 'Proof of residential address', 'Digital address', 'Completed account-opening form', 'Minimum opening amount: GH¢10'] },
  'rapid-susu': { category: 'Savings', title: 'Rapid Susu', intro: 'A daily savings service for small cash earners. Field executives come to you to collect your savings.', heroImage: '/assets/rapid-susu-hero.png', image: '/assets/rapid-susu.jpg', imageAlt: 'A market trader standing in front of her produce stall', benefits: ['No service charges', 'Unlimited withdrawals', 'Access to the Rapid Susu Loan Scheme', 'A minimum two-month contribution may qualify you for the loan scheme'], requirements: ['2 passport-size photographs', 'Valid Ghana Card', 'Proof of residential address', 'Digital address', 'Completed account-opening form', 'Minimum opening amount: GH¢10'] },
  'rapid-edu-grow': { category: 'Savings', title: 'Rapid Edu-Grow', intro: 'A tailored savings plan helping parents and guardians prepare for school fees and other education expenses.', heroImage: '/assets/rapid-edu-grow-hero.png', image: '/assets/rapid-edu-grow.jpg', imageAlt: 'Parents spending time outdoors with their young children', benefits: ['Published interest rate of 8% per annum', 'Save toward a child’s education or future needs', 'Daily, weekly, fortnightly or monthly deposits', 'Withdrawals limited to once every four months', 'Consistent saving may qualify you for a loan', 'No account-maintenance charges'], requirements: ['2 passport-size photographs each for child and parent/guardian', 'Parent or guardian’s valid Ghana Card', 'Child’s NHIS/Ghana Card', 'Parent or guardian’s digital address', 'Birth certificate', 'Minimum opening amount: GH¢20'] },
  'rapid-target-savings': { category: 'Savings', title: 'Rapid Target Savings', intro: 'An interest-bearing account for people accumulating funds toward future goals.', heroImage: '/assets/rapid-target-savings-hero.webp', image: '/assets/rapid-target-savings.webp', imageAlt: 'A businesswoman working toward her goals on a laptop', benefits: ['Published rate: prevailing 91-day Treasury bill rate minus 1%', 'Interest compounded monthly', 'Minimum balance required to earn interest', 'Account may secure a loan at the prevailing rate', 'Withdrawals limited to once every three months', 'Excess withdrawals attract a 20% penalty on accumulated interest'], requirements: ['2 passport-size photographs', 'Valid Ghana Card', 'Proof of residence', 'Some requirements may be waived for existing customers', 'Mandatory initial deposit: GH¢50'] },
  'fixed-deposit': { category: 'Investments', title: 'Fixed Deposit', intro: 'Lock away a lump sum for a fixed period and earn interest.', heroImage: '/assets/fixed-deposit-hero-v2.png', image: '/assets/fixed-deposit.webp', imageAlt: 'A confident businesswoman standing in a modern office', benefits: ['Flexible terms of 91, 182 and 365 days', 'Earn competitive interest rates up to 31% per annum', 'Renewal option at term end', 'Monthly, quarterly or annual interest-payment options', 'No account-maintenance or transaction fees', 'Early liquidation attracts a 20% penalty on accumulated interest'], requirements: ['1 passport-size photograph', 'Valid Ghana Card', 'Proof of residence', 'Completed account-opening forms', 'Minimum deposit: GH¢500; maximum: GH¢50,000'] },
  'advantage-investment': { category: 'Investments', title: 'Advantage Investment', intro: 'A flexible investment designed for people looking to grow wealth over time.', heroImage: '/assets/advantage-investment-hero.jpg', image: '/assets/advantage-investment.webp', imageAlt: 'Two business professionals shaking hands', benefits: ['Flexible terms of 91, 182 and 365 days', 'Earn competitive interest rates up to 31% per annum', 'Renewal option at term end', 'Monthly, quarterly or annual interest-payment options', 'No account-maintenance or transaction fees', 'Early liquidation attracts a 20% penalty on accumulated interest'], requirements: ['1 passport-size photograph', 'Valid Ghana Card', 'Proof of residence', 'Completed account-opening forms', 'Minimum deposit: GH¢500; maximum: GH¢50,000'] },
}

export const faqs = [
  ['What do I need to open an account?', 'Visit a branch with a valid ID, proof of address and a passport-sized photograph, or begin with the online form.'],
  ['What is the minimum savings balance?', 'The published minimum is GH¢10 for a savings account and GH¢30 for a premier account.'],
  ['What loans are available?', 'RapidLink publishes personal, business, Controller and Police loan information. Product eligibility and current terms must be confirmed with the team.'],
  ['How do I apply for a loan?', 'Personal and business loan applicants can contact a branch. The general online application portal is not yet verified.'],
  ['What is Advantage Investment?', 'The published FAQ describes it as similar to Fixed Deposit but with the flexibility to add principal. It states the rate is the Bank of Ghana rate plus 1%; confirm current terms because published rate information is inconsistent.'],
  ['What is the main difference from Fixed Deposit?', 'The published distinction is the ability to top up Advantage Investment, while a Fixed Deposit cannot be topped up after the initial investment.'],
  ['Is my investment secure?', 'RapidLink’s published FAQ states that it is a licensed microfinance institution and that investments are managed with diligence and care.'],
]

export const navGroups = [
  { label: 'Savings & Investments', href: '/rapid-savings', items: [['Rapid Savings','/rapid-savings'],['Rapid Susu','/rapid-susu'],['Rapid Edu-Grow','/rapid-edu-grow'],['Rapid Target Savings','/rapid-target-savings'],['Fixed Deposit','/fixed-deposit'],['Advantage Investment','/advantage-investment'],['Current Rates','/rates']] },
  { label: 'Loans', href: '/personal-loan', items: [['Personal Loans','/personal-loan'],['Group Loans','/group-loan'],['Deduction at Source','/deduct-at-source-loan'],['Business Loans','/business-loan'],['Loan Calculator','/loan-calculator']] },
  { label: 'About Us', href: '/institutional-profile', items: [['Institutional Profile','/institutional-profile'],['Board of Directors','/board-of-directors'],['Careers','/rapidlink-careers']] },
]
