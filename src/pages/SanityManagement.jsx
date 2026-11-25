import { config } from '../config.js'
import { PageMeta } from '../components/Shared.jsx'
export default function SanityManagement() {
  return <>
    <PageMeta title="Content management" description="Authorised staff access to RapidLink Sanity Studio." noIndex />
    <section className="section"><div className="shell narrow panel">
      <p className="eyebrow">Staff workspace</p><h1>RapidLink Content Studio</h1>
      <p>Manage public website content in Sanity. Sign in using your authorised Sanity account.</p>
      <a className="button" href={config.sanityStudioUrl} target="_blank" rel="noopener noreferrer">Open Sanity Studio</a>
      {/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(config.sanityStudioUrl) && <p>Studio currently runs on your computer. Start it with <code>npm run cms:dev</code>, then open the link above.</p>}
    </div></section>
  </>
}
