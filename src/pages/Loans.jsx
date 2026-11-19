import { useEffect, useState } from 'react'
import { CircleAlert, Phone } from '../icons'
import { config } from '../config'
import { PageHero } from '../components/Shared'
import { loanCalculatorSettings } from '../content/loanCalculator.js'

export const LOAN_CALCULATOR_TERMS = loanCalculatorSettings

export function getRepaymentCount(duration, frequency, terms = LOAN_CALCULATOR_TERMS) {
  return frequency === 'weekly'
    ? terms.weeklyPaymentsByMonth[duration]
    : duration
}

export function calculateLoanEstimate(principal, duration, frequency = 'monthly', paymentsMade = 0, terms = LOAN_CALCULATOR_TERMS) {
  const repaymentCount = getRepaymentCount(duration, frequency, terms)
  const totalInterest = principal * (terms.monthlyFlatRate / 100) * duration
  const processingFee = principal * (terms.processingFeeRate / 100)
  const insuranceFee = principal * (terms.insuranceFeeRate / 100)
  const managementFee = principal * (terms.managementFeeRate / 100)
  const totalFees = processingFee + insuranceFee + managementFee
  const totalRepayment = principal + totalInterest + totalFees
  const installmentAmount = totalRepayment / repaymentCount
  const remainingPrincipal = principal * Math.max(repaymentCount - paymentsMade, 0) / repaymentCount
  const earlySettlementFee = remainingPrincipal * (terms.earlySettlementRate / 100)

  return {
    principal,
    totalInterest,
    processingFee,
    insuranceFee,
    managementFee,
    totalFees,
    totalRepayment,
    repaymentCount,
    installmentAmount,
    remainingPrincipal,
    earlySettlementFee,
    earlySettlementTotal: remainingPrincipal + earlySettlementFee,
  }
}

export function ApplyLoan() {
  if (config.generalLoanPortal) {
    return <>
      <PageHero eyebrow="Loans" title="Continue your loan application" intro="You’ll continue to RapidLink’s loan application portal." />
      <section className="section"><div className="shell narrow panel centered"><a className="button" href={config.generalLoanPortal} target="_blank" rel="noopener noreferrer">Continue to the loan portal</a><p>No personal information is added to the link.</p></div></section>
    </>
  }

  return <>
    <PageHero eyebrow="Loans" title="Loan application guidance" intro="RapidLink’s general online loan portal is not yet verified." />
    <section className="section"><div className="shell narrow panel">
      <div className="callout warning"><CircleAlert /><div><h2>Online application connection pending</h2><p>The existing general application page is marked “Coming Soon.” MoneyQube is verified only for one-month nano loans, so it is not used as a general application portal.</p></div></div>
      <h2>Speak with the loans team</h2>
      <p>For Controller or SME loan assistance, call <a href="tel:+233533730336">053 373 0336</a> or <a href="tel:+233302246657">030 224 6657</a>.</p>
      <div className="button-row"><a className="button" href="tel:+233533730336"><Phone size={18} /> Call the loans team</a><a className="button button-secondary" href={config.moneyQubeUrl} target="_blank" rel="noopener noreferrer">MoneyQube nano loans</a></div>
    </div>
    </section>
  </>
}

