import { useEffect, useId, useRef, useState } from 'react'
import { Briefcase, CircleAlert, Eye, EyeOff, FileText, Lock, Trash, X } from '../icons'
import { PageMeta } from '../components/Shared'
import {
  contentAdminConfigured,
  deleteNewsArticle,
  deleteVacancy,
  getManagedNews,
  getManagedVacancies,
  saveNewsArticle,
  saveVacancy,
  signInContentAdmin,
  signOutContentAdmin,
  uploadNewsImage,
} from '../services/careers'

const emptyVacancy = {
  id: '', title: '', department: '', location: '', employment_type: 'Full-time', summary: '',
  responsibilities: [''], status: 'open', is_published: false, application_email: 'info@rapidlinkfinance.com',
}

const emptyNews = () => ({
  id: '', slug: '', title: '', category: 'Company News', publishedAt: new Date().toISOString().slice(0, 10),
  summary: '', image: '/assets/', imageAlt: '', featured: false, is_published: false,
  externalLink: '', externalLabel: '', sections: [{ heading: '', paragraphs: [''] }], body: '',
})

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const sectionsToBody = sections => (sections || []).map(section => [
  section.heading ? `## ${section.heading}` : '',
  ...(section.paragraphs || []),
].filter(Boolean).join('\n\n')).join('\n\n')

const bodyToSections = body => {
  const sections = []
  let current = { heading: '', paragraphs: [] }
  body.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean).forEach(block => {
    if (block.startsWith('## ')) {
      if (current.heading || current.paragraphs.length) sections.push(current)
      current = { heading: block.slice(3).trim(), paragraphs: [] }
    } else {
      current.paragraphs.push(block.replace(/\s*\n\s*/g, ' '))
    }
  })
  if (current.heading || current.paragraphs.length) sections.push(current)
  return sections.length ? sections : [{ heading: '', paragraphs: [] }]
}

function ManagementHero({ eyebrow, title, intro, onSignOut }) {
  return <section className="page-hero has-image admin-content-hero">
    <div className="page-hero-media" aria-hidden="true"><img src="/assets/news-hero-v2.png" alt="" /></div>
    <div className="shell"><div className="admin-content-hero-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></div>{onSignOut && <button className="button admin-hero-signout" type="button" onClick={onSignOut}>Sign out</button>}</div>
  </section>
}

function ConfirmDialog({ open, tone = 'warning', title, message, confirmLabel, busy, onConfirm, onCancel }) {
  const titleId = useId()
  const messageId = useId()
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    const handleKeyDown = event => {
      if (event.key === 'Escape' && !busy) onCancel()
      if (event.key !== 'Tab') return
      const controls = [...document.querySelectorAll('.confirm-dialog button:not(:disabled)')]
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, busy, onCancel])

  if (!open) return null
  return <div className="confirm-modal" role="presentation" onMouseDown={event => event.target === event.currentTarget && !busy && onCancel()}>
    <section className={`confirm-dialog is-${tone}`} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId}>
      <button className="confirm-close" type="button" aria-label="Close confirmation" disabled={busy} onClick={onCancel}><X size={20} /></button>
      <div className="confirm-icon" aria-hidden="true">{tone === 'danger' ? <Trash size={26} /> : <CircleAlert size={26} />}</div>
      <p className="eyebrow">Please confirm</p>
      <h2 id={titleId}>{title}</h2>
      <p id={messageId}>{message}</p>
      <div className="confirm-actions"><button ref={cancelRef} className="button button-secondary" type="button" disabled={busy} onClick={onCancel}>Keep it</button><button className={`button ${tone === 'danger' ? 'button-danger-solid' : 'button-warning-solid'}`} type="button" disabled={busy} onClick={onConfirm}>{busy ? 'Please wait…' : confirmLabel}</button></div>
    </section>
  </div>
}

