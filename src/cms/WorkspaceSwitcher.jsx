import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { customCmsEnabled } from './public'
import { canLeaveCms } from './workspaceState'
import './workspace-switcher.css'

export default function WorkspaceSwitcher() {
  const { pathname, search, hash } = useLocation()
  const staff = pathname.replace(/\/$/, '') === '/cms'
  const lastPage = useRef('/')
  if (!staff && !['/accept-invite', '/content-management', '/career-management'].includes(pathname)) lastPage.current = pathname + search + hash
  if (!customCmsEnabled) return null
  return <nav className="workspace-switcher" aria-label="Test workspace">
    <span><strong>RapidLink workspace</strong><small>Integration preview</small></span>
    <div><Link to={lastPage.current} aria-current={!staff ? 'page' : undefined} onClick={event => { if (staff && !canLeaveCms()) event.preventDefault() }}>View website</Link><Link to="/cms" aria-current={staff ? 'page' : undefined}>Manage content</Link></div>
  </nav>
}
