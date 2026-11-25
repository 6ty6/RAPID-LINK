import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-11-14'})
const guideId='rapidlink-rate-guide',documentId='rapidlink-document-controller-rates'
const [guide,draft,existing,documentDraft]=await client.getDocuments([guideId,`drafts.${guideId}`,documentId,`drafts.${documentId}`])
if(!guide?.file?.asset?._ref)throw Error('The existing published rates PDF is missing; no records changed.')
if(documentDraft&&!existing)throw Error('A draft library record already exists. Preserved it without publishing.')
if(!existing){
 await client.createIfNotExists({_id:documentId,_type:'publicDocument',title:guide.dialogTitle||guide.title,slug:'controller-loan-rates',description:guide.description||'',category:'Loan rates',file:guide.file,isPublished:true,showInLibrary:true,displayOrder:1})
 console.log('Imported the current rates document using its existing PDF asset.')
}else console.log('Preserved the existing library document unchanged.')
const reference={_type:'reference',_ref:documentId}
let transaction=client.transaction(),changed=false
for(const record of [guide,draft].filter(Boolean)){
 if(record.rateDocument){console.log('Preserved the existing rates document selection.');continue}
 transaction=transaction.patch(record._id,patch=>patch.ifRevisionId(record._rev).set({rateDocument:reference}));changed=true
}
if(changed)await transaction.commit()
const result=await client.fetch('*[_id == $id][0]{rateDocument->{_id,title,isPublished,"file":file.asset->url}}',{id:guideId},{perspective:'published'})
if(!result?.rateDocument?.file)throw Error('The selected public rates document could not be verified.')
console.log('Verified the published rates selection resolves to a PDF. Existing wording, files and draft edits were preserved.')
