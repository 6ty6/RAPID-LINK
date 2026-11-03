import { useEffect, useId, useRef, useState } from 'react'
import { Check, CircleAlert } from '../icons'
import { PageHero } from '../components/Shared'

const formSteps = ['Product', 'Personal details', 'Residence & work', 'Documents & consent']
const initialForm = {
  product_type: '', title: '', gender: '', first_name: '', last_name: '', initial_deposit: '', tin: '', dob: '', pob: '', marital_status: '', telephone: '', spouse_name: '', pep: false,
  id_form: 'Ghana Card', id_number: '', id_issue_authority: '', id_expiry_date: '', id_issue_date: '', id_issue_place: '', nationality: '', social_security_no: '',
  region: '', suburb: '', residential_digital_address: '', postal_address: '', nearest_landmarks: '', occupation: '', source_of_fund: '', employer_contact_person: '', employer_contact_no: '', work_nearest_landmark: '', net_income: '',
  nok_first_name: '', nok_surname: '', nok_relationship: '', nok_phone_number: '', accept_terms: false,
}

function FormStep({ title, children }) {
  return <fieldset><legend>{title}</legend>{children}</fieldset>
}

function Input({ label, ...props }) {
  const id = useId()
  return <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}<input id={id} {...props} /></label>
}

function Select({ label, options, ...props }) {
  const id = useId()
  return <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}
    <select id={id} {...props}><option value="">Select</option>{options.map(option => <option key={option} value={option.toLowerCase().replaceAll(' ', '_')}>{option}</option>)}</select>
  </label>
}

function RadioGroup({ name, value, onChange, options }) {
  return <div className="radio-grid">{options.map(([option, label]) => <label key={option}>
    <input type="radio" name={name} value={option} checked={value === option} onChange={onChange} required />{label}
  </label>)}</div>
}

function PersonalFields({ data, update }) {
  return <div className="form-grid">
    <Input label="Title" name="title" value={data.title} onChange={update} required />
    <Select label="Gender" name="gender" value={data.gender} onChange={update} required options={['Female', 'Male', 'Other', 'Prefer not to say']} />
    <Input label="First name" name="first_name" value={data.first_name} onChange={update} required />
    <Input label="Last name" name="last_name" value={data.last_name} onChange={update} required />
    <Input label="Initial deposit (GH¢)" type="number" min="0" step="0.01" name="initial_deposit" value={data.initial_deposit} onChange={update} required />
    <Input label="TIN" name="tin" value={data.tin} onChange={update} />
    <Input label="Date of birth" type="date" name="dob" value={data.dob} onChange={update} required />
    <Input label="Place of birth" name="pob" value={data.pob} onChange={update} required />
    <Select label="Marital status" name="marital_status" value={data.marital_status} onChange={update} required options={['Married', 'Single', 'Divorced', 'Separated']} />
    <Input label="Telephone" type="tel" name="telephone" value={data.telephone} onChange={update} required />
    <Input label="Spouse’s name" name="spouse_name" value={data.spouse_name} onChange={update} />
    <label className="checkbox"><input type="checkbox" name="pep" checked={data.pep} onChange={update} /> Politically exposed person (PEP)</label>
    <Input label="Form of identification" name="id_form" value={data.id_form} readOnly required />
    <Input label="ID number" name="id_number" value={data.id_number} onChange={update} required />
    <Input label="ID issuing authority" name="id_issue_authority" value={data.id_issue_authority} onChange={update} required />
    <Input label="ID issue date" type="date" name="id_issue_date" value={data.id_issue_date} onChange={update} required />
    <Input label="ID expiry date" type="date" name="id_expiry_date" value={data.id_expiry_date} onChange={update} required />
    <Input label="Place of ID issue" name="id_issue_place" value={data.id_issue_place} onChange={update} required />
    <Input label="Nationality" name="nationality" value={data.nationality} onChange={update} required />
    <Input label="Social Security number" name="social_security_no" value={data.social_security_no} onChange={update} />
  </div>
}

function ResidenceFields({ data, update }) {
  return <div className="form-grid">
    <Input label="Region / state" name="region" value={data.region} onChange={update} required />
    <Input label="Suburb" name="suburb" value={data.suburb} onChange={update} required />
    <Input label="Residential digital address" name="residential_digital_address" value={data.residential_digital_address} onChange={update} required />
    <Input label="Postal address" name="postal_address" value={data.postal_address} onChange={update} />
    <Input label="Nearest landmarks" name="nearest_landmarks" value={data.nearest_landmarks} onChange={update} />
    <Input label="Occupation" name="occupation" value={data.occupation} onChange={update} required />
    <Input label="Source of funds" name="source_of_fund" value={data.source_of_fund} onChange={update} required />
    <Input label="Employer contact person" name="employer_contact_person" value={data.employer_contact_person} onChange={update} />
    <Input label="Employer contact number" type="tel" name="employer_contact_no" value={data.employer_contact_no} onChange={update} />
    <Input label="Work nearest landmark" name="work_nearest_landmark" value={data.work_nearest_landmark} onChange={update} />
    <Input label="Net income (GH¢)" type="number" min="0" step="0.01" name="net_income" value={data.net_income} onChange={update} />
    <Input label="Next of kin—first name" name="nok_first_name" value={data.nok_first_name} onChange={update} required />
    <Input label="Next of kin—surname" name="nok_surname" value={data.nok_surname} onChange={update} required />
    <Input label="Relationship" name="nok_relationship" value={data.nok_relationship} onChange={update} required />
    <Input label="Next of kin—phone" type="tel" name="nok_phone_number" value={data.nok_phone_number} onChange={update} required />
  </div>
}

