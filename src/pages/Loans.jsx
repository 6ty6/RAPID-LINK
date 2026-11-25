import { useEffect, useState } from 'react'
import { CircleAlert, Phone } from '../icons'
import { config } from '../config'
import { PageHero } from '../components/Shared'
import { loanCalculatorSettings } from '../content/loanCalculator.js'
import useLoanCalculatorSettings from '../hooks/useLoanCalculatorSettings.js'
import useSiteInformation from '../hooks/useSiteInformation.js'
import useCalculatorPage from '../hooks/useCalculatorPage.js'
import {formatCalculatorText} from '../content/calculatorPage.js'
import usePageContent from '../hooks/usePageContent.js'

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
  const {data:page}=usePageContent('loanGuidance')
  const { contact } = useSiteInformation()
  if (config.generalLoanPortal) {
    return <>
      <PageHero {...page.connected} />
      <section className="section"><div className="shell narrow panel centered"><a className="button" href={config.generalLoanPortal} target="_blank" rel="noopener noreferrer">{page.connected.actionLabel}</a><p>{page.connected.notice}</p></div></section>
    </>
  }

  return <>
    <PageHero {...page.pending} />
    <section className="section"><div className="shell narrow panel">
      <div className="callout warning"><CircleAlert /><div><h2>{page.pending.statusTitle}</h2><p>{page.pending.description}</p></div></div>
      <h2>{page.pending.supportTitle}</h2>
      <p>For Controller or SME loan assistance, call {contact.loanSupportLines.map((line, index) => <span key={line.href}>{index > 0 && ' or '}<a href={line.href}>{line.display}</a></span>)}.</p>
      <div className="button-row">{contact.loanSupportLines[0] && <a className="button" href={contact.loanSupportLines[0].href}><Phone size={18} /> {page.pending.callLabel}</a>}<a className="button button-secondary" href={config.moneyQubeUrl} target="_blank" rel="noopener noreferrer">{page.pending.nanoLabel}</a></div>
    </div>
    </section>
  </>
}