function Login({ onAuthenticated }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const session = await signInContentAdmin(credentials.email, credentials.password)
      onAuthenticated(session)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="section admin-access-section"><div className="shell admin-login panel">
    <div className="admin-login-icon"><Lock size={26} /></div>
    <p className="eyebrow">Restricted staff access</p>
    <h2>RapidLink Content Management</h2>
    <p>Only invited and authorised RapidLink staff accounts can enter this area.</p>
    <form onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="username" required value={credentials.email} onChange={event => setCredentials({ ...credentials, email: event.target.value })} /></label>
      <label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={credentials.password} onChange={event => setCredentials({ ...credentials, password: event.target.value })} /><button type="button" aria-label={showPassword ? 'Hide password' : 'View password'} aria-pressed={showPassword} onClick={() => setShowPassword(current => !current)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}<span>{showPassword ? 'Hide' : 'View'}</span></button></div></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
    </form>
  </div></section>
}

function VacancyWorkspace({ vacancies, setVacancies, token }) {
  const [editing, setEditing] = useState(emptyVacancy)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const edit = vacancy => setEditing({ ...vacancy, responsibilities: vacancy.responsibilities?.length ? vacancy.responsibilities : [''] })
  const updateResponsibility = (index, value) => setEditing({ ...editing, responsibilities: editing.responsibilities.map((item, itemIndex) => itemIndex === index ? value : item) })

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const saved = await saveVacancy(editing, token)
      setVacancies(current => editing.id ? current.map(item => item.id === editing.id ? saved : item) : [saved, ...current])
      setEditing(emptyVacancy)
      setMessage(`“${saved.title}” was saved successfully.`)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!editing.id || editing.is_local) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await deleteVacancy(editing.id, token)
      setVacancies(current => current.filter(item => item.id !== editing.id))
      setEditing(emptyVacancy)
      setMessage('The vacancy was deleted successfully.')
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
      setConfirmation(null)
    }
  }

  const unpublish = async () => {
    if (!editing.id || editing.is_local || !editing.is_published) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const saved = await saveVacancy({ ...editing, is_published: false }, token)
      setVacancies(current => current.map(item => item.id === editing.id ? saved : item))
      setEditing(saved)
      setMessage('The vacancy was removed from the public careers page and saved as a draft.')
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
      setConfirmation(null)
    }
  }

  return <><div className="admin-grid">
    <aside className="admin-vacancy-list"><div className="admin-list-heading"><h2>Positions</h2><button type="button" onClick={() => setEditing(emptyVacancy)}>New vacancy</button></div>
      {vacancies.length ? vacancies.map(vacancy => <button className={`admin-vacancy-item${editing.id === vacancy.id ? ' is-active' : ''}`} type="button" key={vacancy.id} onClick={() => edit(vacancy)}><Briefcase size={20} /><span><strong>{vacancy.title}</strong><small>{vacancy.is_local ? 'Website default' : `${vacancy.status === 'open' ? 'Open' : 'Closed'} · ${vacancy.is_published ? 'Published' : 'Draft'}`}</small></span></button>) : <p className="admin-empty-copy">No database vacancies yet.</p>}
    </aside>
    <form className="panel admin-editor vacancy-editor" onSubmit={submit}>
      <div className="admin-editor-heading"><div><p className="eyebrow">Careers</p><h2>{editing.is_local ? 'Import and edit vacancy' : editing.id ? 'Edit vacancy' : 'Create vacancy'}</h2></div><span className={`admin-state ${editing.is_published ? 'is-live' : ''}`}>{editing.is_local ? 'Website default' : editing.is_published ? 'Published' : 'Draft'}</span></div>
      <div className="form-grid">
        <label>Job title<input required value={editing.title} onChange={event => setEditing({ ...editing, title: event.target.value })} /></label>
        <label>Department<input required value={editing.department} onChange={event => setEditing({ ...editing, department: event.target.value })} /></label>
        <label>Location<input required value={editing.location} onChange={event => setEditing({ ...editing, location: event.target.value })} /></label>
        <label>Employment type<select value={editing.employment_type} onChange={event => setEditing({ ...editing, employment_type: event.target.value })}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label>
      </div>
      <label>Short description<textarea rows="4" required value={editing.summary} onChange={event => setEditing({ ...editing, summary: event.target.value })} /></label>
      <fieldset className="responsibility-editor"><legend>Responsibilities</legend>{editing.responsibilities.map((item, index) => <label key={index}>Responsibility {index + 1}<input required value={item} onChange={event => updateResponsibility(index, event.target.value)} /></label>)}<button className="text-button" type="button" onClick={() => setEditing({ ...editing, responsibilities: [...editing.responsibilities, ''] })}>+ Add responsibility</button></fieldset>
      <div className="form-grid">
        <label>Status<select value={editing.status} onChange={event => setEditing({ ...editing, status: event.target.value })}><option value="open">Open</option><option value="closed">Closed</option></select></label>
        <label>Application email<input type="email" required value={editing.application_email} onChange={event => setEditing({ ...editing, application_email: event.target.value })} /></label>
      </div>
      <label className="checkbox"><input type="checkbox" checked={editing.is_published} onChange={event => setEditing({ ...editing, is_published: event.target.checked })} />Publish this vacancy on the careers page</label>
      {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
      <div className="form-actions">{editing.id && !editing.is_local && <button className="button button-danger" type="button" disabled={busy} onClick={() => setConfirmation('delete')}><Trash size={18} /> Delete permanently</button>}{editing.id && !editing.is_local && editing.is_published && <button className="button button-unpublish" type="button" disabled={busy} onClick={() => setConfirmation('unpublish')}>Remove from website</button>}<button className="button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save vacancy'}</button></div>
    </form>
  </div><ConfirmDialog open={confirmation === 'delete'} tone="danger" title="Delete this vacancy permanently?" message={`“${editing.title}” will be removed from content management and cannot be recovered.`} confirmLabel="Delete vacancy" busy={busy} onConfirm={remove} onCancel={() => setConfirmation(null)} /><ConfirmDialog open={confirmation === 'unpublish'} title="Remove this vacancy from the website?" message={`“${editing.title}” will disappear from the careers page but remain available here as a draft.`} confirmLabel="Remove from website" busy={busy} onConfirm={unpublish} onCancel={() => setConfirmation(null)} /></>
}

