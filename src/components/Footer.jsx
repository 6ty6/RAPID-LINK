import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, MapPin, Phone } from '../icons'
import { getNavigation, getSharedContent, getSiteInformation } from '../content/index.js'

const navGroups = getNavigation()
const { branches, contact, socialProfiles } = getSiteInformation()
const iconPaths = {
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z',
  tiktok: 'M19.59 6.69a4.79 4.79 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 1 1-2.89-2.89c.3 0 .59.05.87.13V9.4a6.34 6.34 0 1 0 5.46 6.27V8.72a8.16 8.16 0 0 0 4.78 1.55V6.82c-.34 0-.67-.05-1-.13Z',
  instagram: 'M12 2.16c3.2 0 3.58.02 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16Zm0 3.68a6.16 6.16 0 1 0 0 12.32A6.16 6.16 0 0 0 12 5.84Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z',
  facebook: 'M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z',
  x: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.74-8.85L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z',
}

function SocialIcon({ name }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPaths[name]} /></svg>
}

export default function Footer() {
  const { footer } = getSharedContent()
  const [openGroup, setOpenGroup] = useState('')

  return <footer className="ct-footer">
    <div className="shell ct-footer-cta">
      <div><span>Need help choosing?</span><h2>Speak with a RapidLink adviser.</h2><p>Get guidance on savings, investments and responsible credit.</p></div>
      <div><Link className="button" to="/contact">Contact our team <ArrowRight size={17} /></Link><a href={contact.supportLines[0].href}><Phone size={18} />{contact.supportLines[0].display}</a></div>
    </div>

    <div className="ct-footer-main">
      <div className="shell ct-footer-directory">
        <div className="ct-footer-identity">
          <img src="/assets/rapidlink-logo-400.png" alt="RapidLink Microfinance Limited" />
          <p>{footer.description}</p>
          <div className="ct-socials" aria-label="Official RapidLink social media profiles">
            {socialProfiles.map(social => <a href={social.href} key={social.name} target="_blank" rel="noopener noreferrer" aria-label={`Follow RapidLink on ${social.name}`}><SocialIcon name={social.icon} /></a>)}
          </div>
        </div>

        {navGroups.map(group => {
          const isOpen = openGroup === group.label
          return <nav className={`ct-footer-group${isOpen ? ' is-open' : ''}`} aria-label={group.label} key={group.label}>
            <button className="ct-footer-group-trigger" type="button" aria-expanded={isOpen} onClick={() => setOpenGroup(current => current === group.label ? '' : group.label)}>{group.label}<ChevronDown size={16} /></button>
            <div className="ct-footer-group-links">{group.items.map(item => <Link key={item.href} to={item.href}>{item.label}</Link>)}</div>
          </nav>
        })}

        <div className="ct-footer-contact">
          <h2>Visit or contact us</h2>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          {branches.map(branch => <div key={branch.id}><MapPin size={16} /><span><strong>{branch.title}</strong>{branch.address}</span></div>)}
        </div>
      </div>
    </div>
    <div className="ct-footer-legal"><div className="shell"><span>© {new Date().getFullYear()} {footer.companyName}</span><span>{footer.privacyNotice}</span><div><Link to="/rates">Current rates</Link><Link to="/digital-channels">Digital channels</Link><Link to="/stories">News</Link><Link to="/faqs">FAQs</Link><Link to="/contact">Contact</Link></div></div></div>
  </footer>
}
