import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from '../icons'
import { getNavigation } from '../content/index.js'

const socialLinks = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/rapidlinkmicrofinance', icon: 'linkedin' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@rapidlink_media', icon: 'tiktok' },
  { name: 'Instagram', href: 'https://www.instagram.com/rapidlinkmicrofinance/', icon: 'instagram' },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61584683032500', icon: 'facebook' },
  { name: 'X', href: 'https://x.com/rapidlink_media', icon: 'x' },
]

const socialIconPaths = {
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z',
  tiktok: 'M19.59 6.69a4.79 4.79 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 1 1-2.89-2.89c.3 0 .59.05.87.13V9.4a6.34 6.34 0 1 0 5.46 6.27V8.72a8.16 8.16 0 0 0 4.78 1.55V6.82c-.34 0-.67-.05-1-.13Z',
  instagram: 'M12 2.16c3.2 0 3.58.02 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.35 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z',
  facebook: 'M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z',
  x: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.74-8.85L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z',
}

const footerMenuDescriptions = {
  'Savings & Investments': 'Choose an account or investment option.',
  Loans: 'Explore borrowing options and loan tools.',
  'About Us': 'Learn more about RapidLink and our people.',
}

function SocialIcon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d={socialIconPaths[name]} /></svg>
}

export default function Footer() {
  const navGroups = getNavigation()
  const [openGroup, setOpenGroup] = useState('')
  const hoverOpenedGroup = useRef('')
  const location = useLocation()

  useEffect(() => setOpenGroup(''), [location.pathname, location.hash])

  useEffect(() => {
    const closeMenus = event => {
      if (event.key === 'Escape') setOpenGroup('')
      if (event.type === 'pointerdown' && (!(event.target instanceof Element) || !event.target.closest('.footer-menu-group'))) setOpenGroup('')
    }
    document.addEventListener('keydown', closeMenus)
    document.addEventListener('pointerdown', closeMenus)
    return () => {
      document.removeEventListener('keydown', closeMenus)
      document.removeEventListener('pointerdown', closeMenus)
    }
  }, [])

  const groupId = label => `footer-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-menu`
  const openGroupFromHover = label => {
    hoverOpenedGroup.current = label
    setOpenGroup(label)
  }
  const closeGroupFromHover = () => {
    hoverOpenedGroup.current = ''
    setOpenGroup('')
  }
  const toggleGroup = label => {
    if (hoverOpenedGroup.current === label) {
      hoverOpenedGroup.current = ''
      setOpenGroup(label)
      return
    }
    setOpenGroup(current => current === label ? '' : label)
  }

  const dropdown = group => {
    const isOpen = openGroup === group.label
    return <div className="footer-menu-group" key={group.label} onPointerEnter={event => event.pointerType === 'mouse' && openGroupFromHover(group.label)} onPointerLeave={event => event.pointerType === 'mouse' && closeGroupFromHover()} onBlur={event => !event.currentTarget.contains(event.relatedTarget) && setOpenGroup('')}>
      <button className="footer-menu-trigger" type="button" aria-expanded={isOpen} aria-controls={groupId(group.label)} onClick={() => toggleGroup(group.label)}><span>{group.label}</span><ChevronDown size={16} /></button>
      <div id={groupId(group.label)} className={`footer-menu-list${group.label === 'Savings & Investments' ? ' is-wide' : ''}`} hidden={!isOpen}>
        <div className="footer-menu-heading"><span aria-hidden="true" /><div><strong>{group.label}</strong><small>{footerMenuDescriptions[group.label]}</small></div></div>
        <div className={`footer-menu-links${group.label === 'Savings & Investments' ? ' is-two-column' : ''}`}>{group.items.map(({ label, href }) => <Link key={href} to={href}>{label}</Link>)}</div>
      </div>
    </div>
  }

  return <footer>
    <div className="shell footer-grid">
      <div className="footer-brand">
        <img className="footer-logo" src="/assets/rapidlink-logo.png" alt="RapidLink Microfinance Limited" />
        <p>Accessible financial services for individuals, communities and small businesses in Ghana.</p>
        <nav className="footer-socials" aria-label="Official RapidLink social media profiles">
          <h2>Follow RapidLink</h2>
          <div className="footer-social-links">
            {socialLinks.map(social => <a className="footer-social-link" href={social.href} key={social.name} target="_blank" rel="noopener noreferrer" aria-label={`Follow RapidLink on ${social.name}`} title={social.name}><SocialIcon name={social.icon} /></a>)}
          </div>
        </nav>
      </div>
      <nav className="footer-links-column" aria-label="Explore RapidLink products">
        <h2>Explore</h2>
        {dropdown(navGroups[0])}
        {dropdown(navGroups[1])}
        <Link to="/rates">Current rates</Link>
        <Link to="/digital-channels">Digital channels</Link>
      </nav>
      <nav className="footer-links-column" aria-label="Company information">
        <h2>Company</h2>
        {dropdown(navGroups[2])}
        <Link to="/stories">News</Link>
        <Link to="/faqs">FAQs</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <div className="footer-contact">
        <h2>Get in touch</h2>
        <a href="tel:+233303955183">030 395 5183</a>
        <a href="mailto:info@rapidlinkfinance.com">info@rapidlinkfinance.com</a>
        <p>17 Farrar Avenue, Asylum Down, Accra<br />Digital address: GA-049-5378</p>
      </div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} RapidLink Microfinance Ltd.</span><span>Approved privacy-policy content is pending.</span></div>
  </footer>
}
