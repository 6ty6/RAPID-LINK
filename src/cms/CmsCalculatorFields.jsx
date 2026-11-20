import { CmsFields } from './CmsFields'
import { models } from './models'
const groups = [
  ['Loan limits', 'Set the amounts and loan durations customers may select.', ['minimumPrincipal','maximumPrincipal','minimumMonths','maximumMonths']],
  ['Rates & fees', 'Enter percentages. The displayed nominal annual rate is calculated automatically as the monthly rate × 12.', ['monthlyFlatRate','processingFeeRate','insuranceFeeRate','managementFeeRate','earlySettlementRate']],
  ['Weekly repayments', 'Provide the approved payment count for every allowed duration. Extending the loan duration requires extending this schedule too.', ['weeklySchedule']],
  ['Customer information', 'Keep the introduction, estimate disclosure and effective date accurate.', ['heroIntro','disclaimer','effectiveDate']],
  ['Approval & verification', 'Record the Credit approval reference and at least three different examples from approved repayment schedules. Enter the expected totals, instalments and settlement amounts; these must match before review. This information stays in the staff CMS.', ['approvalReference','verificationCases']],
]
export default function CmsCalculatorFields(props) {
  return <div className="cms-calculator-field-groups">{groups.map(([title,help,keys])=><section key={title}><h4>{title}</h4><p>{help}</p><CmsFields {...props} fields={models.calculator.fields.filter(field=>keys.includes(field.key))} /></section>)}</div>
}
