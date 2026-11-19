import { Link } from 'react-router-dom'
import { Building2, Landmark, Mail, Phone } from '../icons'
import { PageMeta } from '../components/Shared'

export default function OpenAccount() {
  return <>
    <PageMeta title="Online account opening - Coming soon" description="Online account opening is being prepared. Contact RapidLink or find a branch for assistance." />
    <section className="account-coming" aria-labelledby="account-coming-title">
      <div className="shell">
        <div className="account-coming-card">
          <div className="account-coming-copy">
            <p className="eyebrow">Account opening</p>
            <span className="account-coming-badge">Coming soon</span>
            <h1 id="account-coming-title">Your next chapter.<br /><span>A simpler start.</span></h1>
            <h2>Online account opening is on its way.</h2>
            <p>We are preparing our online account-opening service. Applications cannot be submitted through this website yet.</p>
            <p>In the meantime, our team can help you with your next steps.</p>
            <div className="button-row"><Link className="button" to="/contact">Contact us</Link><Link className="button button-secondary" to="/contact#branch-map-title"><Building2 size={18} /> Find a branch</Link></div>
          </div>
          <div className="account-coming-art" aria-hidden="true">
            <div className="account-coming-orbit"><div className="account-coming-emblem"><Landmark size={84} /></div></div>
            <div className="account-coming-art-copy"><span>RAPIDLINK</span><p>Here for your<br />next step.</p></div>
          </div>
        </div>
        <div className="account-coming-support">
          <p>Need assistance today?</p>
          <a href="tel:+233303955183"><Phone size={18} />030 395 5183</a>
          <a href="mailto:info@rapidlinkfinance.com"><Mail size={18} />info@rapidlinkfinance.com</a>
        </div>
        <p className="account-coming-note">No application details or documents are collected on this page.</p>
      </div>
    </section>
  </>
}