function SignaturePad({ onChange }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, rect.width * ratio)
    canvas.height = 170 * ratio
    const context = canvas.getContext('2d')
    context.scale(ratio, ratio)
    context.lineWidth = 2.2
    context.lineCap = 'round'
    context.strokeStyle = '#142d43'
  }, [])

  const point = event => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }
  const start = event => {
    drawing.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const [x, y] = point(event)
    const context = event.currentTarget.getContext('2d')
    context.beginPath()
    context.moveTo(x, y)
  }
  const move = event => {
    if (!drawing.current) return
    const [x, y] = point(event)
    const context = event.currentTarget.getContext('2d')
    context.lineTo(x, y)
    context.stroke()
  }
  const end = event => {
    if (!drawing.current) return
    drawing.current = false
    onChange(event.currentTarget.toDataURL('image/png'))
  }
  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return <div className="signature-field">
    <span>Draw your signature with a mouse, finger or stylus</span>
    <canvas ref={canvasRef} className="signature-pad" role="img" aria-label="Signature drawing area" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
    <button type="button" className="button button-secondary" onClick={clear}>Clear signature</button>
  </div>
}

function DocumentFields({ data, update, files, setFiles, signature, setSignature }) {
  const documents = [['id_front', 'Valid ID—front'], ['id_back', 'Valid ID—back'], ['passport_picture', 'Passport photograph']]
  const handleFile = (event, name) => {
    const file = event.target.files[0]
    if (file && file.size > 1.5 * 1024 * 1024) {
      event.target.setCustomValidity('File must be 1.5 MB or smaller.')
      event.target.reportValidity()
    } else {
      event.target.setCustomValidity('')
      setFiles({ ...files, [name]: file })
    }
  }

  return <>
    <div className="callout"><CircleAlert /><p>Upload clear images, up to 1.5 MB each. Files remain in page memory and are not sent from this preview.</p></div>
    <div className="form-grid">{documents.map(([name, label]) => <label key={name}>{label}<input type="file" accept="image/*" required onChange={event => handleFile(event, name)} /></label>)}</div>
    <SignaturePad onChange={setSignature} />
    <Input label="Typed signature (accessible alternative)" name="signature" value={signature.startsWith('data:') ? '' : signature} onChange={event => setSignature(event.target.value)} />
    <div className="terms"><h3>Account creation terms</h3><p>RapidLink may refuse an application and may contact you using the details supplied. Instructions may be refused when they do not comply with the mandate, sufficient funds are unavailable, authenticity is doubtful, instructions are unclear, legal obligations may be breached, or misuse is suspected.</p><p>Transaction anomalies must be reported in writing within 21 days. Accounts inactive for two years may be classified as dormant. RapidLink may amend or supplement its terms.</p></div>
    <label className="checkbox"><input type="checkbox" name="accept_terms" checked={data.accept_terms} onChange={update} required /> I have read and accept the account-creation terms.</label>
  </>
}

export default function OpenAccount() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initialForm)
  const [files, setFiles] = useState({})
  const [signature, setSignature] = useState('')
  const [status, setStatus] = useState('')
  const formRef = useRef()

  const update = event => {
    const { name, value, type, checked } = event.target
    setData(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }
  const next = event => {
    event.preventDefault()
    if (!formRef.current.reportValidity()) return
    if (step < 3) setStep(step + 1)
  }
  const submit = event => {
    event.preventDefault()
    if (!formRef.current.reportValidity()) return
    if (!signature) {
      setStatus('Add a signature before reviewing submission.')
      return
    }
    setStatus('Submission is not connected. Your information remains only in this page and has not been sent.')
  }

  return <>
    <PageHero eyebrow="Open an account" title="Start your account application" intro="Complete the four steps below. Your sensitive details are kept in page memory and are not stored by this preview." />
    <section className="section"><div className="shell form-shell">
      <ol className="stepper">{formSteps.map((label, index) => <li className={index === step ? 'active' : index < step ? 'done' : ''} key={label}><span>{index < step ? <Check /> : index + 1}</span>{label}</li>)}</ol>
      <form ref={formRef} onSubmit={submit} className="account-form">
        {step === 0 && <FormStep title="Choose a product"><RadioGroup name="product_type" value={data.product_type} onChange={update} options={[['rapid_savings', 'Rapid Savings'], ['rapid_fixed_deposit', 'Rapid Fixed Deposit'], ['premium_account', 'Premium account'], ['investment_account', 'Investment account'], ['edugrow_account', 'Edu-Grow account']]} /></FormStep>}
        {step === 1 && <FormStep title="Personal and identification details"><PersonalFields data={data} update={update} /></FormStep>}
        {step === 2 && <FormStep title="Residence, work and next of kin"><ResidenceFields data={data} update={update} /></FormStep>}
        {step === 3 && <FormStep title="Documents, signature and consent"><DocumentFields data={data} update={update} files={files} setFiles={setFiles} signature={signature} setSignature={setSignature} /></FormStep>}
        {status && <div className="status" role="status">{status}</div>}
        <div className="form-actions">
          {step > 0 && <button type="button" className="button button-secondary" onClick={() => setStep(step - 1)}>Previous</button>}
          {step < 3 ? <button className="button" onClick={next}>Next step</button> : <button className="button" type="submit">Review submission status</button>}
        </div>
      </form>
    </div></section>
  </>
}
