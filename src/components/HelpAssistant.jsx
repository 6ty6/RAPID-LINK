import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Building2, ChevronLeft, Info, Landmark, Phone, X } from '../icons'
import './HelpAssistant.css'

const topics = [
  { id: 'about', title: 'Meet RapidLink', icon: Landmark, text: 'Learn about RapidLink Microfinance, our purpose and the services we offer.', links: [['About RapidLink', '/institutional-profile']] },
  { id: 'branches', title: 'Find a branch', icon: Building2, text: 'Find our Head Office at Asylum Down and our Madina branch, with directions and contact details.', links: [['Branch locations', '/contact#branch-map-title']] },
  { id: 'loans', title: 'Loans & applications', icon: Landmark, text: 'Explore our loan information and application guidance. Eligibility and approval are assessed by the loans team; this assistant cannot approve a loan.', links: [['Loan application guidance', '/apply-loan'], ['Controller loan information', '/deduct-at-source-loan']] },
  { id: 'account', title: 'Open an account', icon: Landmark, text: 'Online account opening is coming soon. Applications cannot be submitted through the website yet. Contact our team for help with your next steps.', links: [['Account-opening update', '/open-account'], ['Contact our team', '/contact']] },
  { id: 'contact', title: 'Speak to our team', icon: Phone, text: 'For assistance, call 030 395 5183 or email info@rapidlinkfinance.com. Please do not send passwords, PINs or one-time codes.', links: [['Call RapidLink', 'tel:+233303955183'], ['Email our team', 'mailto:info@rapidlinkfinance.com']] },
  { id: 'faqs', title: 'Common questions', icon: Info, text: 'Browse our frequently asked questions for public information about products and services.', links: [['Read the FAQs', '/faqs']] },
]

function Character({ mood }) {
  const pose = ['excited', 'attentive', 'wave'].includes(mood) ? 'happy' : ['sulking', 'sulky'].includes(mood) ? 'sulky' : ['settling', 'resting'].includes(mood) ? 'resting' : 'playing'
  const [visiblePose, setVisiblePose] = useState(pose)
  const [previousPose, setPreviousPose] = useState(null)
  const lastPose = useRef(pose)
  useEffect(() => {
    if (lastPose.current === pose) return undefined
    setPreviousPose(lastPose.current)
    setVisiblePose(pose)
    lastPose.current = pose
    const timer = window.setTimeout(() => setPreviousPose(null), 650)
    return () => window.clearTimeout(timer)
  }, [pose])
  return <span className={`help-character pose-${mood}`} aria-hidden="true"><span className="character-body">
    <span key={visiblePose} className={`abena-sprite sprite-${visiblePose} ${previousPose ? 'is-arriving' : ''}`} />
    {previousPose && <span key={`previous-${previousPose}`} className={`abena-sprite sprite-${previousPose} is-departing`} />}
  </span><span className="abena-play-spark spark-one" /><span className="abena-play-spark spark-two" /></span>
}

export default function HelpAssistant() {
  const { pathname, hash } = useLocation()
  const staffPage = ['/content-management', '/career-management', '/accept-invite'].includes(pathname.replace(/\/$/, ''))
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('rapidlink-help-hidden') === '1' } catch { return false } })
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState(null)
  const [mood, setMood] = useState('peek')
  const launcher = useRef(null)
  const closeButton = useRef(null)
  const answerBack = useRef(null)
  const firstTopic = useRef(null)
  const assistantArea = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (hidden || staffPage) return undefined
    const next = { peek: ['playing', 1800], playing: ['sulking', 24000], sulking: ['sulky', 800], sulky: ['settling', 4500], settling: ['resting', 900], excited: ['attentive', 1100], wave: ['playing', 1300] }[mood]
    if (!next || (open && mood !== 'excited')) return undefined
    const timer = window.setTimeout(() => setMood(next[0]), next[1])
    return () => window.clearTimeout(timer)
  }, [mood, open, hidden, staffPage])

  useEffect(() => { setOpen(false); setTopic(null) }, [pathname, hash])
  useEffect(() => {
    if (!open) return
    if (topic) answerBack.current?.focus()
    else firstTopic.current?.focus()
  }, [topic])
  useEffect(() => {
    if (!open) return undefined
    closeButton.current?.focus()
    const escape = event => { if (event.key === 'Escape') { setOpen(false); setTopic(null); setMood('wave'); launcher.current?.focus() } }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])
  useEffect(() => {
    if (!open) return undefined
    const outside = event => {
      if (assistantArea.current?.contains(event.target)) return
      setOpen(false); setTopic(null); setMood('wave')
      // Keep focus on the outside control the visitor selected.
    }
    document.addEventListener('pointerdown', outside, true)
    return () => document.removeEventListener('pointerdown', outside, true)
  }, [open])

  function close() { setOpen(false); setTopic(null); setMood('wave'); launcher.current?.focus() }
  function hide() {
    close(); setHidden(true)
    try { sessionStorage.setItem('rapidlink-help-hidden', '1') } catch { /* Preference only. */ }
    window.requestAnimationFrame(() => document.querySelector('.help-restore')?.focus())
  }
  function restore() {
    setHidden(false); setMood('peek')
    try { sessionStorage.removeItem('rapidlink-help-hidden') } catch { /* Preference only. */ }
  }

  if (staffPage) return null
  if (hidden) return <button className="help-restore" onClick={restore} aria-label="Show Abena">Help</button>

  return <aside ref={assistantArea} className="rapidlink-help" aria-label="Abena assistant">
    {open && <section id={panelId} className="help-panel" role="dialog" aria-modal="false" aria-labelledby={`${panelId}-title`}>
      <header className="help-panel-header"><div><span>YOUR RAPIDLINK GUIDE</span><h2 id={`${panelId}-title`}>Abena</h2></div><button ref={closeButton} className="help-icon-button" onClick={close} aria-label="Close Abena"><X size={20} /></button></header>
      <div className="help-panel-body">
        <p className="help-greeting">Hi there. Let’s find your next step.</p>
        <p className="help-description">Choose a topic for public information. This is an automated menu, not a live agent.</p>
        {!topic ? <div className="help-topics">{topics.map((item, index) => { const Icon = item.icon; return <button ref={index === 0 ? firstTopic : undefined} key={item.id} onClick={() => setTopic(item)}><Icon size={18} /><span>{item.title}</span><span aria-hidden="true">›</span></button> })}</div> : <div className="help-answer" aria-live="polite"><button ref={answerBack} className="help-back" onClick={() => setTopic(null)}><ChevronLeft size={16} />All topics</button><h3>{topic.title}</h3><p>{topic.text}</p><div className="help-answer-links">{topic.links.map(([label, href]) => href.startsWith('/') ? <Link key={href} to={href}>{label}</Link> : <a key={href} href={href}>{label}</a>)}</div></div>}
      </div>
      <footer className="help-panel-footer">Keep passwords, PINs and personal documents private.</footer>
    </section>}
    <div className="help-character-dock">
      {!open && <button className="help-dismiss" onClick={hide} aria-label="Hide Abena"><X size={14} /></button>}
      <button ref={launcher} className="help-launcher" onClick={() => { if (open) close(); else { setMood('excited'); setOpen(true) } }} aria-label={open ? 'Close Abena' : 'Open Abena'} aria-expanded={open} aria-controls={open ? panelId : undefined}>
        <span className="help-character-label">{open ? 'Happy to help!' : mood === 'resting' ? 'Here if you need me' : 'Need a hand?'}</span>
        <Character mood={mood} />
        <span className="help-launcher-caption">Abena</span>
      </button>
    </div>
  </aside>
}
