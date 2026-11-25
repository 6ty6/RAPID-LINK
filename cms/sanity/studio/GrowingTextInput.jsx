import {useLayoutEffect,useRef} from 'react'
import {set,unset} from 'sanity'
import './editor-help.css'

const compactFields=new Set(['id','slug','href','link','to','aboutLink','whatsappUrl','externalLink','applicationEmail','email'])

function TextField({value='',onChange,elementProps={},schemaType}){
 const input=useRef(null)
 const expanded=schemaType.name==='text'||value.length>80||value.includes('\n')
 useLayoutEffect(()=>{
  const node=input.current
  if(!node)return
  node.style.height='auto'
  node.style.height=`${Math.min(node.scrollHeight,360)}px`
 },[value,expanded])
 return <textarea {...elementProps} className="cms-growing-text" value={value} rows={expanded?3:1}
  ref={node=>{
   input.current=node
   if(typeof elementProps.ref==='function')elementProps.ref(node)
   else if(elementProps.ref)elementProps.ref.current=node
  }}
  onChange={event=>onChange(event.currentTarget.value?set(event.currentTarget.value):unset())}/>
}

export default function GrowingTextInput(props){
 const {schemaType,path=[],readOnly}=props
 const name=path.filter(part=>typeof part==='string').at(-1)
 if(!['string','text'].includes(schemaType.name)||schemaType.options?.list||compactFields.has(name)||readOnly)return props.renderDefault(props)
 return <TextField {...props}/>
}
