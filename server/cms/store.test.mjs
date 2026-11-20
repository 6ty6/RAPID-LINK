import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CmsStore } from './store.mjs'
import { demoStaff } from './server.mjs'
const [admin, writer, approver, credit] = demoStaff.map(user => user.user_id)
const input = () => ({ kind: 'faq', slug: 'test-question', title: 'Synthetic test question', department: 'Marketing/Sales', version: 0, data: { answer: 'Synthetic answer for testing only.', category: 'Test', order: 0 } })
function store() { return new CmsStore(':memory:', demoStaff) }
function publish(db, draft) {
  let item = db.action(writer, draft.id, 'submit', draft.version)
  item = db.action(approver, item.id, 'approve', item.version)
  return db.action(approver, item.id, 'publish', item.version)
}

test('unapproved users cannot read or write staff records', () => {
  const db = store()
  try { assert.throws(() => db.entries('outsider')); assert.throws(() => db.save('outsider', input())); assert.deepEqual(db.publicEntries(), []) } finally { db.close() }
})
test('department boundaries are enforced by the server, including guessed record IDs', () => {
  const db = store()
  try {
    const record = db.save(writer, input())
    assert.equal(db.entries(credit).length, 0)
    assert.throws(() => db.entry(credit, record.id))
    assert.throws(() => db.save(credit, { ...record, data: { ...record.data, answer: 'Attack' } }))
    assert.throws(() => db.history(credit, record.id))
    assert.throws(() => db.save(writer, { ...input(), department: 'Credit' }))
  } finally { db.close() }
})
test('writers cannot publish or approve, and an administrator cannot approve their own content', () => {
  const db = store()
  try {
    const record = db.save(writer, input())
    assert.throws(() => db.action(writer, record.id, 'publish', record.version))
    const submitted = db.action(writer, record.id, 'submit', record.version)
    assert.throws(() => db.action(writer, record.id, 'approve', submitted.version))
    const own = db.save(admin, { ...input(), slug: 'admin-draft' })
    const review = db.action(admin, own.id, 'submit', own.version)
    assert.throws(() => db.action(admin, own.id, 'approve', review.version))
  } finally { db.close() }
})
test('publish exposes only approved content; draft changes do not leak or replace the live version', () => {
  const db = store()
  try {
    const draft = db.save(writer, input())
    assert.equal(db.publicEntries().length, 0)
    const published = publish(db, draft)
    assert.equal(db.publicEntries()[0].data.answer, input().data.answer)
    assert.equal(db.publicEntries()[0].created_by, undefined)
    db.save(writer, { ...published, data: { ...published.data, answer: 'PRIVATE DRAFT EDIT' } })
    assert.ok(!JSON.stringify(db.publicEntries()).includes('PRIVATE DRAFT EDIT'))
  } finally { db.close() }
})
test('editing an approved version invalidates approval; stale saves fail without losing either version', () => {
  const db = store()
  try {
    const draft = db.save(writer, input())
    const submitted = db.action(writer, draft.id, 'submit', draft.version)
    const approved = db.action(approver, draft.id, 'approve', submitted.version)
    const edited = db.save(writer, { ...approved, title: 'Changed title' })
    assert.equal(edited.approved_by, null)
    assert.throws(() => db.action(approver, draft.id, 'publish', approved.version))
    assert.throws(() => db.action(approver, draft.id, 'publish', edited.version))
    assert.throws(() => db.save(writer, { ...draft, title: 'STALE' }))
    assert.equal(db.entry(writer, draft.id).title, 'Changed title')
  } finally { db.close() }
})
test('history restores to a new draft without changing publication and audit is append-only', () => {
  const db = store()
  try {
    const published = publish(db, db.save(writer, input()))
    const changed = db.save(writer, { ...published, title: 'New title' })
    const restored = db.restore(writer, changed.id, 1, changed.version)
    assert.equal(restored.title, input().title)
    assert.equal(restored.status, 'draft')
    assert.ok(restored.version > changed.version)
    assert.ok(db.history(writer, changed.id).length >= 6)
    assert.throws(() => db.db.exec('DELETE FROM audit'))
    assert.throws(() => db.db.exec('UPDATE revisions SET note=\'changed\''))
  } finally { db.close() }
})
test('unpublish withdraws content and archive cannot accidentally remove a live entry', () => {
  const db = store()
  try {
    const published = publish(db, db.save(writer, input()))
    assert.throws(() => db.action(approver, published.id, 'archive', published.version))
    assert.throws(() => db.action(writer, published.id, 'unpublish', published.version))
    const draft = db.action(approver, published.id, 'unpublish', published.version)
    assert.equal(db.publicEntries().length, 0)
    assert.equal(db.action(approver, draft.id, 'archive', draft.version).status, 'archived')
  } finally { db.close() }
})
test('role administration rejects self escalation, revocation takes effect and ordinary staff cannot export', () => {
  const db = store()
  try {
    assert.throws(() => db.saveStaff(writer, { ...demoStaff[1], role: 'admin', active: true }))
    assert.throws(() => db.saveStaff(admin, { ...demoStaff[0], role: 'writer', active: true }))
    assert.throws(() => db.export(writer))
    db.saveStaff(admin, { ...demoStaff[1], active: false })
    assert.throws(() => db.save(writer, input()))
    assert.throws(() => db.who(writer))
    assert.equal(db.staff(admin).find(user => user.user_id === writer).active, false)
    assert.equal(db.export(admin).format, 'rapidlink-cms-v1')
  } finally { db.close() }
})
test('server validates safe links, known fields, record kinds, required values and duplicate slugs', () => {
  const db = store()
  try {
    assert.throws(() => db.save(writer, { ...input(), kind: '__proto__' }))
    assert.throws(() => db.save(writer, { ...input(), data: { ...input().data, surprise: true } }))
    const incomplete = db.save(writer, { ...input(), data: { answer: '' } })
    assert.throws(() => db.action(writer, incomplete.id, 'submit', incomplete.version))
    assert.throws(() => db.save(writer, input()))
    assert.throws(() => db.save(writer, { ...input(), kind: 'slide', data: { image: 'javascript:alert(1)', imageAlt: 'bad' } }))
  } finally { db.close() }
})
test('draft image references remain private until a record is published and are withdrawn with it', () => {
  const db = store(), id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  try {
    db.addMedia(writer, { id, department: 'Marketing/Sales', label: 'Synthetic image', bytes: 20 })
    assert.equal(db.canReadMedia(null, id), false)
    assert.equal(db.canReadMedia(writer, id), true)
    assert.throws(() => db.canReadMedia(credit, id))
    const record = db.save(writer, { ...input(), kind: 'slide', data: { image: `media:${id}`, imageAlt: 'Synthetic image', link: '/assets/test.png', order: 1 } })
    const live = publish(db, record)
    assert.equal(db.canReadMedia(null, id), true)
    db.action(approver, live.id, 'unpublish', live.version)
    assert.equal(db.canReadMedia(null, id), false)
  } finally { db.close() }
})
test('database persists after reopening without reactivating a revoked bootstrap user', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rapidlink-cms-test-'))
  let db = new CmsStore(join(dir, 'cms.sqlite'), demoStaff)
  try {
    db.save(writer, input()); db.saveStaff(admin, { ...demoStaff[1], active: false }); db.close()
    db = new CmsStore(join(dir, 'cms.sqlite'), demoStaff)
    assert.equal(db.entries(admin).length, 1)
    assert.throws(() => db.who(writer))
  } finally { db.close(); rmSync(dir, { recursive: true, force: true }) }
})
