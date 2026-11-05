import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Eye, EyeOff, Lock } from '../icons'
import { PageMeta } from '../components/Shared'
import {
  contentAdminConfigured,
  resolveContentInvite,
  setInvitedUserPassword,
  signOutContentAdmin,
} from '../services/careers'

function readInviteDetails() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return {
    accessToken: hash.get('access_token') || query.get('access_token'),
    tokenHash: query.get('token_hash') || hash.get('token_hash'),
    type: query.get('type') || hash.get('type') || 'invite',
    error: hash.get('error_description') || query.get('error_description'),
  }
}

export default function AcceptInvite() {
  const [inviteDetails] = useState(readInviteDetails)
  const [token, setToken] = useState('')
  const [passwords, setPasswords] = useState({ password: '', confirmation: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [authorised, setAuthorised] = useState(false)
  const resolutionStarted = useRef(false)

  useEffect(() => {
    if (resolutionStarted.current) return
    resolutionStarted.current = true
    window.history.replaceState({}, document.title, window.location.pathname)

    if (!contentAdminConfigured) {
      setError('The staff authentication service is not configured on this deployment.')
      setChecking(false)
      return
    }
    if (inviteDetails.error) {
      setError(inviteDetails.error)
      setChecking(false)
      return
    }

    resolveContentInvite(inviteDetails)
      .then(session => {
        if (!session?.access_token) throw new Error('The invitation could not establish a secure session.')
        setToken(session.access_token)
      })
      .catch(caught => setError(caught.message))
      .finally(() => setChecking(false))
  }, [inviteDetails])

  const submit = async event => {
    event.preventDefault()
    setError('')
    if (passwords.password.length < 8) {
      setError('Use a password containing at least 8 characters.')
      return
    }
    if (passwords.password !== passwords.confirmation) {
      setError('The two passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const hasAccess = await setInvitedUserPassword(passwords.password, token)
      setAuthorised(Boolean(hasAccess))
      setComplete(true)
      try { await signOutContentAdmin(token) } catch { /* The password was still created successfully. */ }
      setToken('')
      setPasswords({ password: '', confirmation: '' })
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  return <>
    <PageMeta title="Accept staff invitation" description="Secure invitation setup for authorised RapidLink content staff." noIndex />
    <section className="page-hero has-image invite-hero">
      <div className="page-hero-media" aria-hidden="true"><img src="/assets/news-hero-v2.png" alt="" /></div>
      <div className="shell narrow"><p className="eyebrow">Secure staff invitation</p><h1>Create your portal password</h1><p>Complete your invitation to access RapidLink news and vacancy management.</p></div>
    </section>
    <section className="section invite-section"><div className="shell narrow">
      {checking ? <div className="panel invite-card" role="status"><div className="pdf-spinner" /><h2>Checking your invitation</h2><p>Please wait while the secure invitation is verified.</p></div>
        : complete ? <div className="panel invite-card invite-complete"><span><Check size={30} /></span><p className="eyebrow">Password created</p><h2>Your staff password is ready</h2><p>{authorised ? 'Your account is authorised. Sign in with your email address and the password you just created.' : 'Your password was created, but an administrator must add your user ID to the content_admins table before you can enter the portal.'}</p><Link className="button" to="/content-management">Go to staff sign in</Link></div>
          : token ? <div className="panel invite-card"><div className="admin-login-icon"><Lock size={27} /></div><p className="eyebrow">Invitation verified</p><h2>Choose a secure password</h2><p>Use at least eight characters and keep this password private.</p><form onSubmit={submit}>
            <label>New password<div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength="8" required value={passwords.password} onChange={event => setPasswords({ ...passwords, password: event.target.value })} /><button type="button" aria-label={showPassword ? 'Hide password' : 'View password'} aria-pressed={showPassword} onClick={() => setShowPassword(current => !current)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}<span>{showPassword ? 'Hide' : 'View'}</span></button></div></label>
            <label>Confirm new password<input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength="8" required value={passwords.confirmation} onChange={event => setPasswords({ ...passwords, confirmation: event.target.value })} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button" type="submit" disabled={busy}>{busy ? 'Creating password…' : 'Create password'}</button>
          </form></div>
            : <div className="panel invite-card invite-error"><div className="admin-login-icon"><Lock size={27} /></div><p className="eyebrow">Invitation unavailable</p><h2>This link cannot be used</h2><p>{error || 'The invitation may have expired or already been accepted. Ask a RapidLink administrator to send a new invitation.'}</p><Link className="button button-secondary" to="/content-management">Return to staff sign in</Link></div>}
    </div></section>
  </>
}
