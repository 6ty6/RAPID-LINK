const origin=new URL(process.argv[2]||'https://rapid-link.onrender.com').origin
const failures=[]
const check=(condition,message)=>{console.log(`${condition?'PASS':'FAIL'} ${message}`);if(!condition)failures.push(message)}
try{
 const response=await fetch(origin,{signal:AbortSignal.timeout(20000)})
 check(response.ok,'Website responds successfully')
 const csp=response.headers.get('content-security-policy')||''
 const directives=new Map(csp.split(';').map(value=>value.trim().split(/\s+/)).filter(([key])=>key).map(([key,...values])=>[key,values]))
 for(const name of ['default-src','base-uri','object-src','frame-ancestors','form-action','script-src','style-src','img-src','font-src','connect-src','frame-src','worker-src'])check(directives.has(name),`CSP includes ${name}`)
 for(const endpoint of ['https://04unhu7g.api.sanity.io','https://04unhu7g.apicdn.sanity.io','https://cdn.sanity.io'])check(directives.get('connect-src')?.includes(endpoint),`CSP permits ${endpoint}`)
 const unknown=await fetch(`${origin}/deployment-check-unknown-${Date.now()}`,{signal:AbortSignal.timeout(20000)})
 check(unknown.status===404,`Unknown URL returns HTTP 404 (received ${unknown.status})`)
 console.log(`${failures.length} deployment check(s) need attention. No remote settings were changed.`)
 process.exitCode=failures.length?1:0
}catch(error){console.error(`Deployment check could not complete: ${error.message}`);process.exitCode=1}
