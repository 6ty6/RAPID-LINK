import {readFile} from 'node:fs/promises'
import {resolve,basename} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)))
const {calculatorPage}=await import(pathToFileURL(resolve(root,'src/content/calculatorPage.js')).href)
for(const field of ['heroImage','cardImage'])await readFile(resolve(root,'public',calculatorPage[field].replace(/^\//,'')))
console.log('Prepared current calculator page wording, banner and homepage card. Pricing settings will not be changed.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(calculatorPage,null,2));process.exit(0)}
const {getCliClient}=await import('sanity/cli')
const client=getCliClient({apiVersion:'2026-11-14'})
const id='rapidlink-loan-calculator-page'
if((await client.getDocuments([id,`drafts.${id}`])).some(Boolean)){console.log('Existing page or draft found; nothing overwritten.');process.exit(0)}
const document={_id:id,_type:'loanCalculatorPage',...calculatorPage}
for(const field of ['heroImage','cardImage']){
 const path=calculatorPage[field]
 const asset=await client.assets.upload('image',await readFile(resolve(root,'public',path.replace(/^\//,''))),{filename:basename(path),label:'RapidLink calculator page migration'})
 document[field]={_type:'image',asset:{_type:'reference',_ref:asset._id}}
}
await client.createIfNotExists(document)
console.log('Imported calculator page and homepage card. Existing pricing, approvals and drafts were not modified.')
