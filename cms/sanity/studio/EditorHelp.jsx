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
 if(!help&&!imageGuide)return props.renderDefault(props)
 return <div className="cms-help-field">
  {help&&<details className="cms-field-help"><summary title={help} aria-label={`Help for ${props.schemaType.title || props.name}`} aria-describedby={id}>i</summary><p id={id}>{help}</p></details>}
  {imageGuide&&<aside className="cms-image-guidance" aria-label={`Image size guidance for ${props.schemaType.title || props.name}`}>
   <strong>Recommended upload: {imageGuide.width} × {imageGuide.height} px ({imageGuide.ratio})</strong>
   <p>{imageGuide.placement}. {imageGuide.display}</p>
   <p className="cms-image-current">{dimensions?`Selected image: ${dimensions.width} × ${dimensions.height} px.`:'Select or upload an image to see its actual dimensions here.'}</p>
   <small>{imageFileAdvice}</small>
  </aside>}
  {props.renderDefault({...props,description:help})}
 </div>
}

export const helpIcon = text => function SectionHelpIcon(){
 return <svg viewBox="0 0 24 24" width="1em" height="1em" role="img" aria-label={text} tabIndex={0}><title>{text}</title><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 11v6m0-10v1" stroke="currentColor" strokeWidth="2"/></svg>
}