function NewsWorkspace({ articles, setArticles, token }) {
  const [editing, setEditing] = useState(emptyNews)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const edit = article => setEditing({ ...article, body: sectionsToBody(article.sections) })
  const updateTitle = value => setEditing(current => ({ ...current, title: value, slug: current.id ? current.slug : slugify(value) }))

  const uploadImage = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImageBusy(true)
    setError('')
    setMessage('')
    try {
      const image = await uploadNewsImage(file, token)
      setEditing(current => ({ ...current, image }))
      setMessage('The image was uploaded and added to this story.')
    } catch (caught) {
      setError(caught.message)
    } finally {
      setImageBusy(false)
    }
  }

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const saved = await saveNewsArticle({ ...editing, sections: bodyToSections(editing.body) }, token)
      setArticles(current => editing.id ? current.map(item => item.id === editing.id ? saved : item) : [saved, ...current])
      setEditing(emptyNews())
      setMessage(`“${saved.title}” was saved successfully.`)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!editing.id || editing.is_local) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await deleteNewsArticle(editing.id, token)
      setArticles(current => current.filter(item => item.id !== editing.id))
      setEditing(emptyNews())
      setMessage('The story was deleted successfully.')
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
      setConfirmation(null)
    }
  }

  const unpublish = async () => {
    if (!editing.id || editing.is_local || !editing.is_published) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const saved = await saveNewsArticle({ ...editing, is_published: false, sections: bodyToSections(editing.body) }, token)
      setArticles(current => current.map(item => item.id === editing.id ? saved : item))
      setEditing({ ...saved, body: sectionsToBody(saved.sections) })
      setMessage('The story was removed from the public website and saved as a draft.')
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
      setConfirmation(null)
    }
  }

  return <><div className="admin-grid">
    <aside className="admin-vacancy-list"><div className="admin-list-heading"><h2>Stories</h2><button type="button" onClick={() => setEditing(emptyNews())}>New story</button></div>
      {articles.length ? articles.map(article => <button className={`admin-vacancy-item${editing.id === article.id ? ' is-active' : ''}`} type="button" key={article.id} onClick={() => edit(article)}><FileText size={20} /><span><strong>{article.title}</strong><small>{article.category} · {article.is_local ? 'Website default' : article.is_published ? 'Published' : 'Draft'}</small></span></button>) : <p className="admin-empty-copy">No database news yet.</p>}
    </aside>
    <form className="panel admin-editor news-editor" onSubmit={submit}>
      <div className="admin-editor-heading"><div><p className="eyebrow">Newsroom</p><h2>{editing.is_local ? 'Import and edit story' : editing.id ? 'Edit story' : 'Create story'}</h2></div><span className={`admin-state ${editing.is_published ? 'is-live' : ''}`}>{editing.is_local ? 'Website default' : editing.is_published ? 'Published' : 'Draft'}</span></div>
      <div className="form-grid">
        <label>Story title<input required value={editing.title} onChange={event => updateTitle(event.target.value)} /></label>
        <label>Page address / slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={editing.slug} onChange={event => setEditing({ ...editing, slug: slugify(event.target.value) })} /></label>
        <label>Category<input list="news-categories" required value={editing.category} onChange={event => setEditing({ ...editing, category: event.target.value })} /><datalist id="news-categories"><option>Company News</option><option>Customer Notices</option><option>Product News</option><option>Service Updates</option><option>Community</option></datalist></label>
        <label>Publication date<input type="date" required value={editing.publishedAt} onChange={event => setEditing({ ...editing, publishedAt: event.target.value })} /></label>
      </div>
      <label>Summary<textarea rows="3" required maxLength="320" value={editing.summary} onChange={event => setEditing({ ...editing, summary: event.target.value })} /><small>{editing.summary.length}/320 characters</small></label>
      <div className="form-grid">
        <label>Image path or approved URL<input required value={editing.image} onChange={event => setEditing({ ...editing, image: event.target.value })} placeholder="/assets/news-image.jpg" /></label>
        <label>Image description<input required value={editing.imageAlt} onChange={event => setEditing({ ...editing, imageAlt: event.target.value })} /></label>
      </div>
      <div className="news-image-uploader">
        <div>{editing.image && editing.image !== '/assets/' ? <img src={editing.image} alt="Selected story preview" /> : <FileText size={30} />}</div>
        <span><strong>Upload a news image</strong><small>JPG, PNG, WebP or AVIF. Maximum file size: 5 MB.</small></span>
        <label className={`button button-secondary${imageBusy ? ' is-disabled' : ''}`}>{imageBusy ? 'Uploading…' : 'Choose image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={imageBusy || busy} onChange={uploadImage} /></label>
      </div>
      <label>Article content<textarea className="news-body-editor" rows="15" required value={editing.body} onChange={event => setEditing({ ...editing, body: event.target.value })} placeholder={'Write the introduction here.\n\n## Optional section heading\n\nWrite the section paragraph here.'} /><small>Separate paragraphs with a blank line. Start section headings with ##.</small></label>
      <div className="form-grid">
        <label>Optional external link<input type="url" value={editing.externalLink} onChange={event => setEditing({ ...editing, externalLink: event.target.value })} placeholder="https://" /></label>
        <label>External-link label<input value={editing.externalLabel} onChange={event => setEditing({ ...editing, externalLabel: event.target.value })} placeholder="Visit the service" /></label>
      </div>
      <div className="admin-publish-options">
        <label className="checkbox"><input type="checkbox" checked={editing.featured} onChange={event => setEditing({ ...editing, featured: event.target.checked })} />Feature this story in the newsroom</label>
        <label className="checkbox"><input type="checkbox" checked={editing.is_published} onChange={event => setEditing({ ...editing, is_published: event.target.checked })} />Publish this story publicly</label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
      <div className="form-actions">{editing.id && !editing.is_local && <button className="button button-danger" type="button" disabled={busy || imageBusy} onClick={() => setConfirmation('delete')}><Trash size={18} /> Delete permanently</button>}{editing.id && !editing.is_local && editing.is_published && <button className="button button-unpublish" type="button" disabled={busy || imageBusy} onClick={() => setConfirmation('unpublish')}>Remove from website</button>}<button className="button" type="submit" disabled={busy || imageBusy}>{busy ? 'Saving…' : 'Save story'}</button></div>
    </form>
  </div><ConfirmDialog open={confirmation === 'delete'} tone="danger" title="Delete this story permanently?" message={`“${editing.title}” will be removed from content management and cannot be recovered.`} confirmLabel="Delete story" busy={busy} onConfirm={remove} onCancel={() => setConfirmation(null)} /><ConfirmDialog open={confirmation === 'unpublish'} title="Remove this story from the website?" message={`“${editing.title}” will disappear from the homepage and News page but remain available here as a draft.`} confirmLabel="Remove from website" busy={busy} onConfirm={unpublish} onCancel={() => setConfirmation(null)} /></>
}

