import {useEffect,useState} from 'react'
import {set,useClient} from 'sanity'

export default function FeaturedProductsInput({value=[],onChange,readOnly}){
 const client=useClient({apiVersion:'2026-11-14'})
 const [products,setProducts]=useState([])
 const [status,setStatus]=useState('Loading published products…')
 const [refresh,setRefresh]=useState(0)
 useEffect(()=>{
  let active=true
  client.fetch('*[_type == "publicProduct" && !(_id in path("drafts.**"))] | order(title asc){slug,title,isPublished}',{}, {perspective:'published'}).then(rows=>{
   if(active){setProducts(rows);setStatus('')}
  }).catch(()=>{if(active)setStatus('Products could not be loaded. Your saved selection is unchanged. Try Refresh products.')})
  return()=>{active=false}
 },[client,refresh])
 const update=next=>onChange(set(next))
 const move=(index,direction)=>{
  const next=[...value];[next[index],next[index+direction]]=[next[index+direction],next[index]];update(next)
 }
 return <div className="cms-product-picker">
  {status&&<p role="status">{status}</p>}
  <ol>{value.map((slug,index)=>{
   const product=products.find(item=>item.slug===slug)
   return <li key={`${slug}-${index}`}><span>{product?.title || slug}{product?.isPublished===false?' (hidden on website)':''}{!status&&!product?' (not published or deleted)':''}</span>
    <button type="button" disabled={readOnly||index===0} aria-label={`Move ${product?.title||slug} up`} onClick={()=>move(index,-1)}>↑</button>
    <button type="button" disabled={readOnly||index===value.length-1} aria-label={`Move ${product?.title||slug} down`} onClick={()=>move(index,1)}>↓</button>
    <button type="button" disabled={readOnly} aria-label={`Remove ${product?.title||slug} from homepage`} onClick={()=>update(value.filter((_,i)=>i!==index))}>Remove</button>
   </li>
  })}</ol>
  <select aria-label="Add homepage product" value="" disabled={readOnly||Boolean(status)} onChange={event=>{if(event.target.value)update([...value,event.target.value])}}>
   <option value="">Choose a published product…</option>
   {products.filter(item=>item.isPublished&&item.slug&&!value.includes(item.slug)).map(item=><option key={item.slug} value={item.slug}>{item.title}</option>)}
  </select>
  <button type="button" onClick={()=>{setStatus('Loading published products…');setRefresh(value=>value+1)}}>Refresh products</button>
 </div>
}
