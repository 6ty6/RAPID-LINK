// @vitest-environment node
import {afterAll,beforeAll,describe,it,expect,vi} from 'vitest'
import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createSiteServer,publishedRouteProvider} from '../tools/serve-site.mjs'
let server,origin,directory
beforeAll(async()=>{
 directory=await mkdtemp(join(tmpdir(),'rapidlink-server-'))
 await writeFile(join(directory,'index.html'),'<main>Website application</main>')
 await mkdir(join(directory,'assets'))
 await writeFile(join(directory,'assets','demo.js'),'export const ready=true')
 server=createSiteServer({directory,getPublishedRoutes:async()=>new Set(['/new-cms-product','/stories/new-cms-story'])})
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 origin=`http://127.0.0.1:${server.address().port}`
})
afterAll(async()=>{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true})})
describe('production website responses',()=>{
 it('serves built pages and new published CMS routes with HTTP 200',async()=>{
  for(const path of ['/home','/loan-calculator','/new-cms-product','/stories/new-cms-story']){
   const result=await fetch(origin+path);expect(result.status).toBe(200);expect(await result.text()).toContain('Website application')
  }
 })
 it('returns the application with a real 404 for unknown pages, including HEAD',async()=>{
  const result=await fetch(origin+'/unknown-page');expect(result.status).toBe(404);expect(await result.text()).toContain('Website application')
  const head=await fetch(origin+'/unknown-page',{method:'HEAD'});expect(head.status).toBe(404);expect(await head.text()).toBe('')
 })
 it('serves assets with MIME types and blocks submissions and hidden paths',async()=>{
  const result=await fetch(origin+'/assets/demo.js');expect(result.headers.get('content-type')).toContain('text/javascript')
  expect(result.headers.get('content-security-policy')).toContain("frame-ancestors 'none'")
  expect((await fetch(origin+'/home',{method:'POST',body:'private'})).status).toBe(405)
  expect((await fetch(origin+'/.env')).status).toBe(404)
  expect((await fetch(origin+'/%ZZ')).status).toBe(400)
 })
 it('retries the CDN during API failure and refreshes routes after five seconds',async()=>{
  let time=0
  const fetcher=vi.fn().mockResolvedValueOnce({ok:false}).mockResolvedValueOnce({ok:true,json:async()=>({result:[{_type:'publicProduct',slug:'new-product'}]})})
  const routes=publishedRouteProvider({fetcher,now:()=>time,source:'sanity'})
  expect((await routes()).has('/new-product')).toBe(true)
  expect(fetcher.mock.calls[1][0]).toContain('.apicdn.sanity.io/')
  await routes();expect(fetcher).toHaveBeenCalledTimes(2)
  time=5001;fetcher.mockResolvedValue({ok:true,json:async()=>({result:[]})})
  expect((await routes()).size).toBe(0)
 })
 it('does not turn an outage into an authoritative empty catalogue',async()=>{
  const routes=publishedRouteProvider({source:'sanity',fetcher:vi.fn().mockRejectedValue(Error('offline'))})
  await expect(routes()).rejects.toThrow('unavailable')
  await expect(routes()).rejects.toThrow('unavailable')
 })
})
