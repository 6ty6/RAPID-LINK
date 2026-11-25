import { readFile } from 'node:fs/promises'
import { resolve, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)))
const { digitalChannelsPage: page }=await import(pathToFileURL(resolve(root,'src/content/digitalChannels.js')).href)
const id='rapidlink-digital-channels-page'
const paths=[page.bannerImage,...page.channels.map(channel=>channel.image)]
for(const path of paths) await readFile(resolve(root,'public',path.replace(/^\//,'')))
console.log(`Prepared ${page.title}: existing banner and ${page.channels.length} current service cards.`)
if(process.argv.includes('--dry-run')) {
  console.log(JSON.stringify(page,null,2))
  console.log('Dry run: no assets uploaded and no Sanity records changed.')
  process.exit(0)
}
const {getCliClient}=await import('sanity/cli')
const client=getCliClient({apiVersion:'2026-11-14'})
const existing=await client.getDocuments([id,`drafts.${id}`])
if(existing.some(Boolean)) {
  console.log('An existing published page or draft was found. No record was overwritten. Edit it in Studio.')
  process.exit(0)
}
async function upload(path) {
  const asset=await client.assets.upload('image',await readFile(resolve(root,'public',path.replace(/^\//,''))),{filename:basename(path),label:'RapidLink Digital Channels migration'})
  return {_type:'image',asset:{_type:'reference',_ref:asset._id}}
}
const bannerImage=await upload(page.bannerImage)
const channels=[]
for(const channel of page.channels) {
  const {id: key,image,...fields}=channel
  const record={_type:'digitalChannel',_key:key,...fields,image:await upload(image)}
  if(!record.link) delete record.link
  channels.push(record)
}
await client.createIfNotExists({_id:id,_type:'digitalChannelsPage',title:page.title,description:page.description,bannerAlt:page.bannerAlt,bannerImage,channels})
console.log(`Imported ${id}. Current public wording, artwork, codes, destinations and ordering preserved.`)
