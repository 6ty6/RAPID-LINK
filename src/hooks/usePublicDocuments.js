import useSanityContent from './useSanityContent.js'
import {querySanity} from '../services/content/sanityContentRepository.js'
import {documentProjection,normalisePublicDocument} from '../content/documents.js'
async function load(){
 const rows=await querySanity(`*[_type == "publicDocument" && isPublished == true] | order(displayOrder asc,documentDate desc,title asc){${documentProjection}}`)
 return rows.map(normalisePublicDocument).filter(Boolean)
}
export default function usePublicDocuments(){return useSanityContent('public-documents',load,[],{clearOnError:true})}