export function LoanCalculator() {
  const page=useCalculatorPage()
  const terms = useLoanCalculatorSettings()
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
  useEffect(() => { setResult(null); setError('') }, [terms])

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

  const exceedsMaximum = principal !== '' && Number(principal) > terms.maximumPrincipal
  const maximumMessage = 'You have exceeded the maximum loan amount of GHC ' + terms.maximumPrincipal.toLocaleString('en-GH') + '. Please enter a lower amount.'

  function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(principal)
    const months = Number(duration)
    const completedPayments = Number(paymentsMade)

    if (amount > terms.maximumPrincipal) {
      setError(maximumMessage)
      return
    }

    if (!Number.isFinite(amount) || amount < terms.minimumPrincipal) {
      setError(`Enter a loan amount from GHC ${terms.minimumPrincipal.toLocaleString('en-GH')} to GHC ${terms.maximumPrincipal.toLocaleString('en-GH')}.`)
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
    <PageHero eyebrow={page.heroEyebrow} title={page.heroTitle} intro={terms.heroIntro} image={page.heroImage} />
    <section className="section"><div className="shell calculator-layout">
      <form className="panel calculator-form" onSubmit={handleSubmit}>
        <p className="eyebrow">{page.formEyebrow}</p>
        <h2>{page.formTitle}</h2>
        <div className="calculator-field"><label htmlFor="principal-amount">{page.principalLabel}</label>
          <span className="input-with-prefix"><span aria-hidden="true">GH₵</span><input id="principal-amount" type="number" min={terms.minimumPrincipal} max={terms.maximumPrincipal} step="0.01" placeholder={`${terms.minimumPrincipal.toLocaleString()} - ${terms.maximumPrincipal.toLocaleString()}`} aria-invalid={exceedsMaximum} aria-describedby="principal-limit" value={principal} onChange={event => { setPrincipal(event.target.value); setResult(null); setError('') }} required /></span>
          <small id="principal-limit">Maximum loan amount: GHC {terms.maximumPrincipal.toLocaleString('en-GH')}.</small>
          {exceedsMaximum && <p className="form-error" role="alert">{maximumMessage}</p>}
        </div>
        <div className="calculator-field"><label htmlFor="interest-rate">{page.rateLabel}</label>
          <span className="input-with-suffix"><input id="interest-rate" type="number" value={terms.monthlyFlatRate} readOnly aria-readonly="true" /><span aria-hidden="true">%</span></span>
          <small>{formatCalculatorText(page.rateHelp,{annualRate:terms.nominalAnnualRate})}</small>
        </div>
        <div className="calculator-field"><label htmlFor="loan-duration">{page.durationLabel}</label>
          <select id="loan-duration" value={duration} onChange={event => { setDuration(event.target.value); setPaymentsMade('0'); setResult(null) }}>
            {durationOptions.map(month => <option key={month} value={month}>{month} {month === 1 ? 'month' : 'months'}</option>)}
          </select>
        </div>
        <div className="calculator-field"><label htmlFor="repayment-frequency">{page.frequencyLabel}</label>
          <select id="repayment-frequency" value={frequency} onChange={event => { setFrequency(event.target.value); setPaymentsMade('0'); setResult(null) }}>
            {terms.repaymentFrequencies.map(option => <option key={option} value={option}>{option === 'weekly' ? 'Weekly' : 'Monthly'}</option>)}
          </select>
          <small>{repaymentCount} equal {frequencyLabel} {repaymentCount === 1 ? 'payment' : 'payments'}.</small>
        </div>
        <div className="calculator-field"><label htmlFor="payments-made">{page.paymentsLabel} <span className="optional-label">{page.optionalLabel}</span></label>
          <input id="payments-made" type="number" min="0" max={repaymentCount} step="1" aria-describedby="payments-made-help" value={paymentsMade} onChange={event => { setPaymentsMade(event.target.value); setResult(null) }} />
          <small id="payments-made-help">{formatCalculatorText(page.paymentsHelp,{frequency:frequencyLabel,count:repaymentCount,instalments:repaymentCount === 1 ? 'instalment' : 'instalments'})}</small>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={exceedsMaximum}>{page.calculateLabel}</button>
      </form>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">{page.resultsEyebrow}</p>
        <h2>{page.resultsTitle}</h2>
        {!result ? <div className="calculator-empty-state"><strong>{page.emptyTitle}</strong><p>{page.emptyDescription}</p></div> : <>
          <div className="result-card result-card-featured"><span>{frequency === 'weekly' ? 'Weekly' : 'Monthly'} instalment</span><strong>{money(result.installmentAmount)}</strong><small>{result.repaymentCount} equal payments</small></div>
          <dl className="calculator-breakdown">
            <div><dt>{page.principalResult}</dt><dd>{money(result.principal)}</dd></div>
            <div><dt>{page.interestResult}</dt><dd>{money(result.totalInterest)}</dd></div>
            <div><dt>{page.processingResult} ({terms.processingFeeRate}%)</dt><dd>{money(result.processingFee)}</dd></div>
            <div><dt>{page.insuranceResult} ({terms.insuranceFeeRate}%)</dt><dd>{money(result.insuranceFee)}</dd></div>
            <div><dt>{page.managementResult} ({terms.managementFeeRate}%)</dt><dd>{money(result.managementFee)}</dd></div>
            <div className="calculator-total"><dt>{page.totalResult}</dt><dd>{money(result.totalRepayment)}</dd></div>
          </dl>
          <div className="settlement-card"><span>{page.settlementTitle}</span><strong>{money(result.earlySettlementTotal)}</strong><small>Outstanding principal {money(result.remainingPrincipal)} + {terms.earlySettlementRate}% settlement fee {money(result.earlySettlementFee)}. {terms.excludeFutureInterest ? 'Future interest is excluded.' : 'Future interest treatment is included in the published configuration.'}</small></div>
        </>}
      </div>
    </div>
      <div className="shell calculator-disclosure">
        <CircleAlert />
        <div><h2>{page.disclosureTitle}</h2><p>{terms.disclaimer} It uses a {terms.monthlyFlatRate}% monthly flat rate on the original principal, adds {totalFeeRate}% in fees to repayment and assumes equal instalments. Final amounts remain subject to RapidLink assessment and approval.</p></div>
      </div>
    </section>
  </>
}
