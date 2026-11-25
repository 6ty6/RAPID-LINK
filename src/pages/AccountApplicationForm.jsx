import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Landmark, MapPin, WalletCards } from '../icons'
import { steps, fields, images, imageError, requestFits } from '../content/accountApplication'
import './accountApplication.css'

function AccountChoices({ value, onChange }) {
 return <fieldset className="application-account-choices"><legend>Choose your account type *</legend>
  <p>Select a card, then continue. Both account types require the documents listed below.</p>
  <div className="application-account-grid">{[
   ['savings', 'Savings account', 'Start an application for a savings account.', WalletCards],
   ['current', 'Current account', 'Start an application for a current account.', Landmark],
  ].map(([type, title, description, Icon]) => <label className={`application-account-card${type === 'current' ? ' application-account-card-dark' : ''}`} key={type}>
   <input type="radio" name="account_type" value={type} checked={value === type} onChange={onChange} required aria-label={title} />
   <span className="application-account-icon"><Icon size={32} /></span>
   <span className="application-account-title">{title}</span><span className="application-account-description">{description}</span>
   <span className="application-account-selection">{value === type ? <><Check size={18} /> Selected</> : 'Select account'}</span>
   <span className="application-account-requirements"><strong>Have these ready</strong>{['Valid Ghana Card details', 'Passport-style photograph', 'Signature photograph or scan'].map(item => <span key={item}><Check size={17} />{item}</span>)}</span>
   <span className="quick-access-fold" aria-hidden="true" />
  </label>)}</div>
 </fieldset>
}

function BranchChoices({ value, onChange }) {
 return <fieldset className="application-branches">
  <legend>Choose your preferred branch <span>(optional)</span></legend>
  <p id="branch-help">If you leave this blank, your application will be assigned to Asylum Down.</p>
  <div className="application-branch-grid">{['Asylum Down', 'Madina'].map(branch => <label className="application-branch-option" key={branch}>
   <MapPin size={24} />
   <span><strong>{branch}</strong>{branch === 'Asylum Down' && <small>Head Office</small>}</span>
   <input type="radio" name="preferred_branch" value={branch} checked={value === branch} onChange={onChange} aria-label={branch} aria-describedby="branch-help" />
  </label>)}</div>
 </fieldset>
}

