import useSanityContent from './useSanityContent.js'
import {querySanity} from '../services/content/sanityContentRepository.js'
import {remainingCms} from '../content/remainingCms.js'
import {projection,completeContent} from '../content/cmsModelUtils.js'
const loaders=Object.fromEntries(Object.entries(remainingCms).map(([key,model])=>[key,async()=>{
 const sample=model.collection?model.content[0]:model.content
 const filter=model.collection?`_type == "${model.schema}" && isPublished == true`:`_id == "${model.id}" && _type == "${model.schema}"`
 const rows=await querySanity(`*[${filter}]${model.collection?' | order(displayOrder asc)':''}{${projection(sample)}}`)
 if(model.collection)return rows.map(row=>completeContent(row,model.content.find(item=>item.slug===row.slug)||sample))
 if(!rows[0])throw Error(`${model.title} is not published.`)
 return completeContent(rows[0],sample)
}]))
export default function usePageContent(key){
 const model=remainingCms[key]
 return useSanityContent(`page-${key}`,loaders[key],model.content)
}
