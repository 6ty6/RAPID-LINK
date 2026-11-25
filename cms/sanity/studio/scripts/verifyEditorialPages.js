import {deepStrictEqual,ok} from 'node:assert'
import {resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {getCliClient} from 'sanity/cli'
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)))
const {remainingCms}=await import(pathToFileURL(resolve(root,'src/content/remainingCms.js')).href)
const {projection,isMedia}=await import(pathToFileURL(resolve(root,'src/content/cmsModelUtils.js')).href)
const client=getCliClient({apiVersion:'2026-11-14'})
function check(actual,expected,key=''){
 if(isMedia(key,expected)){ok(/^https:\/\/cdn\.sanity\.io\/(images|files)\/04unhu7g\/production\//.test(actual),`Missing media: ${key}`);return}
 if(Array.isArray(expected)){deepStrictEqual(actual.length,expected.length,`Array length: ${key}`);expected.forEach((entry,index)=>check(actual[index],entry,key));return}
 if(expected&&typeof expected==='object'){for(const [child,value]of Object.entries(expected))check(actual?.[child],value,child);return}
 deepStrictEqual(actual,expected,`Content mismatch: ${key}`)
}
const only=process.argv.find(value=>value.startsWith('--only='))?.slice(7)
for(const [key,model]of Object.entries(remainingCms).filter(([key])=>!only||only.split(',').includes(key))){
 for(const [index,row]of (model.collection?model.content:[model.content]).entries()){
  const id=model.collection?`rapidlink-${key}-${row.slug||index}`:model.id
  const result=await client.fetch(`*[_id == $id][0]{${projection(row)}}`,{id},{perspective:'published'})
  ok(result,`Missing ${id}`);check(result,row)
  console.log(`Verified current content and media: ${id}`)
 }
}
