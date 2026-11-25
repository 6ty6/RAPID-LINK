import useSanityContent from './useSanityContent.js'
import {querySanity} from '../services/content/sanityContentRepository.js'
import {remainingCms} from '../content/remainingCms.js'
import {projection,completeContent} from '../content/cmsModelUtils.js'
import {newProductFallback} from '../content/productRules.js'
import {documentProjection,resolveRateDocument} from '../content/documents.js'
const loaders=Object.fromEntries(Object.entries(remainingCms).map(([key,model])=>[key,async()=>{
 const sample=model.collection?model.content[0]:model.content
 const filter=model.collection?`_type == "${model.schema}" && isPublished == true`:`_id == "${model.id}" && _type == "${model.schema}"`
 const reference=key==='rateGuide'?`,"rateDocumentSelected":defined(rateDocument),"linkedDocument":rateDocument->{${documentProjection}}`:''
 const rows=await querySanity(`*[${filter}]${model.collection?' | order(displayOrder asc)':''}{${projection(sample)}${reference}}`)
 if(model.collection)return rows.flatMap(row=>{
  const fallback=model.content.find(item=>item.slug===row.slug)||(key==='products'?newProductFallback(row):sample)
  return fallback?[completeContent(row,fallback)]:[]
 })
 if(!rows[0])throw Error(`${model.title} is not published.`)
 const page=completeContent(rows[0],sample)
 return key==='rateGuide'?resolveRateDocument(page,rows[0]):page
}]))
export default function usePageContent(key){
 const model=remainingCms[key]
 return useSanityContent(`page-${key}`,loaders[key],model.content)
}
