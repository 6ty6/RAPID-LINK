import {useId} from 'react'
import {useFormValue} from 'sanity'
import {getFieldHelp} from './editorHelpText.js'
import {getImageGuidance,getImageDimensions,imageFileAdvice} from './imageGuidelines.js'
import './editor-help.css'

export function EditorFieldHelp(props){
 const id=useId()
 const document=useFormValue([])||{}
 const help=getFieldHelp({document,path:props.path,name:props.name,schemaType:props.schemaType})
 const imageGuide=getImageGuidance(document,props.path||[])
 const dimensions=imageGuide?getImageDimensions(props.value):null
 const details=[help,imageGuide?`${imageGuide.placement}. ${imageGuide.display} ${imageFileAdvice}`:''].filter(Boolean).join(' ')
 if(!help&&!imageGuide)return props.renderDefault(props)
 return <div className="cms-help-field">
  {details&&<details className="cms-field-help"><summary title={details} aria-label={`Help for ${props.schemaType.title || props.name}`} aria-describedby={id}>i</summary><p id={id}>{details}</p></details>}
  {imageGuide&&<aside className="cms-image-size-strip" aria-label={`Image size guidance for ${props.schemaType.title || props.name}`} style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'6px 20px',padding:'10px 14px',marginBottom:12,borderRadius:8,borderLeft:'3px solid #ff7400',background:'#eef3ff',color:'#102b46',fontFamily:'system-ui, sans-serif',fontSize:13,lineHeight:1.5}}>
   <span>Recommended: <strong style={{display:'inline',fontWeight:700}}>{imageGuide.width} × {imageGuide.height} px</strong> <span style={{color:'#526782'}}>({imageGuide.ratio})</span></span>
   <span style={{color:'#526782'}}>Selected: <strong style={{display:'inline',fontWeight:600}}>{dimensions?`${dimensions.width} × ${dimensions.height} px`:'No image'}</strong></span>
  </aside>}
  {props.renderDefault({...props,description:imageGuide?undefined:help})}
 </div>
}

export const helpIcon = text => function SectionHelpIcon(){
 return <svg viewBox="0 0 24 24" width="1em" height="1em" role="img" aria-label={text} tabIndex={0}><title>{text}</title><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 11v6m0-10v1" stroke="currentColor" strokeWidth="2"/></svg>
}
