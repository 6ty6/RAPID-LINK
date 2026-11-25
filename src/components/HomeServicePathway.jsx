import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Landmark, Smartphone } from '../icons'

const services = [
  { title: 'Save & grow', description: 'Savings and deposits for your next goal.', action: 'Explore savings', to: '/rapid-savings', Icon: Landmark },
  { title: 'Move forward', description: 'Micro and SME loans to support your plans.', action: 'Explore loans', to: '/business-loan', Icon: Building2 },
  { title: 'Bank anywhere', description: 'Everyday banking through mobile and USSD.', action: 'Explore digital channels', to: '/digital-channels', Icon: Smartphone },
]

export default function HomeServicePathway() {
  const sectionRef = useRef(null)
  const gradientId = useId()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.15 })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])
  return <section ref={sectionRef} className={`section service-pathway ${visible ? 'is-visible' : ''}`} aria-labelledby="service-pathway-title">
    <div className="shell">
      <div className="service-pathway-heading"><p className="eyebrow">What we provide</p><h2 id="service-pathway-title">Financial tools for real life.</h2><p className="lead">Save consistently, support your business and bank wherever life takes you.</p></div>
      <div className="service-pathway-stations">
        <svg className="service-pathway-line" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={gradientId}><stop stopColor="#6589ff" /><stop offset="1" stopColor="#ff7400" /></linearGradient></defs><path d="M 0 98 C 220 98 260 34 500 34 S 780 98 1000 98" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" pathLength="1" /></svg>
        {services.map(({ title, description, action, to, Icon }, index) => <div className="service-pathway-station" key={to} style={{ '--station-index': index }}>
          <span className="service-pathway-icon"><Icon size={48} /></span><h3>{title}</h3><p>{description}</p><Link className="text-link" to={to}>{action}</Link>
        </div>)}
      </div>
      <Link className="text-link service-pathway-about" to="/institutional-profile">Learn about RapidLink</Link>
    </div>
  </section>
}
