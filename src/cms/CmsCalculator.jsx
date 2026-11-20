import { Link } from 'react-router-dom'
import { ArrowRight } from '../icons'
import { useCalculatorSettings } from './useCalculatorSettings'

export default function CmsCalculator({ canEdit, record, onEdit }) {
  const terms = useCalculatorSettings()
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
      <article><h3>Test a calculation</h3><p>Open the website calculator in this tab. Use Manage content to return to your workspace.</p><Link className="button" to="/loan-calculator">Open loan calculator <ArrowRight size={17} /></Link><h3>Update calculator settings</h3>{canEdit ? <><p>Edit rates, fees, loan limits, durations, the weekly schedule and customer wording as a draft. Three verified repayment examples and a different approver are required before publication.</p><button type="button" onClick={onEdit}>{record ? 'Edit calculator settings' : 'Create calculator settings draft'}</button>{record && <p>Working version: {record.status}. The website uses the published version shown alongside.</p>}</> : <p>Editing is available to administrators and assigned Credit or Finance staff.</p>}<p>The existing approved settings remain active until a replacement is published. Unpublishing a replacement restores those original approved settings.</p><p>{terms.disclaimer}</p></article></div>
  </section>
}
