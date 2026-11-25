import {createServer} from 'node:http'
import {readFile,stat} from 'node:fs/promises'
import {resolve,relative,extname,sep} from 'node:path'
import {pathToFileURL} from 'node:url'
import {remainingCms} from '../src/content/remainingCms.js'
import {newsArticles} from '../src/content.js'

export const contentSecurityPolicy="default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://04unhu7g.apicdn.sanity.io https://04unhu7g.api.sanity.io https://cdn.sanity.io; frame-src https://www.google.com https://maps.google.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests"
const pages=new Set(['/','/home','/apply-loan','/open-account','/institutional-profile','/board-of-directors','/digital-channels','/rates','/rate-chart','/loan-calculator','/faqs','/stories','/rapidlink-careers','/content-management','/cms','/accept-invite','/career-management','/contact'])
const bundledRoutes=new Set([...remainingCms.products.content.map(item=>`/${item.slug}`),...newsArticles.map(item=>`/stories/${item.slug}`)])
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.ico':'image/x-icon','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4'}

export function publishedRouteProvider({fetcher=fetch,now=Date.now,source=process.env.VITE_CONTENT_SOURCE||'sanity',project=process.env.VITE_SANITY_PROJECT_ID||'04unhu7g',dataset=process.env.VITE_SANITY_DATASET||'production'}={}){
 let cached=null,checkedAt=-Infinity,pending=null,unavailable=false
 const offline=()=>Object.assign(Error('Public route service is unavailable.'),{routes:cached})
 if(!/^[a-z0-9-]+$/.test(project)||!/^[a-zA-Z0-9_-]+$/.test(dataset))throw Error('Invalid public Sanity configuration.')
 const query='*[_type in ["publicProduct","newsArticle"] && isPublished == true]{_type,"slug":select(_type == "newsArticle" => slug.current,slug)}'
 return async()=>{
  if(source==='local')return bundledRoutes
  if(now()-checkedAt<5000){if(cached&&!unavailable)return cached;throw offline()}
  if(pending)return pending
  pending=(async()=>{
   try{
    for(const host of ['api','apicdn']){
     try{
      const url=`https://${project}.${host}.sanity.io/v2026-11-14/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}`
      const response=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(5000)})
      if(!response.ok)throw Error('Public content read failed.')
      const {result}=await response.json()
      if(!Array.isArray(result))throw Error('Invalid public routes.')
      const routes=new Set(result.filter(item=>typeof item.slug==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)).map(item=>item._type==='newsArticle'?`/stories/${item.slug}`:`/${item.slug}`))
      cached=routes;unavailable=false;return routes
     }catch{/* Retry the CDN without credentials. */}
    }
    // During an outage retain known routes, but do not falsely confirm a missing page.
    unavailable=true;throw offline()
   }finally{checkedAt=now();pending=null}
  })()
  return pending
 }
}

export function createSiteServer({directory=resolve('dist'),getPublishedRoutes=publishedRouteProvider()}={}){
 const root=resolve(directory)
 return createServer(async(req,res)=>{
  res.setHeader('Content-Security-Policy',contentSecurityPolicy)
  res.setHeader('X-Content-Type-Options','nosniff')
  res.setHeader('X-Frame-Options','DENY')
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  const send=(status,body,type='text/html; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:body)}
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return send(405,'Method not allowed.','text/plain')}
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)
   if(pathname.includes('\0')||pathname.includes('\\')||pathname.split('/').some(part=>part.startsWith('.')))return send(404,'Not found.','text/plain')
   const filename=resolve(root,pathname.replace(/^\//,'')),within=relative(root,filename)
   if(within==='..'||within.startsWith(`..${sep}`)||within.includes(':'))return send(404,'Not found.','text/plain')
   const file=await stat(filename).catch(()=>null)
   if(file?.isFile()){
    const body=await readFile(filename)
    res.writeHead(200,{'Content-Type':mime[extname(filename).toLowerCase()]||'application/octet-stream','Cache-Control':/^\/assets\/.+-[A-Za-z0-9_-]{8}\.(js|css|mjs)$/.test(pathname)?'public, max-age=31536000, immutable':'no-cache'})
    return res.end(req.method==='HEAD'?undefined:body)
   }
   const route=pathname.replace(/\/$/,'')||'/'
   let status=200
   if(!pages.has(route)){
    try{status=(await getPublishedRoutes()).has(route)?200:404}
    catch(error){status=error.routes?.has(route)||bundledRoutes.has(route)?200:503}
   }
   if(status===503){res.setHeader('Retry-After','5');return send(503,'Page information is temporarily unavailable. Please try again shortly.','text/plain; charset=utf-8')}
   return send(status,await readFile(resolve(root,'index.html')))
  }catch(error){return send(error instanceof URIError?400:500,error instanceof URIError?'Invalid address.':'The page could not be served.','text/plain; charset=utf-8')}
 })
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 await stat(resolve('dist/index.html'))
 const server=createSiteServer()
 server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log('RapidLink website server started.'))
}
