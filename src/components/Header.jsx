import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, Menu, Phone, X } from '../icons'
import { getNavigation, getSiteInformation } from '../content/index.js'
import AnnouncementBar from './AnnouncementBar'

const navGroups = getNavigation()
const { contact } = getSiteInformation()
const groupCopy = {
  'Savings & Investments': ['Build your future', 'Accounts and investments for everyday goals and long-term plans.'],
  Loans: ['Finance the next step', 'Responsible credit options with clear product information.'],
  'About Us': ['Know your institution', 'Our story, governance and opportunities at RapidLink.'],
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState('')
  const hoverOpenedGroup = useRef('')
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setOpenGroup('')
  }, [location.pathname, location.hash])

  useEffect(() => {
    const close = event => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setOpenGroup('')
      }
      if (event.type === 'pointerdown' && (!(event.target instanceof Element) || !event.target.closest('.ct-nav-item'))) setOpenGroup('')
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [])

  const toggleGroup = label => {
    if (hoverOpenedGroup.current === label) {
      hoverOpenedGroup.current = ''
      setOpenGroup(label)
      return
    }
    setOpenGroup(current => current === label ? '' : label)
  }

  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <AnnouncementBar />
    <header className="site-header ct-header">
      <div className="mobile-header-utility"><div className="shell mobile-header-utility-inner" aria-label="Quick contact numbers">
        {contact.supportLines.map(line => <a href={line.href} key={line.id}><Phone size={16} /><span><small>{line.mobileLabel}</small><strong>{line.display}</strong></span></a>)}
      </div></div>
      <div className="ct-utility">
        <div className="shell ct-utility-inner">
          <p>Licensed financial services for Ghanaian individuals and businesses</p>
          <div>{contact.supportLines.map(line => <a href={line.href} key={line.id}><Phone size={14} />{line.label}: <strong>{line.display}</strong></a>)}</div>
        </div>
      </div>
      <div className="shell ct-brand-row">
        <Link to="/home" className="brand" aria-label="RapidLink home"><img src="/assets/rapidlink-logo-400.png" alt="RapidLink Microfinance Limited" /></Link>
        <div className="ct-brand-actions">
          <Link className="ct-plain-action" to="/contact">Talk to an adviser <ArrowRight size={16} /></Link>
          <Link className="button button-secondary" to="/open-account">Open an Account</Link>
          <Link className="button" to="/apply-loan">Apply for a loan</Link>
        </div>
        <button className="menu-toggle" aria-expanded={mobileOpen} aria-controls="main-nav" onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X /> : <Menu />}<span>Menu</span></button>
      </div>
      <div className="ct-navigation"><div className="shell">
        <nav id="main-nav" className={`main-nav ct-main-nav${mobileOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/home">Home</NavLink>
          {navGroups.map(group => {
            const isOpen = openGroup === group.label
            const [kicker, description] = groupCopy[group.label]
            const menuId = `ct-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            return <div className="nav-group ct-nav-item" key={group.label} onPointerEnter={event => { if (event.pointerType === 'mouse') { hoverOpenedGroup.current = group.label; setOpenGroup(group.label) } }} onPointerLeave={event => { if (event.pointerType === 'mouse') { hoverOpenedGroup.current = ''; setOpenGroup('') } }}>
              <button className="nav-group-trigger" type="button" aria-expanded={isOpen} aria-controls={menuId} onClick={() => toggleGroup(group.label)}>{group.label}<ChevronDown size={15} /></button>
              <div id={menuId} className={`nav-dropdown ct-mega-menu${isOpen ? ' is-open' : ''}`}>
                <div className="shell ct-mega-layout">
                  <div className="ct-mega-intro"><span>{kicker}</span><h2>{group.label}</h2><p>{description}</p></div>
                  <div className="ct-mega-links">{group.items.map(item => <NavLink key={item.href} to={item.href}><span>{item.label}</span><ArrowRight size={17} /></NavLink>)}</div>
                </div>
              </div>
            </div>
          })}
          <NavLink to="/digital-channels">Digital channels</NavLink>
          <NavLink to="/stories">News</NavLink>
          <NavLink to="/faqs">Help centre</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <div className="nav-actions"><Link className="button button-secondary" to="/open-account">Open account</Link><Link className="button" to="/apply-loan">Apply now</Link></div>
        </nav>
      </div></div>
    </header>
  </>
}
