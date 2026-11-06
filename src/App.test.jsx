import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

function renderAt(route) {
  return render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>)
}

describe('RapidLink site', () => {
  it('renders an audited product route and its action', () => {
    renderAt('/rapid-savings')
    expect(screen.getByRole('heading', { name: 'Rapid Savings', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open an account' })).toHaveAttribute('href', '/open-account')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://rapidlinkgh.com/rapid-savings')
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://rapidlinkgh.com/assets/rapid-savings-hero.png')
  })

  it('shows the assigned image in a loan product hero', () => {
    const { container } = renderAt('/deduct-at-source-loan')
    expect(container.querySelector('.page-hero-media img')).toHaveAttribute('src', '/assets/deduct-loan-hero.jpg')
    expect(container.querySelector('.product-feature-image img')).toHaveAttribute('src', '/assets/deduct-loan.jpg')
  })

  it('uses the verified public personal-loan image in the compact product layout', () => {
    const { container } = renderAt('/personal-loan')
    expect(container.querySelector('.product-feature-image img')).toHaveAttribute('src', '/assets/personal-loan-public.webp')
    expect(container.querySelector('.product-info-card h3')).toHaveTextContent('Benefits')
    expect(container.querySelectorAll('.product-info-card h3')[1]).toHaveTextContent('What you’ll need')
  })

  it('uses verified public images for savings and investment products', () => {
    const savings = renderAt('/rapid-susu').container
    expect(savings.querySelector('.page-hero-media img')).toHaveAttribute('src', '/assets/rapid-susu-hero.png')
    expect(savings.querySelector('.product-feature-image img')).toHaveAttribute('src', '/assets/rapid-susu.jpg')

    const investment = renderAt('/fixed-deposit').container
    expect(investment.querySelector('.page-hero-media img')).toHaveAttribute('src', '/assets/fixed-deposit-hero-v2.png')
    expect(investment.querySelector('.product-feature-image img')).toHaveAttribute('src', '/assets/fixed-deposit.webp')
  })

  it('uses banking-themed image headers for key information pages', () => {
    const routes = [
      ['/stories', '/assets/news-hero-v3.png'],
      ['/faqs', '/assets/faq-hero-v3.png'],
      ['/contact', '/assets/contact-hero-v2.png'],
      ['/rates', '/assets/rates-hero-v2.png'],
      ['/loan-calculator', '/assets/loan-calculator-hero-v2.png'],
    ]

    routes.forEach(([route, image]) => {
      const { container } = renderAt(route)
      expect(container.querySelector('.page-hero.has-image .page-hero-media img')).toHaveAttribute('src', image)
    })
  })

  it('uses the official imagery for every digital channel', () => {
    const { container } = renderAt('/digital-channels')
    expect(container.querySelectorAll('.digital-card')).toHaveLength(5)
    expect([...container.querySelectorAll('.digital-card-image img')].map(image => image.getAttribute('src'))).toEqual([
      '/assets/digital-mobile-app.png',
      '/assets/digital-rapidpay-ussd.png',
      '/assets/digital-mtn-merchant.png',
      '/assets/digital-telecel-merchant.png',
      '/assets/digital-moneyqube.png',
    ])
  })

  it('shows the published institutional impact counters', () => {
    const { container } = renderAt('/institutional-profile')
    expect(container.querySelector('.about-hero img')).toHaveAttribute('src', '/assets/about-institutional-profile.jpg')
    expect(screen.getByText(/trusted and customer-centric force in Ghana’s financial sector/)).toBeInTheDocument()
    expect(screen.getByText('Asylum Down; 17 Farrar Avenue')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('7,000+')).toBeInTheDocument()
    expect(screen.getByText('15+')).toBeInTheDocument()
    expect(screen.getByText('5+')).toBeInTheDocument()
  })

  it('reveals the institutional vision and mission with accessible flip controls', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/institutional-profile')
    const page = within(container)
    const [vision] = page.getAllByRole('button', { name: 'Show details for Our Vision' })
    const [mission] = page.getAllByRole('button', { name: 'Show details for Our Mission' })
    expect(vision).toHaveAttribute('aria-pressed', 'false')
    expect(mission).toHaveAttribute('aria-pressed', 'false')
    await user.click(vision)
    expect(vision).toHaveAttribute('aria-pressed', 'true')
    expect(vision).toHaveAccessibleName('Show front of Our Vision')
  })

  it('shows the official board portraits and opens an accessible biography', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/board-of-directors')
    expect(container.querySelector('.about-hero img')).toHaveAttribute('src', '/assets/about-board-directors-v2.png')
    expect(screen.getByRole('heading', { level: 1, name: 'Board of Directors' })).toBeVisible()
    expect(container.querySelector('img[alt="Dr. Emmanuel Debrah, Board Chairman"]')).toHaveAttribute('src', '/assets/board-emmanuel-debrah.png')
    expect(container.querySelector('img[alt="Edward Opare-Donkor, Managing Director"]')).toHaveAttribute('src', '/assets/board-edward-opare-donkor.png')
    expect(container.querySelector('img[alt="Henrici Daniel Aboa, Board Member"]')).toHaveAttribute('src', '/assets/board-henrici-daniel-aboa.png')
    expect(screen.queryByText('Senior Management')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View profile for Edward Opare-Donkor' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('over two decades of financial expertise')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('uses the required public header image on the careers page', () => {
    const careers = renderAt('/rapidlink-careers').container
    expect(careers.querySelector('.about-hero img')).toHaveAttribute('src', '/assets/about-careers.jpeg')
  })

  it('shows the current vacancy and opens its details', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/rapidlink-careers')
    const page = within(container)
    expect(page.getByRole('heading', { name: 'Deposit Mobilization Lead' })).toBeInTheDocument()
    expect(container.querySelector('.vacancy-department')).toHaveTextContent('Sales and Business Development')
    await user.click(page.getByRole('button', { name: 'View details' }))
    expect(page.getByRole('dialog')).toHaveTextContent('Manage agreed targets, key performance indicators and the sales budget.')
    expect(page.getByRole('link', { name: /Apply for this position/ })).toHaveAttribute('href', expect.stringContaining('info@rapidlinkfinance.com'))
  })

  it('keeps the hidden content portal unavailable until secure authentication is configured', () => {
    const { container } = renderAt('/content-management')
    expect(screen.getByRole('heading', { name: 'Content management is securely locked' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Job title/ })).not.toBeInTheDocument()
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    expect(container.querySelector('a[href="/content-management"]')).not.toBeInTheDocument()
  })

  it('provides a protected staff invitation acceptance route', async () => {
    renderAt('/accept-invite')
    expect(screen.getByRole('heading', { name: 'Create your portal password' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'This link cannot be used' })).toBeInTheDocument()
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  })

  it('filters the scalable news grid by category', async () => {
    const user = userEvent.setup()
    const news = renderAt('/stories').container
    const newsroom = within(news)
    expect(newsroom.getByRole('heading', { name: 'Bank of Ghana revises sanctions for dud cheques' })).toBeInTheDocument()
    expect(news.querySelectorAll('.news-card')).toHaveLength(2)
    await user.click(newsroom.getByRole('button', { name: 'Product News' }))
    expect(news.querySelectorAll('.news-card')).toHaveLength(1)
    expect(news.querySelector('.news-card')).toHaveTextContent('Access MoneyQube digital nano loans')
  })

  it('opens a complete news article on its own route', () => {
    const { container } = renderAt('/stories/bank-of-ghana-dud-cheque-sanctions')
    const article = within(container)
    expect(article.getByRole('heading', { name: 'Bank of Ghana revises sanctions for dud cheques', level: 1 })).toBeInTheDocument()
    expect(container.querySelector('.news-article-image img')).toHaveAttribute('src', '/assets/hero-notice.jpg')
    expect(article.getByRole('heading', { name: 'Third offence within one year' })).toBeInTheDocument()
  })

  it('advances the homepage slider with an accessible control', async () => {
    const user = userEvent.setup()
    renderAt('/home')
    expect(screen.getByRole('heading', { name: 'Build steadily. Move confidently.', hidden: true })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('heading', { name: 'Issue cheques with sufficient funds.', hidden: true })).toBeInTheDocument()
  })

  it('shows the flyer for three seconds, then the copy for eight seconds', () => {
    vi.useFakeTimers()
    renderAt('/home')
    const heading = screen.getByRole('heading', { name: 'Build steadily. Move confidently.', hidden: true })
    expect(heading.closest('.hero-content')).toHaveAttribute('aria-hidden', 'true')
    act(() => vi.advanceTimersByTime(3000))
    expect(heading.closest('.hero-content')).toHaveAttribute('aria-hidden', 'false')
    act(() => vi.advanceTimersByTime(8000))
    expect(screen.getByRole('heading', { name: 'Issue cheques with sufficient funds.', hidden: true })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('explains why the general loan application is blocked', () => {
    renderAt('/apply-loan')
    expect(screen.getByRole('heading', { name: 'Online application connection pending' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'MoneyQube nano loans' })).toHaveAttribute('href', 'https://lendqubegh.loan')
  })

  it('validates the first account-opening step before advancing', async () => {
    const user = userEvent.setup()
    renderAt('/open-account')
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('group', { name: 'Choose a product' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Rapid Savings' }))
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByRole('group', { name: 'Personal and identification details' })).toBeInTheDocument()
  })

  it('calculates a loan estimate with the retained six-percent formula', async () => {
    const user = userEvent.setup()
    renderAt('/loan-calculator')
    expect(screen.getByLabelText('Annual Interest Rate')).toHaveValue(6)
    expect(screen.getByLabelText('Annual Interest Rate')).toHaveAttribute('readonly')
    await user.type(screen.getByLabelText('Principal Amount'), '1000')
    await user.type(screen.getByLabelText('Loan Duration (Months)'), '2')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('GHC 120.00')).toBeInTheDocument()
    expect(screen.getByText('GHC 1120.00')).toBeInTheDocument()
  })

  it('exposes homepage loan tools, connected news and reordered navigation', () => {
    const { container } = renderAt('/home')
    const page = within(container)
    expect(page.getByRole('heading', { name: 'Tools at your fingertips' })).toBeInTheDocument()
    expect(page.getByRole('link', { name: /Current Interest Rates/ })).toHaveAttribute('href', '/rates')
    expect(container.querySelector('.quick-access-card[href="/loan-calculator"]')).toBeInTheDocument()
    expect(page.getByRole('link', { name: /Bank of Ghana revises sanctions for dud cheques/ })).toHaveAttribute('href', '/stories/bank-of-ghana-dud-cheque-sanctions')
    expect(page.queryByRole('button', { name: 'Downloadables' })).not.toBeInTheDocument()
    expect([...container.querySelectorAll('.site-header .nav-group-trigger')].map(button => button.textContent)).toEqual(['Savings & Investments', 'Loans', 'About Us'])
    expect(container.querySelector('.site-header .nav-group-trigger')).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.site-header .nav-group > a')).not.toBeInTheDocument()
  })

  it('opens header and footer groups from one non-navigating trigger', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/home')
    const header = within(container.querySelector('.site-header'))
    const headerTrigger = header.getByRole('button', { name: 'Savings & Investments' })

    await user.click(headerTrigger)
    expect(headerTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(header.getByRole('link', { name: 'Rapid Savings' })).toHaveAttribute('href', '/rapid-savings')

    await user.click(container.querySelector('main'))
    expect(headerTrigger).toHaveAttribute('aria-expanded', 'false')

    const footer = within(container.querySelector('footer'))
    const footerTrigger = footer.getByRole('button', { name: 'Loans' })
    await user.click(footerTrigger)
    expect(footerTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(footer.getByRole('link', { name: 'Loan Calculator' })).toHaveAttribute('href', '/loan-calculator')
  })

  it('shows a non-clickable site-wide announcement banner', () => {
    const { container } = renderAt('/home')
    const banner = within(container).getByRole('complementary', { name: 'RapidLink announcements' })
    expect(banner).toHaveTextContent('MoneyQube')
    expect(banner).toHaveTextContent('Controller or SME loan enquiries')
    expect(within(banner).queryByRole('link')).not.toBeInTheDocument()
    expect(banner.querySelector('.announcement-track')).toBeInTheDocument()
  })

  it('provides the important contacts in the mobile header', () => {
    const { container } = renderAt('/home')
    const mobileContacts = within(container.querySelector('.mobile-header-utility'))
    expect(mobileContacts.getByRole('link', { name: /Customer support 030 395 5183/ })).toHaveAttribute('href', 'tel:+233303955183')
    expect(mobileContacts.getByRole('link', { name: /Controller \/ SME 053 373 0336/ })).toHaveAttribute('href', 'tel:+233533730336')
  })

  it('links to every official RapidLink social profile from the footer', () => {
    const { container } = renderAt('/home')
    const footer = within(container.querySelector('footer'))
    const profiles = [
      ['LinkedIn', 'https://www.linkedin.com/company/rapidlinkmicrofinance'],
      ['TikTok', 'https://www.tiktok.com/@rapidlink_media'],
      ['Instagram', 'https://www.instagram.com/rapidlinkmicrofinance/'],
      ['Facebook', 'https://www.facebook.com/profile.php?id=61584683032500'],
      ['X', 'https://x.com/rapidlink_media'],
    ]

    profiles.forEach(([name, href]) => {
      const link = footer.getByRole('link', { name: `Follow RapidLink on ${name}` })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('links the Deduction at Source product to the PDF rates guide', () => {
    const { container } = renderAt('/deduct-at-source-loan')
    expect(container.querySelector('.product-action a[href="https://rapidlinkfinance.com/loanform"]')).toBeInTheDocument()
    expect(within(container).getByRole('link', { name: 'View Loan Rates Guide' })).toHaveAttribute('href', '/rate-chart')
  })

  it('shows both branches on the contact map with separate directions', () => {
    const { container } = renderAt('/contact')
    const page = within(container)
    const map = page.getByTitle('Map showing RapidLink Head Office and Madina Branch')
    expect(map).toHaveAttribute('loading', 'lazy')
    expect(map.getAttribute('src')).toContain('Rapidlink%20Microfinance%20Head%20Office%2C%2017%20Farrar%20Avenue')
    expect(map.getAttribute('src')).toContain('Rapidlink%20Microfinance%20Madina%20Branch%2C%20Madina%20Taxi%20Rank')
    expect(page.getByRole('link', { name: /Directions to Head Office/ })).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
    expect(page.getByRole('link', { name: /Directions to Madina Branch/ })).toHaveAttribute('href', expect.stringContaining('Rapidlink%20Microfinance%20Madina%20Branch'))
    expect(page.getAllByText(/GA-049-5378/)).toHaveLength(2)
    expect(page.getAllByText(/GM-000-3774/)).toHaveLength(2)
  })

  it('previews the supplied controller rate guide before downloading', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    const { container } = renderAt('/rate-chart')
    const page = within(container)
    expect(page.getByRole('heading', { name: 'Rates Chart (2025)', level: 1 })).toBeInTheDocument()
    await user.click(page.getByRole('button', { name: 'View document' }))
    expect(container.querySelector('.pdf-preview')).toBeInTheDocument()
    expect(container.querySelector('iframe')).not.toBeInTheDocument()
    expect(page.getByRole('link', { name: 'Download' })).toHaveAttribute('href', '/downloads/rate-chart.pdf')
    expect(page.getByRole('link', { name: 'Download' })).toHaveAttribute('download')
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/downloads/rate-chart-preview.txt', { cache: 'no-store' }))
    fetchSpy.mockRestore()
  })
})
