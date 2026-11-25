// Retire only the old account-opening availability singleton, never applications.
import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-11-14'})
const ids=['rapidlink-account-page','drafts.rapidlink-account-page']
const documents=(await client.getDocuments(ids)).filter(Boolean)
for(const document of documents){
 if(document._type!=='publicAccountPage')throw Error('Unexpected document type; nothing deleted.')
}
if(!documents.length){console.log('Old account notice already removed.');process.exit(0)}
const count=await client.fetch('count(*[references($ids)])',{ids})
if(count)throw Error('Old notice has references; review them before deletion.')
let transaction=client.transaction()
for(const document of documents)transaction=transaction.delete(document._id)
await transaction.commit()
console.log('Removed the retired account coming-soon record and any draft. Application form content is unchanged.')
