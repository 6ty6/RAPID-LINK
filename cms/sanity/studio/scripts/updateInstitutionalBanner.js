// Deliberate one-off artwork update. Preserve all published/draft wording.
import {readFile} from 'node:fs/promises'
import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-11-14'})
const id='rapidlink-institutional-page'
const [published,draft]=await client.getDocuments([id,`drafts.${id}`])
if(!published)throw Error('The published Institutional Profile page is missing.')
if(draft && draft.hero?.image?.asset?._ref!==published.hero?.image?.asset?._ref)throw Error('A different banner is being edited in a draft. Preserved both records without changes.')
const path=new URL('../../../../public/assets/about-us-community-v1.webp',import.meta.url)
const asset=await client.assets.upload('image',await readFile(path),{filename:'about-us-community-v1.webp',contentType:'image/webp',label:'Original AI-generated Ghanaian community banner; background only, no text'})
const image={_type:'image',asset:{_type:'reference',_ref:asset._id}}
let transaction=client.transaction().patch(id,patch=>patch.ifRevisionId(published._rev).set({'hero.image':image,'hero.position':'right center'}))
if(draft){
 const changes={'hero.image':image}
 if(draft.hero?.position===published.hero?.position)changes['hero.position']='right center'
 transaction=transaction.patch(draft._id,patch=>patch.ifRevisionId(draft._rev).set(changes))
}
await transaction.commit()
const result=await client.fetch('*[_id == $id][0]{hero}',{id},{perspective:'published'})
if(result.hero.title!==published.hero.title||result.hero.intro!==published.hero.intro||result.hero.image.asset._ref!==asset._id)throw Error('Banner verification failed.')
console.log('Updated and verified only the banner artwork/position; published and draft wording preserved.')