function Upload({field,file,onChange}) {
 const [error,setError]=useState('')
 const [url,setUrl]=useState('')
 useEffect(()=>{ if(!file){setUrl('');return} const value=URL.createObjectURL(file);setUrl(value);return()=>URL.revokeObjectURL(value) },[file])
 const input=useRef(null)
 async function choose(event){
  const selected=event.target.files?.[0];if(!selected)return
  let message=imageError(selected)
  if(!message){try{const bitmap=await createImageBitmap(selected);bitmap.close()}catch{message='This image cannot be read. Choose another JPG or PNG.'}}
  setError(message);onChange(message?null:selected);if(message)event.target.value=''
 }
 return <div className="application-upload"><label htmlFor={field[0]}>{field[1]} {field[2]?'(required)':'(optional)'}</label><small>Clear JPG or PNG, up to 2 MB.</small><input ref={input} id={field[0]} type="file" accept="image/jpeg,image/png" onChange={choose} aria-invalid={!!error} aria-describedby={`${field[0]}-error`} />{url&&<><img src={url} alt={`${field[1]} preview`} /><span>{file.name}</span><button className="text-link" type="button" onClick={()=>{onChange(null);input.current.value=''}}>Remove image</button></>}<span id={`${field[0]}-error`} role="alert">{error}</span></div>
}
export default function AccountApplicationForm(){
 const [step,setStep]=useState(0),[data,setData]=useState({nationality:'GHA'}),[files,setFiles]=useState({}),[error,setError]=useState('')
 const form=useRef(null),heading=useRef(null)
 const [confirmClear,setConfirmClear]=useState(false)
 const clearButton=useRef(null),cancelClearButton=useRef(null),clearDialog=useRef(null)
 useEffect(()=>{
  if(!confirmClear)return
  const dialog=clearDialog.current
  const previousOverflow=document.body.style.overflow
  dialog.showModal()
  cancelClearButton.current?.focus()
  document.body.style.overflow='hidden'
  return()=>{dialog.close();document.body.style.overflow=previousOverflow}
 },[confirmClear])
 function cancelClear(){setConfirmClear(false);clearButton.current?.focus()}
 function clearForm(){setData({nationality:'GHA'});setFiles({});setConfirmClear(false);go(0);heading.current?.focus()}
 useEffect(()=>{heading.current?.focus()},[step])
 function go(index){setError('');setStep(index)}
 function next(event){event.preventDefault();if(step===4||!form.current.reportValidity())return
  const today=new Date();const date=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  if(step===1&&data.ghana_card_expiry_date<date){setError('Your Ghana Card has expired. Please use a valid card.');return}
  if(step===3){const missing=images.find(field=>field[2]&&!files[field[0]]);if(missing){setError(`Please add your ${missing[1].toLowerCase()}.`);return}if(!requestFits(data,files)){setError('The complete request must fit within 9 MB. Please use smaller images.');return}}
  go(step+1)
 }
 function update(event){const {name,value}=event.target;setData(previous=>({...previous,[name]:value}))}
 return <section className="section application-preview"><div className="shell form-shell">
 <div className="application-notice" role="note"><strong>Test form — submissions are disabled</strong><p>Use fictional details and sample images only. Nothing is sent or saved. Refreshing or leaving this form clears your entries.</p></div>
 <p className="eyebrow">OPEN AN ACCOUNT</p><h1>Let’s take the first step.</h1><p>Complete your application in a few clear steps. When submissions become available, RapidLink will review your request after Ghana Card verification. Completing this form does not open an account.</p>
 <ol className="application-progress" aria-label="Application progress">{steps.map((label,index)=><li key={label} aria-current={index===step?'step':undefined}><span>{index+1}</span>{label}</li>)}</ol>
 <form ref={form} onSubmit={next} className="account-form"><h2 ref={heading} tabIndex="-1">{step+1}. {steps[step]}</h2>
 {step===0&&<><AccountChoices value={data.account_type} onChange={update} /><BranchChoices value={data.preferred_branch} onChange={update} /></>}
 {step>0&&step<3&&<><p>Fields marked * are required. Other fields are optional.</p><div className="form-grid">{fields.filter(field=>field[2]===step&&!['account_type','preferred_branch'].includes(field[0])).map(([name,label,,required,options,type='text',maxLength,pattern])=>{const props={id:name,name,required,value:data[name]||'',onChange:update,maxLength:maxLength||undefined,pattern:pattern||undefined};return <div className="application-field" key={name}><label htmlFor={name}>{label}{required?' *':' (optional)'}</label>{options?<select {...props}><option value="">Select an option</option>{options.map(option=><option key={option} value={option}>{option.charAt(0).toUpperCase()+option.slice(1)}</option>)}</select>:type==='textarea'?<textarea {...props} rows={3}/>:<input {...props} type={type}/>}</div>})}</div></>}
 {step===3&&<><p>Add a passport-style photograph and a photo or scan of your signature. Ghana Card images are optional. Use sample images while testing.</p><div className="form-grid">{images.map(field=><Upload key={field[0]} field={field} file={files[field[0]]} onChange={file=>setFiles(previous=>({...previous,[field[0]]:file}))}/>)}</div></>}
 {step===4&&<><p>Check your entries. Choose Edit to correct a section.</p>{steps.slice(0,4).map((label,index)=><section className="application-review" key={label}><div><h3>{label}</h3><button type="button" className="text-link" onClick={()=>go(index)}>Edit {label.toLowerCase()}</button></div><dl>{index<3?fields.filter(field=>field[2]===index).map(([name,label])=><div key={name}><dt>{label}</dt><dd>{data[name]||'Not provided'}</dd></div>):images.map(([name,label])=><div key={name}><dt>{label}</dt><dd>{files[name]?.name||'Not provided'}</dd></div>)}</dl></section>)}<div className="application-notice"><strong>What happens when submissions are enabled?</strong><p>You will first agree to approved terms and a privacy notice. Once received, your application will have a reference number and, when available, a Ghana Card verification link valid for 24 hours. RapidLink’s officers then review your request and contact you with the outcome.</p><p>The secure API connection and approved consent wording are still pending. This test cannot submit an application.</p></div><button className="button" type="button" disabled>Submission unavailable in this test</button></>}
 {error&&<p className="application-error" role="alert">{error}</p>}<div className="form-actions">{step>0&&<button type="button" className="button button-secondary" onClick={()=>go(step-1)}>Back</button>}{step<4&&<button className="button" type="submit">{step===3?'Review application':'Continue'}</button>}<button ref={clearButton} className="text-link" type="button" aria-expanded={confirmClear} aria-controls="clear-form-confirmation" onClick={()=>setConfirmClear(true)}>Clear form</button></div>
 {createPortal(<dialog ref={clearDialog} id="clear-form-confirmation" className="application-clear-dialog" aria-labelledby="clear-form-title" aria-describedby="clear-form-description" onCancel={event=>{event.preventDefault();cancelClear()}} onClick={event=>{if(event.target===event.currentTarget)cancelClear()}}><div className="application-clear-content"><h2 id="clear-form-title">Clear this form?</h2><p id="clear-form-description">This will remove all your entries and images.</p><div className="form-actions"><button ref={cancelClearButton} type="button" className="button button-secondary" onClick={cancelClear}>Keep my entries</button><button type="button" className="button" onClick={clearForm}>Yes, clear form</button></div></div></dialog>,document.body)}
 </form>
 </div></section>
}
