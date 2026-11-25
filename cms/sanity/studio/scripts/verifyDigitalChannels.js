import { deepStrictEqual, ok } from 'node:assert'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)))
const { digitalChannelsPage: page }=await import(pathToFileURL(resolve(root,'src/content/digitalChannels.js')).href)
const client=getCliClient({apiVersion:'2026-11-14'})
const record=await client.fetch('*[_id == "rapidlink-digital-channels-page"][0]{title,description,bannerAlt,"banner":bannerImage.asset->url,channels[]{"id":_key,title,description,imageAlt,link,isPublished,"image":image.asset->url}}',{}, {perspective:'published'})
ok(record,'Published page is missing')
for(const field of ['title','description','bannerAlt'])deepStrictEqual(record[field],page[field])
ok(record.banner?.startsWith('https://cdn.sanity.io/images/'))
deepStrictEqual(record.channels.map(({image,...channel})=>({...channel,link:channel.link || ''})),page.channels.map(({image,...channel})=>channel))
ok(record.channels.every(channel=>channel.image?.startsWith('https://cdn.sanity.io/images/')))
console.log('Verified: published page matches the current fallback, all five cards and all six images are present.')
