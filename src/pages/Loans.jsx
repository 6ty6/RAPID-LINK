import { useState } from 'react'
import { CircleAlert, Phone } from '../icons'
import { config } from '../config'
import { PageHero } from '../components/Shared'

export function calculateLoanEstimate(principal, rate, duration) {
  const totalInterest = principal * (rate / 100) * duration
  return { totalInterest, totalRepayment: principal + totalInterest }
}

export function ApplyLoan() {
  if (config.generalLoanPortal) {
    return <>
      <PageHero eyebrow="Loans" title="Continue your loan application" intro="You’ll continue to RapidLink’s loan application portal." />
      <section className="section"><div className="shell narrow panel centered"><a className="button" href={config.generalLoanPortal}>Continue to the loan portal</a><p>No personal information is added to the link.</p></div></section>
    </>
  }

  return <>
    <PageHero eyebrow="Loans" title="Loan application guidance" intro="RapidLink’s general online loan portal is not yet verified." />
    <section className="section"><div className="shell narrow panel">
      <div className="callout warning"><CircleAlert /><div><h2>Online application connection pending</h2><p>The existing general application page is marked “Coming Soon.” MoneyQube is verified only for one-month nano loans, so it is not used as a general application portal.</p></div></div>
      <h2>Speak with the loans team</h2>
      <p>For Controller or SME loan assistance, call <a href="tel:+233533730336">053 373 0336</a> or <a href="tel:+233302246657">030 224 6657</a>.</p>
      <div className="button-row"><a className="button" href="tel:+233533730336"><Phone size={18} /> Call the loans team</a><a className="button button-secondary" href={config.moneyQubeUrl}>MoneyQube nano loans</a></div>
    </div>
    </section>
  </>
}

export function LoanCalculator() {
  const [principal, setPrincipal] = useState('')
  const [duration, setDuration] = useState('')
  const [result, setResult] = useState({ totalInterest: 0, totalRepayment: 0 })
  const [error, setError] = useState('')
  const rate = 6

  function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(principal)
    const months = Number(duration)

    if (!Number.isFinite(amount) || !Number.isFinite(months) || amount <= 0 || months <= 0) {
      setError('Please enter a valid principal amount and loan duration.')
      return
    }

    setError('')
    setResult(calculateLoanEstimate(amount, rate, months))
  }

  const money = value => `GHC ${value.toFixed(2)}`

  return <>
    <PageHero eyebrow="Planning tool" title="Loan calculator" intro="Calculate the total interest and repayment for a RapidLink loan." image="/assets/loan-calculator-hero-v2.png" />
    <section className="section"><div className="shell calculator-layout">
      <form className="panel calculator-form" onSubmit={handleSubmit}>
        <h2>Loan calculator</h2>
        <div className="calculator-field"><label htmlFor="principal-amount">Principal Amount</label>
          <span className="input-with-prefix"><span aria-hidden="true">GHC</span><input id="principal-amount" type="number" min="0" step="0.01" value={principal} onChange={event => setPrincipal(event.target.value)} required /></span>
        </div>
        <div className="calculator-field"><label htmlFor="interest-rate">Annual Interest Rate</label>
          <span className="input-with-suffix"><input id="interest-rate" type="number" value={rate} readOnly aria-readonly="true" /><span aria-hidden="true">%</span></span>
        </div>
        <div className="calculator-field"><label htmlFor="loan-duration">Loan Duration (Months)</label>
          <input id="loan-duration" type="number" min="1" step="1" value={duration} onChange={event => setDuration(event.target.value)} required />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button" type="submit">Calculate</button>
      </form>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Your estimate</p>
        <h2>Repayment summary</h2>
        <div className="result-card"><span>Total Interest</span><strong>{money(result.totalInterest)}</strong></div>
        <div className="result-card"><span>Total Repayment</span><strong>{money(result.totalRepayment)}</strong></div>
      </div>
    </div></section>
  </>
}