export default function CareerManagement() {
  const [session, setSession] = useState(null)
  const [activeSection, setActiveSection] = useState('vacancies')
  const [vacancies, setVacancies] = useState([])
  const [articles, setArticles] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!session?.access_token) return
    Promise.all([getManagedVacancies(session.access_token), getManagedNews(session.access_token)])
      .then(([nextVacancies, nextArticles]) => { setVacancies(nextVacancies); setArticles(nextArticles) })
      .catch(caught => {
        setLoadError(caught.message)
        setSession(null)
      })
  }, [session])

  const logout = async () => {
    try { await signOutContentAdmin(session.access_token) } catch { /* Clear the local session even if the network is unavailable. */ }
    setSession(null)
  }

  if (!contentAdminConfigured) return <>
    <PageMeta title="Content management" description="Restricted RapidLink content management." noIndex />
    <ManagementHero eyebrow="Restricted access" title="Content management is securely locked" intro="Connect the approved staff authentication service before this private portal can be used." />
    <section className="section"><div className="shell narrow panel admin-setup-notice"><Lock size={30} /><h2>Secure by default</h2><p>The vacancy and news editors remain unavailable until Supabase credentials and database access policies are configured. No shared or front-end password fallback is provided.</p><ol><li>Create or select the approved Supabase project.</li><li>Run <code>supabase/careers.sql</code> in its SQL editor.</li><li>Invite approved staff and add their user IDs to <code>content_admins</code>.</li><li>Add the public project URL and anonymous key to the deployment environment.</li></ol></div></section>
  </>

  if (!session?.access_token) return <>
    <PageMeta title="Content management" description="Restricted RapidLink content management." noIndex />
    <ManagementHero eyebrow="Staff portal" title="Manage RapidLink content" intro="Invitation-only access for authorised staff responsible for news and career information." />
    <Login onAuthenticated={setSession} />
  </>

  return <>
    <PageMeta title="Content management" description="Restricted RapidLink content management." noIndex />
    <ManagementHero eyebrow="Private staff portal" title="Content management" intro="Prepare drafts and control what appears on the public website." onSignOut={logout} />
    <nav className="admin-section-nav" aria-label="Content management sections"><div className="shell">
      <button type="button" className={activeSection === 'vacancies' ? 'is-active' : ''} aria-pressed={activeSection === 'vacancies'} onClick={() => setActiveSection('vacancies')}><Briefcase size={20} /> Vacancies <span>{vacancies.length}</span></button>
      <button type="button" className={activeSection === 'news' ? 'is-active' : ''} aria-pressed={activeSection === 'news'} onClick={() => setActiveSection('news')}><FileText size={20} /> News <span>{articles.length}</span></button>
    </div></nav>
    <section className="section admin-workspace"><div className="shell">
      {loadError && <p className="form-error" role="alert">{loadError}</p>}
      {activeSection === 'vacancies'
        ? <VacancyWorkspace vacancies={vacancies} setVacancies={setVacancies} token={session.access_token} />
        : <NewsWorkspace articles={articles} setArticles={setArticles} token={session.access_token} />}
    </div></section>
  </>
}
