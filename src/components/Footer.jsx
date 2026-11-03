import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer>
    <div className="shell footer-grid">
      <div><img className="footer-logo" src="/assets/rapidlink-logo.png" alt="RapidLink Microfinance Limited" /><p>Accessible financial services for individuals, communities and small businesses in Ghana.</p></div>
      <div><h2>Explore</h2><Link to="/rapid-savings">Savings</Link><Link to="/personal-loan">Loans</Link><Link to="/rates">Rates</Link><Link to="/digital-channels">Digital channels</Link></div>
      <div><h2>Company</h2><Link to="/institutional-profile">About us</Link><Link to="/stories">News</Link><Link to="/faqs">FAQs</Link><Link to="/rapidlink-careers">Careers</Link></div>
      <div><h2>Get in touch</h2><a href="tel:+233303955183">030 395 5183</a><a href="mailto:info@rapidlinkfinance.com">info@rapidlinkfinance.com</a><p>17 Farrar Avenue, Asylum Down, Accra<br />Digital address: GA-049-5378</p></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} RapidLink Microfinance Ltd.</span><span>Approved privacy-policy content is pending.</span></div>
  </footer>
}
