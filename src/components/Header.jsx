import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, Phone, X } from '../icons'
import { getNavigation } from '../content/index.js'
import AnnouncementBar from './AnnouncementBar'

const cx = (...values) => values.filter(Boolean).join(' ')

export default function Header() {
  const navGroups = getNavigation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState('')
  const hoverOpenedGroup = useRef('')
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setOpenGroup('')
  }, [location.pathname, location.hash])

  useEffect(() => {
    const close = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setOpenGroup('')
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])

  useEffect(() => {
    const closeDropdown = event => {
      if (!(event.target instanceof Element) || !event.target.closest('.nav-group')) setOpenGroup('')
    }
    document.addEventListener('pointerdown', closeDropdown)
    return () => document.removeEventListener('pointerdown', closeDropdown)
  }, [])

  const closeGroupAfterFocus = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpenGroup('')
  }

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

  const groupId = label => `header-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-menu`

  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <AnnouncementBar />
    <header className="site-header">
      <div className="mobile-header-utility">
        <div className="shell mobile-header-utility-inner" aria-label="Quick contact numbers">
          <a href="tel:+233303955183"><Phone size={16} /><span><small>Customer support</small><strong>030 395 5183</strong></span></a>
          <a href="tel:+233533730336"><Phone size={16} /><span><small>Controller / SME</small><strong>053 373 0336</strong></span></a>
        </div>
      </div>
      <div className="shell header-primary">
        <div className="header-left">
          <Link to="/home" className="brand" aria-label="RapidLink home"><img src="/assets/rapidlink-logo.png" alt="RapidLink Microfinance Limited" /></Link>
        </div>
        <div className="header-right">
          <div className="header-contacts" aria-label="Support contacts">
            <div><span>Customer support</span><a href="tel:+233303955183">030 395 5183</a></div>
            <div><span>Controller / SME loans</span><a href="tel:+233533730336">053 373 0336</a></div>
          </div>
          <div className="header-actions">
            <Link className="button button-secondary" to="/open-account">Open an Account</Link>
            <Link className="button" to="/apply-loan">Apply for a Loan</Link>
          </div>
        </div>
        <button className="menu-toggle" aria-expanded={mobileOpen} aria-controls="main-nav" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}<span>Menu</span></button>
      </div>
      <div className="nav-bar"><div className="shell nav-inner">
          <nav id="main-nav" className={cx('main-nav', mobileOpen && 'is-open')} aria-label="Main navigation">
            <NavLink to="/home">Home</NavLink>
            {navGroups.map(group => <div
              className="nav-group"
              key={group.label}
              onPointerEnter={event => event.pointerType === 'mouse' && openGroupFromHover(group.label)}
              onPointerLeave={event => event.pointerType === 'mouse' && closeGroupFromHover()}
              onBlurCapture={closeGroupAfterFocus}
            >
              <button
                className={cx('nav-group-trigger', group.items.some(({ href }) => location.pathname === href) && 'active')}
                type="button"
                aria-expanded={openGroup === group.label}
                aria-controls={groupId(group.label)}
                onClick={() => toggleGroup(group.label)}
              >
                <span>{group.label}</span>
                <ChevronDown size={16} />
              </button>
              <div id={groupId(group.label)} className={cx('nav-dropdown', openGroup === group.label && 'is-open')}>{group.items.map(({ label, href }) => <NavLink key={href} to={href}>{label}</NavLink>)}</div>
            </div>)}
            <NavLink to="/digital-channels">Digital Channels</NavLink>
            <NavLink to="/stories">News</NavLink>
            <NavLink to="/faqs">FAQs</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <div className="nav-actions"><Link className="button button-secondary" to="/open-account">Open an Account</Link><Link className="button" to="/apply-loan">Apply for a Loan</Link></div>
          </nav>
      </div></div>
    </header>
  </>
}
