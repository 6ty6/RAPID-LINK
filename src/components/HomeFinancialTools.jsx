import { Link } from 'react-router-dom'
import useCalculatorPage from '../hooks/useCalculatorPage.js'
import usePageContent from '../hooks/usePageContent.js'

export default function HomeFinancialTools() {
  const page=useCalculatorPage()
  const {data:home}=usePageContent('homepage')
  const tools=home.tools
  return <section className="home-quick-access" aria-labelledby="quick-access-title">
    <div className="shell quick-access-layout">
      <div className="quick-access-heading">
        <div><p className="eyebrow">{tools.eyebrow}</p><h2 id="quick-access-title">{tools.titleFirst}<br /><span>{tools.titleSecond}</span></h2></div>
        <p className="quick-access-intro">{tools.description}</p>
      </div>
      <div className="quick-access-links">
        <Link className="quick-access-card quick-access-rates" to="/rates" aria-labelledby="rates-tool-title" aria-describedby="rates-tool-description">
          <img className="quick-access-photo" src={tools.ratesImage} alt="" loading="lazy" decoding="async" />
          <div className="quick-access-copy"><h3 id="rates-tool-title"><span>{tools.ratesTitleFirst}</span>{' '}<span>{tools.ratesTitleSecond}</span></h3><p id="rates-tool-description">{tools.ratesDescription}</p></div>
          <span className="quick-access-fold" aria-hidden="true" />
        </Link>
        <Link className="quick-access-card quick-access-calculator" to="/loan-calculator" aria-labelledby="calculator-tool-title" aria-describedby="calculator-tool-description">
          <img className="quick-access-photo" src={page.cardImage} alt={page.cardImageAlt} loading="lazy" decoding="async" />
          <div className="quick-access-copy"><h3 id="calculator-tool-title"><span>{page.cardTitleFirst}</span>{' '}<span>{page.cardTitleSecond}</span></h3><p id="calculator-tool-description">{page.cardDescription}</p></div>
          <span className="quick-access-fold" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
}
