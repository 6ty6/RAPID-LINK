import {readFile} from 'node:fs/promises'
import {resolve,basename} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)))
const {remainingCms}=await import(pathToFileURL(resolve(root,'src/content/remainingCms.js')).href)
const {isMedia,isFile}=await import(pathToFileURL(resolve(root,'src/content/cmsModelUtils.js')).href)
const only=process.argv.find(value=>value.startsWith('--only='))?.slice(7)
const models=Object.entries(remainingCms).filter(([key])=>!only||only.split(',').includes(key))
if(!models.length)throw Error('Unknown migration stage')
const assets=new Map()
async function preflight(value){
 for(const [key,item]of Object.entries(value)){
  if(isMedia(key,item)){await readFile(resolve(root,'public',item.slice(1)));assets.set(item,null)}
  else if(item&&typeof item==='object')await preflight(item)
 }
}
for(const [key,model]of models){await preflight(model.content);console.log(`${key}: ${model.collection?model.content.length:1} current public record(s)`)}
console.log(`Verified ${assets.size} existing local media files.`)
if(process.argv.includes('--dry-run')){console.log('Dry run complete. No data or assets changed.');process.exit(0)}
const {getCliClient}=await import('sanity/cli')
const client=getCliClient({apiVersion:'2026-11-14'})
async function upload(path){
 if(assets.get(path))return assets.get(path)
 const asset=await client.assets.upload(isFile(path)?'file':'image',await readFile(resolve(root,'public',path.slice(1))),{filename:basename(path),label:'RapidLink editorial migration'})
 const reference={_type:isFile(path)?'file':'image',asset:{_type:'reference',_ref:asset._id}}
 assets.set(path,reference);return reference
}
async function convert(value,name){
 const record={}
 for(const [key,item]of Object.entries(value)){
  if(key==='body'){record[key]=structuredClone(item);continue}
  if(isMedia(key,item)){record[key]=await upload(item);continue}
  if(Array.isArray(item)){
   record[key]=[]
   for(const [index,entry]of item.entries())record[key].push(entry&&typeof entry==='object'?{_key:entry.id||entry.slug||`item-${index}`,_type:`${name}${key}Item`,...await convert(entry,name+key)}:entry)
  }else record[key]=item&&typeof item==='object'?await convert(item,name+key):item
 }
 return record
}
for(const [key,model]of models){
 const rows=model.collection?model.content:[model.content]
 for(const [index,row]of rows.entries()){
  const id=model.collection?`rapidlink-${key}-${row.slug||index}`:model.id
  if((await client.getDocuments([id,`drafts.${id}`])).some(Boolean)){console.log(`Kept existing page/draft: ${id}`);continue}
  await client.createIfNotExists({_id:id,_type:model.schema,...await convert(row,key)})
  console.log(`Imported ${id}`)
 }
}
