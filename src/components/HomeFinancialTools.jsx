import { Link } from 'react-router-dom'

export default function HomeFinancialTools() {
  return <section className="home-quick-access" aria-labelledby="quick-access-title">
    <div className="shell quick-access-layout">
      <div className="quick-access-heading">
        <div><p className="eyebrow">Plan with confidence</p><h2 id="quick-access-title">Know your numbers.<br /><span>Plan your next move.</span></h2></div>
        <p className="quick-access-intro">Explore our published rates and estimate your loan repayments before taking the next step.</p>
      </div>
      <div className="quick-access-links">
        <Link className="quick-access-card quick-access-rates" to="/rates" aria-labelledby="rates-tool-title" aria-describedby="rates-tool-description">
          <img className="quick-access-photo" src="/assets/business-loan.jpg" alt="" loading="lazy" decoding="async" />
          <div className="quick-access-copy"><h3 id="rates-tool-title"><span>Current</span>{' '}<span>Interest Rates</span></h3><p id="rates-tool-description">Explore our published rates and plan your next financial step.</p></div>
          <span className="quick-access-fold" aria-hidden="true" />
        </Link>
        <Link className="quick-access-card quick-access-calculator" to="/loan-calculator" aria-labelledby="calculator-tool-title" aria-describedby="calculator-tool-description">
          <img className="quick-access-photo" src="/assets/rapid-target-savings.webp" alt="" loading="lazy" decoding="async" />
          <div className="quick-access-copy"><h3 id="calculator-tool-title"><span>Loan</span>{' '}<span>Calculator</span></h3><p id="calculator-tool-description">Estimate your interest, fees and repayments before you apply.</p></div>
          <span className="quick-access-fold" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
}
