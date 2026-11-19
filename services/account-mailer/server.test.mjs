import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { createMailerServer, loadConfig, RECIPIENT } from './server.mjs'
import { prepareEmail, validateApplication, cleanImage, FILE_LIMIT } from './application.mjs'

const sample = {
  product_type: 'rapid_savings', title: 'Ms', gender: 'female', first_name: 'Synthetic', last_name: 'Applicant', initial_deposit: '100.00', tin: '', dob: '1990-01-01', pob: 'Test town', marital_status: 'single', telephone: '+233200000000', spouse_name: '', pep: false,
  id_form: 'Ghana Card', id_number: 'SYNTHETIC-NOT-REAL', id_issue_authority: 'Test authority', id_expiry_date: '2030-01-01', id_issue_date: '2020-01-01', id_issue_place: 'Test town', nationality: 'Test', social_security_no: '',
  region: 'Test region', suburb: 'Test suburb', residential_digital_address: 'TEST-000', postal_address: '', nearest_landmarks: '', occupation: 'Test role', source_of_fund: 'Test source', employer_contact_person: '', employer_contact_no: '', work_nearest_landmark: '', net_income: '',
  nok_first_name: 'Synthetic', nok_surname: 'Relative', nok_relationship: 'Sibling', nok_phone_number: '+233200000001', accept_terms: true, accept_email_delivery: true,
}
const config = { enabled: true, origin: 'https://example.test', from: 'applications@example.test', privacyVersion: 'test-only' }
async function withServer(options, run) {
  const server = createMailerServer(options)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try { await run(`http://127.0.0.1:${server.address().port}`) }
  finally { await new Promise(resolve => { server.close(resolve); server.closeAllConnections() }) }
}
const png = () => sharp({ create: { width: 8, height: 8, channels: 3, background: '#fff' } }).png().toBuffer()
async function payload(data = sample) {
  const form = new FormData()
  form.append('application', JSON.stringify(data)); form.append('signature', 'Synthetic Applicant'); form.append('captcha', 'synthetic-token')
  const bytes = await png()
  for (const name of ['id_front', 'id_back', 'passport_picture']) form.append(name, new Blob([bytes], { type: 'image/png' }), 'untrusted-name.png')
  return form
}

test('disabled by default and refuses incomplete activation', () => {
  assert.equal(loadConfig({}).enabled, false)
  assert.throws(() => loadConfig({ SUBMISSIONS_ENABLED: 'true' }))
})
test('validates all steps, consent and unknown fields on server', () => {
  validateApplication(sample, 'Synthetic signature')
  for (const data of [{ ...sample, first_name: '' }, { ...sample, accept_terms: false }, { ...sample, to: 'attacker@example.test' }, { ...sample, gender: 'invalid' }, { ...sample, dob: '1990-02-31' }]) assert.throws(() => validateApplication(data, 'Synthetic signature'))
})
test('rejects oversized images and disguised active content', async () => {
  await assert.rejects(cleanImage(Buffer.alloc(FILE_LIMIT + 1), 'id_front'))
  await assert.rejects(cleanImage(Buffer.from('<svg onload="alert(1)"></svg>'), 'id_front'))
  await assert.rejects(cleanImage(Buffer.from('not an image'), 'id_front'))
})
test('report includes every supplied choice, optional fields and safe attachment names', async () => {
  const bytes = await png()
  const mail = await prepareEmail(sample, 'Synthetic signature', { id_front: bytes, id_back: bytes, passport_picture: bytes }, 'test-reference', 'test-version')
  for (const heading of ['PRODUCT', 'PERSONAL DETAILS', 'IDENTIFICATION', 'RESIDENCE', 'EMPLOYMENT AND FUNDS', 'NEXT OF KIN', 'CONSENT', 'SIGNATURE']) assert.ok(mail.text.includes(heading))
  assert.ok(mail.text.includes('Rapid Savings')); assert.ok(mail.text.includes('Politically exposed person (PEP): No')); assert.ok(mail.text.includes('Not supplied'))
  assert.deepEqual(mail.attachments.map(file => file.filename), ['id_front.png', 'id_back.png', 'passport_picture.png'])
  await assert.rejects(prepareEmail(sample, 'Test', {}, 'reference', 'version'))
})
test('disabled endpoint never invokes email', async () => {
  await withServer({ config: { enabled: false }, sendMail: () => assert.fail('Email invoked') }, async base => {
    const res = await fetch(`${base}/api/account-applications`, { method: 'POST' }); assert.equal(res.status, 503)
  })
})
test('rejects unapproved origins and failed security checks', async () => {
  await withServer({ config, sendMail: () => assert.fail('Email invoked'), verifyCaptcha: async () => false }, async base => {
    assert.equal((await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: 'https://attacker.test' } })).status, 403)
    assert.equal((await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: await payload() })).status, 400)
  })
})
test('sends only to fixed IT mailbox and returns receipt after SMTP acceptance', async () => {
  let mail
  await withServer({ config, verifyCaptcha: async () => true, sendMail: async value => { mail = value; return { accepted: [RECIPIENT] } } }, async base => {
    const res = await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: await payload() })
    assert.equal(res.status, 200); assert.equal((await res.json()).status, 'accepted-by-mail-server')
    assert.equal(mail.to, RECIPIENT); assert.equal(mail.attachments.length, 3); assert.ok(!mail.subject.includes(sample.first_name))
  })
})
test('mail failures never return false success or expose provider secrets', async () => {
  await withServer({ config, verifyCaptcha: async () => true, sendMail: async () => { throw Error('SMTP password SHOULD-NOT-LEAK') } }, async base => {
    const res = await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: await payload() })
    assert.equal(res.status, 502); assert.ok(!(await res.text()).includes('SHOULD-NOT-LEAK'))
  })
})

test('drawn PNG signature is attached and malformed signatures are rejected', async () => {
  const bytes = await png()
  const files = { id_front: bytes, id_back: bytes, passport_picture: bytes }
  const email = await prepareEmail(sample, `data:image/png;base64,${bytes.toString('base64')}`, files, 'synthetic-reference', 'test')
  assert.equal(email.attachments[3].filename, 'signature.png')
  await assert.rejects(prepareEmail(sample, 'data:image/svg+xml;base64,PHN2Zz4=', files, 'test', 'test'))
})
test('multipart size, unexpected fields and recipient override cannot send mail', async () => {
  await withServer({ config, verifyCaptcha: async () => true, sendMail: () => assert.fail('Email invoked') }, async base => {
    const oversized = await payload()
    oversized.set('id_front', new Blob([Buffer.alloc(FILE_LIMIT + 1)]), 'large.png')
    assert.equal((await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: oversized })).status, 400)
    const extra = await payload(); extra.append('to', 'attacker@example.test')
    assert.equal((await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: extra })).status, 400)
    const override = await payload({ ...sample, to: 'attacker@example.test' })
    assert.equal((await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: override })).status, 400)
  })
})
test('unaccepted SMTP recipient does not produce a success receipt', async () => {
  await withServer({ config, verifyCaptcha: async () => true, sendMail: async () => ({ accepted: [] }) }, async base => {
    const res = await fetch(`${base}/api/account-applications`, { method: 'POST', headers: { Origin: config.origin }, body: await payload() })
    assert.equal(res.status, 502)
  })
})
