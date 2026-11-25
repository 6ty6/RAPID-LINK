import { Link, useSearchParams } from 'react-router-dom'
import AccountApplicationForm from './AccountApplicationForm'
import { Building2, Landmark, Mail, Phone } from '../icons'
import { PageMeta } from '../components/Shared'
import usePageContent from '../hooks/usePageContent.js'
import useSiteInformation from '../hooks/useSiteInformation.js'

export default function OpenAccount() {
  const [searchParams] = useSearchParams()
  const {data:page}=usePageContent('account')
  const copy=page.content
  const {contact}=useSiteInformation()
  if (searchParams.get('preview') === 'true') return <><PageMeta title="Account application test" description="Test form. Submissions are disabled." noIndex /><AccountApplicationForm /></>
  return <>
    <PageMeta {...page.meta} />
    <section className="account-coming" aria-labelledby="account-coming-title">
      <div className="shell">
        <div className="account-coming-card">
          <div className="account-coming-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <span className="account-coming-badge">{copy.status}</span>
            <h1 id="account-coming-title">{copy.titleFirst}<br /><span>{copy.titleSecond}</span></h1>
            <h2>{copy.subtitle}</h2><p>{copy.description}</p><p>{copy.followUp}</p>
            <div className="button-row"><Link className="button" to="/contact">{copy.contactLabel}</Link><Link className="button button-secondary" to="/contact#branch-map-title"><Building2 size={18} /> {copy.branchLabel}</Link></div>
          </div>
          <div className="account-coming-art" aria-hidden="true">
            <div className="account-coming-orbit"><div className="account-coming-emblem"><Landmark size={84} /></div></div>
            <div className="account-coming-art-copy"><span>RAPIDLINK</span><p>{copy.artTitleFirst}<br />{copy.artTitleSecond}</p></div>
          </div>
        </div>
        <div className="account-coming-support">
          <p>{copy.supportPrompt}</p>
          {contact.supportLines[0]&&<a href={contact.supportLines[0].href}><Phone size={18} />{contact.supportLines[0].display}</a>}
          <a href={`mailto:${contact.email}`}><Mail size={18} />{contact.email}</a>
        </div>
        <p className="account-coming-note">{copy.note}</p>
      </div>
    </section>
  </>
}