export function LoanCalculator() {
  const terms = LOAN_CALCULATOR_TERMS
  const [principal, setPrincipal] = useState('')
  const [duration, setDuration] = useState(String(terms.minimumMonths))
  const [frequency, setFrequency] = useState(terms.repaymentFrequencies[0])
  const [paymentsMade, setPaymentsMade] = useState('0')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const repaymentCount = getRepaymentCount(Number(duration), frequency, terms)
  const durationOptions = Array.from(
    { length: terms.maximumMonths - terms.minimumMonths + 1 },
    (_, index) => terms.minimumMonths + index,
  )
  const totalFeeRate = terms.processingFeeRate + terms.insuranceFeeRate + terms.managementFeeRate

  useEffect(() => {
    const months = Number(duration)
    if (months < terms.minimumMonths || months > terms.maximumMonths) {
      setDuration(String(terms.minimumMonths))
      setPaymentsMade('0')
      setResult(null)
    }
    if (!terms.repaymentFrequencies.includes(frequency)) {
      setFrequency(terms.repaymentFrequencies[0])
      setPaymentsMade('0')
      setResult(null)
    }
  }, [duration, frequency, terms])

  function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(principal)
    const months = Number(duration)
    const completedPayments = Number(paymentsMade)

    if (!Number.isFinite(amount) || amount < terms.minimumPrincipal || amount > terms.maximumPrincipal) {
      setError('Enter a loan amount from GH₵1,000 to GH₵20,000.')
      return
    }

    if (!Number.isInteger(months) || months < terms.minimumMonths || months > terms.maximumMonths) {
      setError(`Choose a loan duration from ${terms.minimumMonths} to ${terms.maximumMonths} months.`)
      return
    }

    if (!Number.isInteger(completedPayments) || completedPayments < 0 || completedPayments > repaymentCount) {
      setError(`Payments already made must be from 0 to ${repaymentCount}.`)
      return
    }

    setError('')
    setResult(calculateLoanEstimate(amount, months, frequency, completedPayments, terms))
  }

  const money = value => `GH₵ ${value.toFixed(2)}`
  const frequencyLabel = frequency === 'weekly' ? 'weekly' : 'monthly'

  return <>
    <PageHero eyebrow="Planning tool" title="Loan calculator" intro={terms.heroIntro} image="/assets/loan-calculator-hero-v2.png" />
    <section className="section"><div className="shell calculator-layout">
      <form className="panel calculator-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Plan your repayment</p>
        <h2>Calculate an estimate</h2>
        <div className="calculator-field"><label htmlFor="principal-amount">Principal Amount</label>
          <span className="input-with-prefix"><span aria-hidden="true">GH₵</span><input id="principal-amount" type="number" min={terms.minimumPrincipal} max={terms.maximumPrincipal} step="100" placeholder="1,000 – 20,000" value={principal} onChange={event => { setPrincipal(event.target.value); setResult(null) }} required /></span>
        </div>
        <div className="calculator-field"><label htmlFor="interest-rate">Monthly flat interest rate</label>
          <span className="input-with-suffix"><input id="interest-rate" type="number" value={terms.monthlyFlatRate} readOnly aria-readonly="true" /><span aria-hidden="true">%</span></span>
          <small>Calculated each month on the original principal. Nominal annual rate: {terms.nominalAnnualRate}%.</small>
        </div>
        <div className="calculator-field"><label htmlFor="loan-duration">Loan Duration (Months)</label>
          <select id="loan-duration" value={duration} onChange={event => { setDuration(event.target.value); setPaymentsMade('0'); setResult(null) }}>
            {durationOptions.map(month => <option key={month} value={month}>{month} {month === 1 ? 'month' : 'months'}</option>)}
          </select>
        </div>
        <div className="calculator-field"><label htmlFor="repayment-frequency">Repayment frequency</label>
          <select id="repayment-frequency" value={frequency} onChange={event => { setFrequency(event.target.value); setPaymentsMade('0'); setResult(null) }}>
            {terms.repaymentFrequencies.map(option => <option key={option} value={option}>{option === 'weekly' ? 'Weekly' : 'Monthly'}</option>)}
          </select>
          <small>{repaymentCount} equal {frequencyLabel} {repaymentCount === 1 ? 'payment' : 'payments'}.</small>
        </div>
        <div className="calculator-field"><label htmlFor="payments-made">Number of instalments already paid <span className="optional-label">(optional)</span></label>
          <input id="payments-made" type="number" min="0" max={repaymentCount} step="1" aria-describedby="payments-made-help" value={paymentsMade} onChange={event => { setPaymentsMade(event.target.value); setResult(null) }} />
          <small id="payments-made-help">Planning a new loan? Leave this at 0. To estimate the cost of clearing an existing loan early, enter how many {frequencyLabel} instalments you have already paid, not the amount of money paid. Your selected schedule has {repaymentCount} {repaymentCount === 1 ? 'instalment' : 'instalments'}, so enter a whole number from 0 to {repaymentCount}. This does not check your actual loan account; contact the loans team for a settlement quote.</small>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button" type="submit">Calculate</button>
      </form>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Your estimate</p>
        <h2>Repayment summary</h2>
        {!result ? <div className="calculator-empty-state"><strong>Enter a loan amount to begin.</strong><p>Your interest, fees and instalments will appear here.</p></div> : <>
          <div className="result-card result-card-featured"><span>{frequency === 'weekly' ? 'Weekly' : 'Monthly'} instalment</span><strong>{money(result.installmentAmount)}</strong><small>{result.repaymentCount} equal payments</small></div>
          <dl className="calculator-breakdown">
            <div><dt>Principal</dt><dd>{money(result.principal)}</dd></div>
            <div><dt>Flat interest</dt><dd>{money(result.totalInterest)}</dd></div>
            <div><dt>Processing fee ({terms.processingFeeRate}%)</dt><dd>{money(result.processingFee)}</dd></div>
            <div><dt>Insurance ({terms.insuranceFeeRate}%)</dt><dd>{money(result.insuranceFee)}</dd></div>
            <div><dt>Management fee ({terms.managementFeeRate}%)</dt><dd>{money(result.managementFee)}</dd></div>
            <div className="calculator-total"><dt>Total repayment</dt><dd>{money(result.totalRepayment)}</dd></div>
          </dl>
          <div className="settlement-card"><span>Estimated early settlement today</span><strong>{money(result.earlySettlementTotal)}</strong><small>Outstanding principal {money(result.remainingPrincipal)} + {terms.earlySettlementRate}% settlement fee {money(result.earlySettlementFee)}. {terms.excludeFutureInterest ? 'Future interest is excluded.' : 'Future interest treatment is included in the published configuration.'}</small></div>
        </>}
      </div>
    </div>
      <div className="shell calculator-disclosure">
        <CircleAlert />
        <div><h2>Important calculation information</h2><p>{terms.disclaimer} It uses a {terms.monthlyFlatRate}% monthly flat rate on the original principal, adds {totalFeeRate}% in fees to repayment and assumes equal instalments. Final amounts remain subject to RapidLink assessment and approval.</p></div>
      </div>
    </section>
  </>
}
