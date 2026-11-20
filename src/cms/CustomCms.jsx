import { useEffect, useState } from 'react'
import { PageMeta } from '../components/Shared'
import { models, departments, roles, emptyData, validateData } from './models'
import { CmsFields, CmsPreview, CmsImage } from './CmsFields'
import { cmsRequest, setCmsToken, getCmsAuth, hasCmsSession } from './client'
import { setCmsUnsaved } from './workspaceState'
import CmsCalculator from './CmsCalculator'
import CmsCalculatorFields from './CmsCalculatorFields'
import './cms.css'
import { importBundledContent } from './importContent'
import { CmsNavigation, CmsOverview, CmsWorkflowSteps, contentDescriptions, statusLabels } from './CmsNavigation'
import { ChevronLeft, ArrowRight, Download, FileText } from '../icons'

const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const fresh = (kind, member) => ({ id: '', title: '', slug: '', kind, department: member.role === 'admin' ? models[kind].department : member.department, version: 0, status: 'draft', data: emptyData(kind) })
export default function CustomCms() {
  const [config, setConfig] = useState(null), [member, setMember] = useState(null)
  const [credentials, setCredentials] = useState({ email: '', password: '' }), [mfa, setMfa] = useState(null), [code, setCode] = useState('')
  const [invite, setInvite] = useState(false), [password, setPassword] = useState('')
  const [records, setRecords] = useState([]), [assets, setAssets] = useState([]), [audit, setAudit] = useState([]), [staff, setStaff] = useState([])
  const [view, setView] = useState('overview'), [kind, setKind] = useState('news'), [query, setQuery] = useState(''), [status, setStatus] = useState('all')
  const [editing, setEditing] = useState(null), [history, setHistory] = useState([]), [note, setNote] = useState(''), [preview, setPreview] = useState(false), [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [staffForm, setStaffForm] = useState({ user_id: '', name: '', role: 'writer', department: departments[0], active: true })
  const [uploadDepartment, setUploadDepartment] = useState('Marketing/Sales')

  async function task(run) {
    setBusy(true); setError(''); setNotice('')
    try { return await run() } catch (err) { setError(err.message); return undefined } finally { setBusy(false) }
  }
  async function load(current = member) {
    const [items, media, events] = await Promise.all([cmsRequest('/entries'), cmsRequest('/media'), cmsRequest('/audit')])
    setRecords(items); setAssets(media); setAudit(events)
    if (current?.role === 'admin') setStaff(await cmsRequest('/staff'))
  }
  async function enter() {
    const current = await cmsRequest('/session')
    setMember(current); setView('overview'); setUploadDepartment(current.department); await load(current)
  }
  async function finishAuth(authConfig = config) {
    const auth = getCmsAuth(authConfig)
    const { data, error: sessionError } = await auth.auth.getSession()
    if (sessionError || !data.session) throw Error('Please sign in again.')
    setCmsToken(data.session.access_token)
    if (authConfig.requireMfa) {
      const { data: assurance, error: assuranceError } = await auth.auth.mfa.getAuthenticatorAssuranceLevel()
      if (assuranceError) throw assuranceError
      if (assurance.currentLevel !== 'aal2') {
        const { data: factors, error: factorError } = await auth.auth.mfa.listFactors()
        if (factorError) throw factorError
        const verified = factors.totp.find(item => item.status === 'verified')
        if (verified) setMfa({ id: verified.id })
        else {
          const { data: enrolled, error: enrollError } = await auth.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'RapidLink CMS' })
          if (enrollError) throw enrollError
          setMfa({ id: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret })
        }
        return
      }
    }
    setMfa(null); setCredentials({email: credentials.email, password: ""}); setPassword(""); setCode(""); await enter()
  }
  useEffect(() => {
    let active = true, subscription
    cmsRequest('/config').then(async value => {
      if (!active) return
      setConfig(value)
      if (value.demo) { if (hasCmsSession()) await enter(); return }
      const auth = getCmsAuth(value)
      subscription = auth.auth.onAuthStateChange((_event, session) => setCmsToken(session?.access_token)).data.subscription
      const hash = new URLSearchParams(window.location.hash.slice(1))
      if (['invite', 'recovery'].includes(hash.get('type')) && hash.get('access_token') && hash.get('refresh_token')) {
        historyReplace()
        const { error: sessionError } = await auth.auth.setSession({ access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token') })
        if (sessionError) throw sessionError
        if (active) setInvite(true)
      } else if (hasCmsSession()) {
        await finishAuth(value)
      }
    }).catch(err => { if (active) setError(err.message) })
    return () => { active = false; subscription?.unsubscribe() }
  }, [])
  useEffect(() => { setCmsUnsaved(dirty); return () => setCmsUnsaved(false) }, [dirty])
  function historyReplace() { window.history.replaceState({}, '', window.location.pathname + window.location.search) }
  function choose(record) {
    if (dirty && !window.confirm('Discard the unsaved changes before opening another record?')) return
    setEditing(structuredClone(record)); setDirty(false); setHistory([]); setNote(''); setPreview(false); setError('')
  }
  function navigate(nextView, nextKind) {
    if (dirty && !window.confirm('Discard unsaved changes?')) return false
    setView(nextView); if (nextKind) setKind(nextKind)
    setEditing(null); setDirty(false); setHistory([]); setQuery(''); setStatus('all'); setError(''); setNotice('')
    window.scrollTo({top:0, behavior:'instant'})
    return true
  }
  useEffect(() => { if (editing) document.getElementById('cms-editor-heading')?.focus() }, [editing?.id])
  async function exportContent() {
    await task(async () => {
      const exported = await cmsRequest('/export')
      const url = URL.createObjectURL(new Blob([JSON.stringify(exported, null, 2)], {type:'application/json'}))
      const link=document.createElement('a'); link.href=url; link.download='rapidlink-content-'+new Date().toISOString().slice(0,10)+'.json'; link.click(); URL.revokeObjectURL(url)
    })
  }
  function edit(change) { setEditing(current => ({ ...current, ...change })); setDirty(true) }
  async function save(event) {
    event.preventDefault()
    await task(async () => {
      validateData(editing.kind, editing.data)
      const updated = await cmsRequest('/entries', { method: 'POST', body: editing })
      setEditing(updated); setDirty(false); await load(); setNotice('Draft saved. The published version has not changed.')
    })
  }
  async function action(name) {
    if (dirty) { setError('Save your draft before changing its workflow status.'); return }
    await task(async () => {
      const updated = await cmsRequest(`/entries/${editing.id}/action`, { method: 'POST', body: { action: name, version: editing.version, note } })
      setEditing(updated); setHistory([]); await load(); setNotice(`${name === 'publish' ? 'Published public version updated' : name === 'unpublish' ? 'Public version withdrawn' : 'Workflow updated'}.`)
    })
  }
  async function signOut() {
    if (dirty && !window.confirm('Sign out and discard unsaved changes?')) return
    if (!config.demo) await getCmsAuth(config).auth.signOut()
    setCmsToken(''); setMember(null); setEditing(null); setRecords([]); setAssets([]); setStaff([]); setDirty(false); setError('')
  }
  const reviewer = ['admin', 'approver'].includes(member?.role)
  const visible = records.filter(record => record.kind === kind && (status === 'all' || record.status === status) && `${record.title} ${record.slug} ${record.department}`.toLowerCase().includes(query.toLowerCase()))

  return <div className="custom-cms"><PageMeta title="Public content management" description="Invitation-only RapidLink content management." noIndex />
    <header className="cms-top"><div><p className="eyebrow">RapidLink</p><h1>Content workspace</h1><p>Approved public information, managed with care.</p></div>{member && <div className="cms-profile"><strong>{member.name}</strong><span>{member.department} · {member.role}</span><button onClick={signOut}>Sign out</button></div>}</header>
    {config?.demo && <div className="cms-demo-banner">Local demonstration · public or synthetic test content only · no live website changes</div>}
    {error && <div className="cms-message is-error" role="alert">{error}</div>}{notice && <div className="cms-message" role="status">{notice}</div>}
    {!member ? <section className="cms-login"><h2>{invite ? 'Set your staff password' : mfa ? 'Verify your authenticator' : 'Staff sign-in'}</h2><p>Access is invitation-only. Your department and role are checked by the CMS service.</p>
      {!config && !error && <p role="status">Connecting to the CMS service…</p>}
      {config?.demo ? <div className="cms-demo-accounts">{config.demoStaff.map(account => <button disabled={busy} key={account.user_id} onClick={() => task(async () => { setCmsToken(`demo:${account.user_id}`); await enter() })}>{account.name}<small>{account.department}</small></button>)}</div> : config && <form onSubmit={event => { event.preventDefault(); task(async () => {
        const auth = getCmsAuth(config)
        if (invite) { const { error: updateError } = await auth.auth.updateUser({ password }); if (updateError) throw updateError; setInvite(false); await finishAuth() }
        else if (mfa) { const { error: verifyError } = await auth.auth.mfa.challengeAndVerify({ factorId: mfa.id, code }); if (verifyError) throw verifyError; await finishAuth() }
        else { const { error: loginError } = await auth.auth.signInWithPassword(credentials); if (loginError) throw loginError; await finishAuth() }
      }) }}>
        {invite ? <label>New password<input type="password" minLength={12} required value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" /></label> : mfa ? <>{mfa.qr && <><p>Scan this code with your authenticator app, then enter its six-digit code.</p><img className="cms-mfa-qr" src={mfa.qr} alt="Authenticator enrolment QR code" /><details><summary>Manual setup key</summary><code>{mfa.secret}</code></details></>}<label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value)} /></label></> : <><label>Staff email<input type="email" autoComplete="username" required value={credentials.email} onChange={event => setCredentials({ ...credentials, email: event.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={event => setCredentials({ ...credentials, password: event.target.value })} /></label></>}
        <button className="button" disabled={busy}>{busy ? 'Please wait…' : invite ? 'Set password' : mfa ? 'Verify' : 'Sign in'}</button>
      </form>}
    </section> : <div className="cms-layout"><CmsNavigation view={view} kind={kind} records={records} admin={member.role === 'admin'} navigate={navigate} />
      <section className={'cms-workspace ' + (view === 'overview' ? 'is-overview' : '')}>
        {view === 'overview' && <CmsOverview member={member} records={records} navigate={navigate} />}
        {view === 'calculator' && <CmsCalculator canEdit={member.role === 'admin' || ['Credit','Finance'].includes(member.department)} record={records.find(record=>record.kind==='calculator')} onEdit={()=>{ setKind('calculator');setView('content');choose(records.find(record=>record.kind==='calculator') || {...fresh('calculator',member),title:'Loan calculator settings',slug:'loan-calculator-settings'}); }} />}
        {view === 'tools' && member.role === 'admin' && <><div className="cms-section-head"><div><p className="eyebrow">Workspace tools</p><h2>Import &amp; export</h2><p>Bring existing content into your workspace or keep a portable copy.</p></div></div><div className="cms-tools-grid"><article><span className="cms-group-icon"><FileText /></span><h3>Import existing website content</h3><p>Add existing copy as drafts. Matching records are skipped, and nothing is published automatically.</p><button className="button" disabled={busy} onClick={() => task(async () => { const result=await importBundledContent(cmsRequest); await load(); setNotice(result.imported+' existing records imported as drafts; '+result.skipped+' existing records skipped. Nothing was published.'); })}>Import existing content as drafts</button></article><article><span className="cms-group-icon"><Download /></span><h3>Export your content</h3><p>Download records and revision information as a JSON file. A complete backup also needs the image files.</p><button disabled={busy} onClick={exportContent}>Export content</button></article></div></>}
        {view === 'content' && <>{!editing && <><div className="cms-section-head"><div><p className="eyebrow">Content library</p><h2>{models[kind].label}</h2><p>{contentDescriptions[kind]}</p></div><button className="button" disabled={busy} onClick={() => choose(fresh(kind, member))}>Create {models[kind].label.toLowerCase()}</button></div><div className="cms-filter"><label>Search records<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><label>Workflow status<select value={status} onChange={event => setStatus(event.target.value)}>{['all', 'draft', 'review', 'approved', 'published', 'archived'].map(value => <option key={value} value={value}>{statusLabels[value] || 'All statuses'}</option>)}</select></label><button onClick={() => task(() => load())}>Refresh</button></div>
          <div className="cms-records">{visible.length ? visible.map(record => <button key={record.id} onClick={() => choose(record)}><span><strong>{record.title}</strong><small>{record.department} · Version {record.version}</small></span><span className={`cms-badge status-${record.status}`}>{statusLabels[record.status]} <ArrowRight size={14} /></span></button>) : <p>No records here yet. Create a draft, or change your search and status filter.</p>}</div>
          </>}
          {editing && <form className="cms-editor" onSubmit={save}><button type="button" className="cms-back" onClick={() => navigate('content', kind)}><ChevronLeft size={17} />Back to {models[kind].label.toLowerCase()}</button><div className="cms-section-head"><div><p className="eyebrow">{models[kind].label}</p><h2 id="cms-editor-heading" tabIndex={-1}>{editing.id ? 'Edit record' : 'New record'}</h2></div><span className={`cms-badge status-${editing.status}`}>{statusLabels[editing.status]}{dirty ? ' · unsaved' : ''}</span></div><CmsWorkflowSteps status={editing.status} /><section className="cms-editor-block"><h3>Record details</h3><p>Give this item a clear title and choose its content owner.</p><div className="cms-editor-meta"><label>Title *<input value={editing.title} required maxLength={200} onChange={event => edit({ title: event.target.value, ...(!editing.id && (!editing.slug || editing.slug === slugify(editing.title)) ? { slug: slugify(event.target.value) } : {}) })} /></label><label>URL slug *<input value={editing.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} onChange={event => edit({ slug: event.target.value })} /></label><label>Content owner<select value={editing.department} disabled={Boolean(editing.id) || member.role !== 'admin'} onChange={event => edit({ department: event.target.value })}>{departments.map(value => <option key={value}>{value}</option>)}</select></label></div>
            </section><section className="cms-editor-block"><h3>Content</h3><p>{contentDescriptions[editing.kind]}</p>{editing.kind === 'calculator' ? <CmsCalculatorFields data={editing.data} onChange={data => edit({data})} disabled={busy} /> : <CmsFields fields={models[editing.kind].fields} data={editing.data} onChange={data => edit({ data })} disabled={busy} assets={assets} />}</section>
            <div className="cms-editor-actions cms-save-bar"><button className="button" disabled={busy}>Save draft</button><button type="button" onClick={() => setPreview(value => !value)}>Staff preview</button>{editing.id && <button type="button" onClick={() => task(async () => setHistory(await cmsRequest(`/entries/${editing.id}/history`)))}>Revision history</button>}</div>
            {editing.id && <div className="cms-workflow"><h3>Review and publish</h3><p>Saving edits creates a draft; the current public version stays unchanged. Another authorised person must approve before publication.</p><label>Review note<textarea value={note} maxLength={1000} onChange={event => setNote(event.target.value)} /></label><div className="cms-editor-actions">{editing.status === 'draft' && <button type="button" disabled={busy || dirty} onClick={() => action('submit')}>Submit for review</button>}{reviewer && editing.status === 'review' && <button type="button" disabled={busy || dirty} onClick={() => action('approve')}>Approve</button>}{reviewer && ['review', 'approved'].includes(editing.status) && <button type="button" disabled={busy || dirty} onClick={() => action('return')}>Return for changes</button>}{reviewer && editing.status === 'approved' && <button type="button" className="button" disabled={busy || dirty} onClick={() => action('publish')}>Publish approved version</button>}{reviewer && <><button type="button" disabled={busy || dirty} onClick={() => action('unpublish')}>Unpublish</button><button type="button" disabled={busy || dirty} onClick={() => action('archive')}>Archive</button></>}</div></div>}
            {preview && <CmsPreview entry={editing} />}
            {history.length > 0 && <section className="cms-history"><h3>Revision history</h3>{history.map(revision => <div key={revision.id}><strong>Version {revision.version} · {revision.action}</strong><small>{new Date(revision.created_at).toLocaleString()} · {revision.actor}</small>{revision.note && <p>{revision.note}</p>}<button type="button" disabled={busy || dirty} onClick={() => task(async () => { const updated = await cmsRequest(`/entries/${editing.id}/restore`, { method: 'POST', body: { revision: revision.version, version: editing.version } }); setEditing(updated); setDirty(false); await load(); setNotice('Revision restored as a new draft. Approval is required again.') })}>Restore as draft</button></div>)}</section>}
          </form>}
        </>}
        {view === 'media' && <><h2>Image library</h2><p>Public website images only. Uploads remain private until an approved record using them is published. PNG, JPEG or WebP; maximum 5 MB. Documents use approved download URLs.</p><label>Image owner<select value={uploadDepartment} disabled={member.role !== 'admin'} onChange={event => setUploadDepartment(event.target.value)}>{departments.map(value => <option key={value}>{value}</option>)}</select></label><label>Upload an image<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { const file = event.target.files[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { setError('Choose an image 5 MB or smaller.'); return } task(async () => { await cmsRequest('/media', { method: 'POST', body: file, headers: { 'Content-Type': file.type, 'X-CMS-Department': uploadDepartment, 'X-CMS-Label': encodeURIComponent(file.name) } }); await load(); setNotice('Image uploaded privately. Choose it in a content record to use it.') }) }} /></label><div className="cms-assets">{assets.map(asset => <article key={asset.id}><CmsImage value={`media:${asset.id}`} alt={asset.label} /><p>{asset.label}</p><small>{asset.department} · {Math.ceil(asset.bytes / 1024)} KB</small></article>)}</div></>}
        {view === 'audit' && <><h2>Activity log</h2><p>Application audit records are append-only. Database/server operators still require separate operational auditing.</p><div className="cms-audit">{audit.map(event => <article key={event.id}><strong>{event.action}</strong><p>{event.detail}</p><small>{new Date(event.created_at).toLocaleString()} · {event.actor}</small></article>)}</div></>}
        {view === 'staff' && member.role === 'admin' && <><h2>Staff access</h2><p>Invite the staff member through the approved Supabase dashboard with the return URL set to this CMS, then assign their user UUID here. Invitation alone does not grant CMS access.</p><form onSubmit={event => { event.preventDefault(); task(async () => { setStaff(await cmsRequest('/staff', { method: 'PUT', body: staffForm })); setNotice('Staff access updated.'); }) }} className="cms-staff-form"><label>Invited user UUID<input required value={staffForm.user_id} onChange={event => setStaffForm({ ...staffForm, user_id: event.target.value })} /></label><label>Staff name<input required value={staffForm.name} onChange={event => setStaffForm({ ...staffForm, name: event.target.value })} /></label><label>Department<select value={staffForm.department} onChange={event => setStaffForm({ ...staffForm, department: event.target.value })}>{departments.map(value => <option key={value}>{value}</option>)}</select></label><label>Role<select value={staffForm.role} onChange={event => setStaffForm({ ...staffForm, role: event.target.value })}>{roles.map(value => <option key={value}>{value}</option>)}</select></label><label className="cms-check"><input type="checkbox" checked={staffForm.active} onChange={event => setStaffForm({ ...staffForm, active: event.target.checked })} />Access active</label><button className="button" disabled={busy}>Save staff access</button></form><div className="cms-records">{staff.map(person => <button key={person.user_id} onClick={() => setStaffForm(person)}><span><strong>{person.name}</strong><small>{person.department} · {person.role}</small></span><span>{person.active ? 'Active' : 'Revoked'}</span></button>)}</div></>}
      </section>
    </div>}
  </div>
}
