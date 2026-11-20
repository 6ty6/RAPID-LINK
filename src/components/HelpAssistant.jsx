import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, X } from '../icons'
import './HelpAssistant.css'
import { usePublicCms } from '../cms/public'
import { getManagedHelpReply, managedContacts } from '../cms/abenaReplies'

const suggestions = [
  ['Find a branch', 'Where are your branches?'],
  ['Loans & applications', 'Tell me about your loans'],
  ['Open an account', 'How can I open an account?'],
  ['Meet RapidLink', 'Tell me about RapidLink'],
  ['Common questions', 'Show me your FAQs'],
  ['Speak to our team', 'I would like to speak to someone'],
]
const welcome = { id: 'welcome', role: 'assistant', text: "Hello, I'm Abena. A warm welcome to RapidLink! How may I help you today?", links: [] }

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
  const cms = usePublicCms()
  const contacts = managedContacts(cms.enabled ? cms.records : [])
  const { pathname, hash } = useLocation()
  const staffPage = ['/cms', '/content-management', '/career-management', '/accept-invite'].includes(pathname.replace(/\/$/, ''))
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('rapidlink-help-hidden') === '1' } catch { return false } })
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState('peek')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([welcome])
  const [pending, setPending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const questionInput = useRef(null)
  const launcher = useRef(null)
  const closeButton = useRef(null)
  const assistantArea = useRef(null)
  const transcript = useRef(null)
  const replyTimer = useRef(null)
  const pendingLock = useRef(false)
  const lastTopic = useRef('')
  const turn = useRef(0)
  const sequence = useRef(0)
  const followBottom = useRef(true)
  const panelId = useId()

  useEffect(() => {
    if (hidden || staffPage) return undefined
    const next = { peek: ['playing', 1800], playing: ['sulking', 24000], sulking: ['sulky', 800], sulky: ['settling', 4500], settling: ['resting', 900], excited: ['attentive', 1100], wave: ['playing', 1300] }[mood]
    if (!next || (open && mood !== 'excited')) return undefined
    const timer = window.setTimeout(() => setMood(next[0]), next[1])
    return () => window.clearTimeout(timer)
  }, [mood, open, hidden, staffPage])

  useEffect(() => { setOpen(false) }, [pathname, hash])
  useEffect(() => {
    if (!staffPage) return
    window.clearTimeout(replyTimer.current)
    pendingLock.current = false
    setPending(false); setMessages([welcome]); setQuestion(''); lastTopic.current = ''
  }, [staffPage])
  useEffect(() => () => window.clearTimeout(replyTimer.current), [])
  useEffect(() => {
    if (!open) return undefined
    closeButton.current?.focus()
    const escape = event => { if (event.key === 'Escape') { setOpen(false); setMood('wave'); launcher.current?.focus() } }
    const outside = event => { if (!assistantArea.current?.contains(event.target)) { setOpen(false); setMood('wave') } }
    document.addEventListener('keydown', escape)
    document.addEventListener('pointerdown', outside, true)
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside, true) }
  }, [open])
  useEffect(() => {
    if (!open || pending) return undefined
    if ((messages.length === 1 || messages.at(-1)?.intent === 'help') && !question) { setShowSuggestions(true); return undefined }
    setShowSuggestions(false)
    const timer = window.setTimeout(() => setShowSuggestions(true), 12000)
    return () => window.clearTimeout(timer)
  }, [question, pending, open, messages.length])
  useEffect(() => {
    if (open && followBottom.current && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight
  }, [messages, pending, open])

  function close() { setOpen(false); setMood('wave'); launcher.current?.focus() }
  function hide() {
    close(); setHidden(true)
    try { sessionStorage.setItem('rapidlink-help-hidden', '1') } catch { /* Preference only. */ }
    window.requestAnimationFrame(() => document.querySelector('.help-restore')?.focus())
  }
  function restore() {
    setHidden(false); setMood('peek')
    try { sessionStorage.removeItem('rapidlink-help-hidden') } catch { /* Preference only. */ }
  }
  function send(text) {
    const value = text.trim()
    if (!value || value.length > 300 || pendingLock.current) return
    const reply = getManagedHelpReply(value, cms, { lastTopic: lastTopic.current, turn: turn.current++ })
    if (!['help', 'greeting', 'thanks', 'unavailable', 'privacy', 'identity', 'goodbye'].includes(reply.id)) lastTopic.current = reply.id
    if (['unavailable', 'privacy'].includes(reply.id)) lastTopic.current = 'contact'
    const messageId = ++sequence.current
    pendingLock.current = true
    followBottom.current = true
    setMessages(current => [...current.slice(-39), { id: 'user-' + messageId, role: 'user', text: reply.id === 'privacy' ? 'A question about private account information' : value }])
    setQuestion(''); setShowSuggestions(false); setPending(true); setMood('attentive')
    questionInput.current?.focus()
    // A presentation delay for prepared replies, not an AI or network request.
    replyTimer.current = window.setTimeout(() => {
      setMessages(current => [...current.slice(-39), { ...reply, intent: reply.id, id: 'reply-' + messageId, role: 'assistant' }])
      setPending(false); pendingLock.current = false; setMood('excited')
    }, 1500 + Math.min(value.length * 8, 600))
  }
  function newChat() {
    window.clearTimeout(replyTimer.current); pendingLock.current = false
    setPending(false); setMessages([welcome]); setQuestion(''); setShowSuggestions(true)
    lastTopic.current = ''; turn.current = 0; followBottom.current = true
    questionInput.current?.focus()
  }

  if (staffPage) return null
  if (hidden) return <button className="help-restore" onClick={restore} aria-label="Show Abena">Help</button>

  return <aside ref={assistantArea} className="rapidlink-help" aria-label="Abena assistant">
    {open && <section id={panelId} className="help-panel help-messenger" role="dialog" aria-modal="false" aria-labelledby={panelId + '-title'}>
      <header className="help-panel-header">
        <span className="help-profile" aria-hidden="true"><span className="abena-sprite sprite-playing" /></span>
        <div className="help-header-copy"><h2 id={panelId + '-title'}>Abena</h2><p>RapidLink's automated guide</p></div>
        <button ref={closeButton} className="help-icon-button" onClick={close} aria-label="Close Abena"><X size={20} /></button>
      </header>
      <div ref={transcript} className="help-panel-body help-conversation" onScroll={event => { const el = event.currentTarget; followBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90 }}>
        <p className="help-chat-notice">Prepared answers, with a friendly touch. Please keep personal and account details private.</p>
        <div className="help-message-log" role="log" aria-label="Conversation with Abena" aria-live="polite" aria-relevant="additions">
          {messages.map(message => <div key={message.id} className={'help-message-row message-' + message.role}>
            {message.role === 'assistant' && <span className="help-message-avatar" aria-hidden="true"><span className="abena-sprite sprite-playing" /></span>}
            <div className="help-message-bubble"><span className="visually-hidden">{message.role === 'assistant' ? 'Abena says: ' : 'You said: '}</span><p>{message.text}</p>
              {message.links?.length > 0 && <div className="help-message-links">{message.links.map(([label, href]) => href.startsWith('/') ? <Link key={href} to={href}>{label}</Link> : <a key={href} href={href} target={href.startsWith('https:') ? '_blank' : undefined} rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}>{label}</a>)}</div>}
            </div>
          </div>)}
        </div>
        {pending && <div className="help-thinking" role="status"><Character mood="attentive" /><span className="help-thought-bubble" aria-hidden="true"><i /><i /><i /></span><span className="visually-hidden">Abena is preparing a reply</span></div>}
        {showSuggestions && !pending && <div className="help-suggestions" role="group" aria-label="Suggested questions"><span>How can I help?</span><div>{suggestions.map(([label, text]) => <button key={label} onClick={() => send(text)}>{label}</button>)}</div></div>}
      </div>
      <div className="help-composer-area">
        <form className="help-question-form" onSubmit={event => { event.preventDefault(); send(question) }}>
          <label className="visually-hidden" htmlFor={panelId + '-question'}>Message Abena</label>
          <div><input ref={questionInput} id={panelId + '-question'} value={question} onChange={event => { setQuestion(event.target.value); setShowSuggestions(false); setMood('attentive') }} maxLength={300} autoComplete="off" placeholder="Type your message..." /><button type="submit" disabled={!question.trim() || pending}>Send</button></div>
        </form>
        <div className="help-chat-tools"><span>Replies stay on this page</span><button onClick={newChat}>New chat</button></div>
      </div>
      <footer className="help-panel-footer"><div className="help-support-links"><a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp chatbot</a><a href={contacts.phone}><Phone size={13} />Speak to our team</a></div></footer>
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
