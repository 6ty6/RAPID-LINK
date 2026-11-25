import {deepStrictEqual,ok} from 'node:assert'
import {resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {getCliClient} from 'sanity/cli'
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)))
const {calculatorPage}=await import(pathToFileURL(resolve(root,'src/content/calculatorPage.js')).href)
const client=getCliClient({apiVersion:'2026-11-14'})
const record=await client.fetch('*[_id == "rapidlink-loan-calculator-page"][0]{...,"heroImage":heroImage.asset->url,"cardImage":cardImage.asset->url}',{}, {perspective:'published'})
ok(record,'Published calculator page missing')
for(const [key,value] of Object.entries(calculatorPage)){
 if(['heroImage','cardImage'].includes(key))ok(record[key]?.startsWith('https://cdn.sanity.io/images/'))
 else deepStrictEqual(record[key],value,`Current content mismatch: ${key}`)
}
console.log('Verified all page/card fields against the current fallback and both uploaded images.')
