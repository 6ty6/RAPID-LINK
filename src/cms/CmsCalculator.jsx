import { Link } from 'react-router-dom'
import { ArrowRight } from '../icons'
import { loanCalculatorSettings as terms } from '../content/loanCalculator'

export default function CmsCalculator() {
  const money = value => `GHC ${value.toLocaleString('en-GH')}`
  const rows = [
    ['Loan amount', `${money(terms.minimumPrincipal)} – ${money(terms.maximumPrincipal)}`],
    ['Loan duration', `${terms.minimumMonths} – ${terms.maximumMonths} months`],
    ['Monthly flat interest rate', `${terms.monthlyFlatRate}%`],
    ['Nominal annual rate', `${terms.nominalAnnualRate}%`],
    ['Processing fee', `${terms.processingFeeRate}%`],
    ['Insurance fee', `${terms.insuranceFeeRate}%`],
    ['Management fee', `${terms.managementFeeRate}%`],
    ['Total fees', `${terms.processingFeeRate + terms.insuranceFeeRate + terms.managementFeeRate}%`],
    ['Early settlement fee', `${terms.earlySettlementRate}% of remaining principal`],
    ['Repayment options', terms.repaymentFrequencies.join(' / ')],
    ['Effective date', terms.effectiveDate],
  ]
  return <section className="cms-calculator"><div className="cms-section-head"><div><p className="eyebrow">Customer tools</p><h2>Loan calculator</h2><p>Review the approved settings and test the calculator customers use.</p></div><span className="cms-badge status-approved">Approved settings</span></div>
    <div className="cms-tools-grid"><article><h3>Current calculator settings</h3><p>These values come from the same settings used by the website.</p><dl className="cms-calculator-values">{rows.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>
      <article><h3>Test a calculation</h3><p>Open the website calculator in this tab. Use Manage content to return to your workspace.</p><Link className="button" to="/loan-calculator">Open loan calculator <ArrowRight size={17} /></Link><h3>Pricing changes</h3><p>Rates, limits and calculation rules are read-only here. Changes must be approved and verified against repayment examples before they are released.</p><p>{terms.disclaimer}</p></article></div>
  </section>
}
