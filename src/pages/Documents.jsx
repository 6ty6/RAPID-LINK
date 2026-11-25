import {useState} from 'react'
import {PageHero} from '../components/Shared.jsx'
import {DocumentDialog} from './Products.jsx'
import usePublicDocuments from '../hooks/usePublicDocuments.js'
import {documentDownloadUrl} from '../content/documents.js'

export default function Documents(){
 const {data,loading,error}=usePublicDocuments()
 const [category,setCategory]=useState('All documents')
 const [query,setQuery]=useState('')
 const [selectedId,setSelectedId]=useState(null)
 const documents=data.filter(item=>item.showInLibrary)
 const shown=documents.filter(item=>(category==='All documents'||category===item.category)&&`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()))
 const selected=documents.find(item=>item.id===selectedId)
 return <>
  <PageHero eyebrow="Public information" title="Documents & downloads" intro="View and download RapidLink’s published documents."/>
  <section className="section"><div className="shell narrow">
   <div className="document-filters"><label>Search documents<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by title or description"/></label><label>Category<select value={category} onChange={event=>setCategory(event.target.value)}>{['All documents',...new Set(documents.map(item=>item.category))].map(name=><option key={name}>{name}</option>)}</select></label></div>
   {loading?<p role="status">Loading documents…</p>:error?<p role="alert">Documents are temporarily unavailable. Please try again later.</p>:!shown.length?<p role="status">{documents.length?'No documents match your search.':'There are no published documents available here yet.'}</p>:<div className="public-documents">{shown.map(item=><article className="public-document" key={item.id}>
    <div><p className="eyebrow">{item.category}</p><h2>{item.title}</h2>{item.description&&<p>{item.description}</p>}<p className="document-meta">{item.extension.toUpperCase()}{item.version&&` · ${item.version}`}{item.documentDate&&` · ${item.documentDate}`}</p></div>
    <div className="button-row"><button className="button" type="button" onClick={()=>setSelectedId(item.id)} aria-label={`View ${item.title}`}>{item.extension==='pdf'?'View document':'File details'}</button><a className="button button-secondary" href={documentDownloadUrl(item.file,`${item.slug}.${item.extension}`)} download aria-label={`Download ${item.title}`}>Download {item.extension.toUpperCase()}</a></div>
   </article>)}</div>}
   {selected&&<DocumentDialog key={selected.id+selected.file} title={`${selected.title}${selected.version?` — ${selected.version}`:''}`} file={selected.file} filename={`${selected.slug}.${selected.extension}`} onClose={()=>setSelectedId(null)}/>}
  </div></section>
 </>
}
