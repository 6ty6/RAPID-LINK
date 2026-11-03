import { useEffect, useState } from 'react'
import { Briefcase, Lock } from '../icons'
import { PageHero, PageMeta } from '../components/Shared'
import { careersAdminConfigured, getManagedVacancies, saveVacancy, signInCareerAdmin, signOutCareerAdmin } from '../services/careers'

const emptyVacancy = {
  id: '', title: '', department: '', location: '', employment_type: 'Full-time', summary: '',
  responsibilities: [''], status: 'open', is_published: false, application_email: 'info@rapidlinkfinance.com',
}

function Login({ onAuthenticated }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const session = await signInCareerAdmin(credentials.email, credentials.password)
      sessionStorage.setItem('rapidlink-careers-session', JSON.stringify(session))
      onAuthenticated(session)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="section admin-access-section"><div className="shell admin-login panel">
    <div className="admin-login-icon"><Lock size={26} /></div>
    <p className="eyebrow">Restricted access</p>
    <h2>Vacancy management</h2>
    <p>Only invited RapidLink staff accounts can access this area.</p>
    <form onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="username" required value={credentials.email} onChange={event => setCredentials({ ...credentials, email: event.target.value })} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={event => setCredentials({ ...credentials, password: event.target.value })} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
    </form>
  </div>
  </section>
}

export default function CareerManagement() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('rapidlink-careers-session')) } catch { return null }
  })
  const [vacancies, setVacancies] = useState([])
  const [editing, setEditing] = useState(emptyVacancy)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!session?.access_token) return
    getManagedVacancies(session.access_token).then(setVacancies).catch(caught => {
      setError(caught.message)
      sessionStorage.removeItem('rapidlink-careers-session')
      setSession(null)
    })
  }, [session])

  const edit = vacancy => setEditing({ ...vacancy, responsibilities: vacancy.responsibilities?.length ? vacancy.responsibilities : [''] })
  const updateResponsibility = (index, value) => setEditing({ ...editing, responsibilities: editing.responsibilities.map((item, itemIndex) => itemIndex === index ? value : item) })

  const submit = async event => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const saved = await saveVacancy(editing, session.access_token)
      setVacancies(current => editing.id ? current.map(item => item.id === saved.id ? saved : item) : [saved, ...current])
      setEditing(emptyVacancy)
      setMessage(`“${saved.title}” was saved successfully.`)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    try { await signOutCareerAdmin(session.access_token) } catch { /* Clear the local session even if the network is unavailable. */ }
    sessionStorage.removeItem('rapidlink-careers-session')
    setSession(null)
  }

  if (!careersAdminConfigured) return <>
    <PageMeta title="Vacancy management" description="Restricted RapidLink vacancy management." />
    <PageHero eyebrow="Restricted access" title="Vacancy management is not configured" intro="Connect the approved staff authentication service before this portal can be used." />
    <section className="section"><div className="shell narrow panel"><h2>Secure by default</h2><p>The editor remains unavailable until Supabase credentials and database access policies are configured. No front-end password fallback is provided.</p></div></section>
  </>

  if (!session?.access_token) return <><PageMeta title="Vacancy management" description="Restricted RapidLink vacancy management." /><PageHero eyebrow="Staff portal" title="Manage career opportunities" intro="Invitation-only access for authorised RapidLink staff." /><Login onAuthenticated={setSession} /></>

  return <>
    <PageMeta title="Vacancy management" description="Restricted RapidLink vacancy management." />
    <section className="admin-heading"><div className="shell"><div><p className="eyebrow">Staff portal</p><h1>Manage vacancies</h1></div><button className="button button-secondary" type="button" onClick={logout}>Sign out</button></div></section>
    <section className="section admin-workspace"><div className="shell admin-grid">
      <aside className="admin-vacancy-list"><div className="admin-list-heading"><h2>Positions</h2><button type="button" onClick={() => setEditing(emptyVacancy)}>New vacancy</button></div>
        {vacancies.length ? vacancies.map(vacancy => <button className={`admin-vacancy-item${editing.id === vacancy.id ? ' is-active' : ''}`} type="button" key={vacancy.id} onClick={() => edit(vacancy)}><Briefcase size={20} /><span><strong>{vacancy.title}</strong><small>{vacancy.status === 'open' ? 'Open' : 'Closed'} · {vacancy.is_published ? 'Published' : 'Draft'}</small></span></button>) : <p>No database vacancies yet.</p>}
      </aside>
      <form className="panel vacancy-editor" onSubmit={submit}>
        <h2>{editing.id ? 'Edit vacancy' : 'Create vacancy'}</h2>
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
        <div className="form-actions"><button className="button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save vacancy'}</button></div>
      </form>
    </div></section>
  </>
}
