import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { CmsStore } from './store.mjs'
import { createServer, loadConfig, demoStaff, verifyUser } from './server.mjs'
import { backupCms, verifyBackup } from './backup.mjs'
import { verifiedCalculatorData } from '../../tests/fixtures/calculator.mjs'

test('production rejects demo auth, self registrations and sessions without verified MFA', async () => {
  assert.throws(() => loadConfig({CMS_DEMO:'true',NODE_ENV:'production'}), /cannot run/)
  const originalFetch=globalThis.fetch
  const config={demo:false,authUrl:'https://auth.example',key:'public-test-key',requireMfa:true}
  const token=aal=>`header.${Buffer.from(JSON.stringify({aal})).toString('base64url')}.signature`
  try {
    globalThis.fetch=async (_url,options)=>{assert.equal(options.headers.apikey,'public-test-key');return new Response(JSON.stringify({id:demoStaff[1].user_id,invited_at:'2026-11-20'}))}
    await assert.rejects(verifyUser(token('aal1'),config),/multi-factor/)
    assert.equal(await verifyUser(token('aal2'),config),demoStaff[1].user_id)
    globalThis.fetch=async ()=>new Response(JSON.stringify({id:demoStaff[1].user_id}))
    await assert.rejects(verifyUser(token('aal2'),config),/invitation-only/)
    globalThis.fetch=async ()=>new Response('{}',{status:401})
    await assert.rejects(verifyUser(token('aal2'),config),/no longer valid/)
  } finally {globalThis.fetch=originalFetch}
})

test('public calculator releases omit internal approval references and verification examples',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'rapidlink-calculator-api-'))
  const config=loadConfig({CMS_DEMO:'true',CMS_DATA_DIR:dir}),store=new CmsStore(':memory:',demoStaff)
  const server=createServer({store,config})
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  try {
    const credit=demoStaff[3].user_id,admin=demoStaff[0].user_id
    let entry=store.save(credit,{kind:'calculator',slug:'loan-calculator-settings',title:'Synthetic calculator',department:'Credit',version:0,data:verifiedCalculatorData()})
    entry=store.action(credit,entry.id,'submit',entry.version);entry=store.action(admin,entry.id,'approve',entry.version);store.action(admin,entry.id,'publish',entry.version)
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/cms/public`)
    const record=(await response.json()).records[0]
    assert.equal(record.data.monthlyFlatRate,6);assert.equal(record.data.approvalReference,undefined);assert.equal(record.data.verificationCases,undefined)
    assert.equal(store.export(admin).releases[0].data.verificationCases.length,3)
  } finally {await new Promise(resolve=>server.close(resolve));store.close();rmSync(dir,{recursive:true,force:true})}
})

test('HTTP authorisation, workflow, CORS, public image privacy and sanitisation', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'rapidlink-cms-http-'))
  const config = loadConfig({ CMS_DEMO: 'true', CMS_DATA_DIR: dir })
  const store = new CmsStore(join(dir, 'cms.sqlite'), demoStaff)
  const server = createServer({ store, config })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}/api/cms`
  async function request(path, { account, method = 'GET', data, origin = config.origin, raw, headers = {} } = {}) {
    return fetch(base + path, { method, headers: { Origin: origin, ...(account ? { Authorization: `Bearer demo:${account}` } : {}), ...(data ? {'Content-Type':'application/json'} : {}), ...headers }, body: raw || (data ? JSON.stringify(data) : undefined) })
  }
  try {
    assert.equal((await request('/entries')).status, 401)
    assert.equal((await request('/entries', {account: demoStaff[0].user_id, origin: 'https://wrong.example'})).status, 403)
    const writer = demoStaff[1].user_id, approver = demoStaff[2].user_id
    const png = await sharp({create:{width:4,height:4,channels:3,background:'#fe8700'}}).png().toBuffer()
    const uploaded = await request('/media', { account: writer, method:'POST', raw:png, headers:{'Content-Type':'image/png','X-CMS-Department':'Marketing/Sales','X-CMS-Label':'test.png'} })
    assert.equal(uploaded.status, 201)
    const media = await uploaded.json()
    assert.equal((await request(`/media/${media.id}`)).status, 401)
    assert.equal((await request(`/media/${media.id}`, {account: writer})).headers.get('content-type'), 'image/webp')
    assert.equal((await request('/media', {account:writer,method:'POST',raw:Buffer.from('<svg/>'),headers:{'Content-Type':'image/png','X-CMS-Department':'Marketing/Sales'}})).status, 400)
    let entry = await (await request('/entries', {account:writer,method:'POST',data:{kind:'slide',title:'Synthetic flyer',slug:'synthetic-flyer',department:'Marketing/Sales',version:0,data:{image:`media:${media.id}`,imageAlt:'Synthetic orange test image',link:'/contact',order:0}}})).json()
    assert.ok(entry.id)
    assert.equal((await (await request('/public')).json()).records.length, 0)
    async function action(account, name) { const response = await request(`/entries/${entry.id}/action`, {account,method:'POST',data:{action:name,version:entry.version}}); assert.equal(response.status,200,await response.clone().text()); entry=await response.json() }
    await action(writer,'submit')
    assert.equal((await request(`/entries/${entry.id}/action`,{account:writer,method:'POST',data:{action:'approve',version:entry.version}})).status,403)
    await action(approver,'approve'); await action(approver,'publish')
    const published = (await (await request('/public')).json()).records
    assert.equal(published.length,1); assert.equal(published[0].created_by,undefined)
    assert.equal((await request(`/media/${media.id}`)).status,200)
    await action(approver,'unpublish')
    assert.equal((await request(`/media/${media.id}`)).status,401)
    assert.equal((await request('/export',{account:writer})).status,403)
  } finally { await new Promise(resolve => server.close(resolve)); store.close(); rmSync(dir,{recursive:true,force:true}) }
})

test('complete backup can be restored into a separate data directory', async () => {
  const dir=mkdtempSync(join(tmpdir(),'rapidlink-cms-backup-')), source=join(dir,'source'), destination=join(dir,'backup')
  const { mkdirSync,writeFileSync } = await import('node:fs'); mkdirSync(join(source,'media'),{recursive:true})
  const store = new CmsStore(join(source,'cms.sqlite'),demoStaff)
  store.save(demoStaff[1].user_id,{kind:'faq',title:'Backup question',slug:'backup-question',department:'Marketing/Sales',version:0,data:{answer:'A retained draft.'}})
  writeFileSync(join(source,'media','example.webp'),'synthetic-test-file')
  try {
    await backupCms(source,destination)
    assert.equal(verifyBackup(destination),true)
    assert.ok(JSON.parse(readFileSync(join(destination,'manifest.json'))).checksums['cms.sqlite'])
    const restored = join(dir,'restored'); cpSync(destination,restored,{recursive:true})
    const reopened=new CmsStore(join(restored,'cms.sqlite'))
    assert.equal(reopened.entries(demoStaff[0].user_id)[0].title,'Backup question'); reopened.close()
    assert.equal(readFileSync(join(restored,'media','example.webp'),'utf8'),'synthetic-test-file')
    writeFileSync(join(destination,'media','example.webp'),'modified-test-file')
    assert.throws(()=>verifyBackup(destination),/checksum failed/)
    await assert.rejects(backupCms(source,source),/outside/)
  } finally {store.close();rmSync(dir,{recursive:true,force:true})}
})
