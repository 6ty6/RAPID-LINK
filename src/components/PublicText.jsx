export default function PublicText({value=[]}){
 return value.map((block,index)=><p key={block._key||index}>{(block.children||[]).map((span,i)=>{
  let text=span.text
  if(span.marks?.includes('em'))text=<em>{text}</em>
  if(span.marks?.includes('strong'))text=<strong>{text}</strong>
  return <span key={span._key||i}>{text}</span>
 })}</p>)
}
