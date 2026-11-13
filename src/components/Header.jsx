import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu, Phone, X } from '../icons'
import { getNavigation, getSiteInformation } from '../content/index.js'
import AnnouncementBar from './AnnouncementBar'

const navGroups = getNavigation()
const { contact } = getSiteInformation()

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState('')
  const hoverGroup = useRef('')
  const location = useLocation()

  useEffect(() => { setMobileOpen(false); setOpenGroup('') }, [location.pathname, location.hash])
  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') { setMobileOpen(false); setOpenGroup('') }
      if (event.type === 'pointerdown' && (!(event.target instanceof Element) || !event.target.closest('.df-nav-group'))) setOpenGroup('')
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close) }
  }, [])

  const toggle = label => {
    if (hoverGroup.current === label) { hoverGroup.current = ''; setOpenGroup(label); return }
    setOpenGroup(value => value === label ? '' : label)
  }

  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <AnnouncementBar />
    <header className="site-header df-header">
      <div className="mobile-header-utility"><div className="shell mobile-header-utility-inner" aria-label="Quick contact numbers">
        {contact.supportLines.map(line => <a href={line.href} key={line.id}><Phone size={16} /><span><small>{line.mobileLabel}</small><strong>{line.display}</strong></span></a>)}
      </div></div>
      <div className="shell df-header-row">
        <Link className="brand" to="/home" aria-label="RapidLink home"><img src="/assets/rapidlink-logo-400.png" alt="RapidLink Microfinance Limited" /></Link>
        <nav id="main-nav" className={`main-nav df-main-nav${mobileOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/home">Home</NavLink>
          {navGroups.map((group, groupIndex) => {
            const isOpen = openGroup === group.label
            return <div className="nav-group df-nav-group" key={group.label} onPointerEnter={event => { if (event.pointerType === 'mouse') { hoverGroup.current = group.label; setOpenGroup(group.label) } }} onPointerLeave={event => { if (event.pointerType === 'mouse') { hoverGroup.current = ''; setOpenGroup('') } }}>
              <button className="nav-group-trigger" type="button" aria-expanded={isOpen} onClick={() => toggle(group.label)}>{group.label}<ChevronDown size={14} /></button>
              <div className={`nav-dropdown df-command-menu${isOpen ? ' is-open' : ''}`}>
                <div className="shell df-command-layout">
                  <div className="df-command-label"><span>0{groupIndex + 1}</span><p>Browse category</p><h2>{group.label}</h2></div>
                  <div className="df-command-links">{group.items.map((item, index) => <NavLink key={item.href} to={item.href} aria-label={item.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong><ArrowRight size={16} /></NavLink>)}</div>
                  <div className="df-command-action"><p>Not sure where to begin?</p><Link to="/contact">Talk to customer support <ArrowRight size={16} /></Link></div>
                </div>
              </div>
            </div>
          })}
          <NavLink to="/digital-channels">Digital</NavLink><NavLink to="/stories">Updates</NavLink><NavLink to="/faqs">Support</NavLink><NavLink to="/contact">Contact</NavLink>
          <div className="nav-actions"><Link className="button button-secondary" to="/open-account">Open account</Link><Link className="button" to="/apply-loan">Apply now</Link></div>
        </nav>
        <div className="df-header-actions"><a href={contact.supportLines[0].href}><span>Customer care</span><strong>{contact.supportLines[0].display}</strong></a><Link className="button" to="/open-account">Open an Account</Link></div>
        <button className="menu-toggle" aria-expanded={mobileOpen} aria-controls="main-nav" onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X /> : <Menu />}<span>Menu</span></button>
      </div>
    </header>
  </>
}
