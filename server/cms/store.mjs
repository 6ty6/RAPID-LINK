import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { models, departments, roles, validateData, emptyData } from '../../src/cms/models.js'

export class CmsError extends Error { constructor(message, status = 400) { super(message); this.status = status } }
const fail = (message, status) => { throw new CmsError(message, status) }
const now = () => new Date().toISOString()
function validate(kind, data, strict = false) { try { validateData(kind, data, strict) } catch (error) { fail(error.message) } }
const decode = row => row && { ...row, data: JSON.parse(row.data), active: row.active === undefined ? undefined : Boolean(row.active) }
export function mediaIds(value) {
  if (typeof value === 'string') return value.startsWith('media:') ? [value.slice(6)] : []
  if (Array.isArray(value)) return value.flatMap(mediaIds)
  if (value && typeof value === 'object') return Object.values(value).flatMap(mediaIds)
  return []
}

export class CmsStore {
  constructor(path = ':memory:', bootstrap = []) {
    this.db = new DatabaseSync(path)
    this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS staff (user_id TEXT PRIMARY KEY, name TEXT NOT NULL, department TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('writer','approver','admin')), active INTEGER NOT NULL CHECK(active IN (0,1)));
      CREATE TABLE IF NOT EXISTS entries (id TEXT PRIMARY KEY, kind TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, department TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, created_by TEXT NOT NULL, edited_by TEXT NOT NULL, approved_by TEXT, updated_at TEXT NOT NULL, UNIQUE(kind,slug));
      CREATE TABLE IF NOT EXISTS releases (id TEXT PRIMARY KEY REFERENCES entries(id), kind TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL, data TEXT NOT NULL, version INTEGER NOT NULL, published_at TEXT NOT NULL, UNIQUE(kind,slug));
      CREATE TABLE IF NOT EXISTS revisions (id INTEGER PRIMARY KEY, entry_id TEXT NOT NULL REFERENCES entries(id), version INTEGER NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, note TEXT NOT NULL, snapshot TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(entry_id,version));
      CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entry_id TEXT, detail TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, department TEXT NOT NULL, uploaded_by TEXT NOT NULL, label TEXT NOT NULL, bytes INTEGER NOT NULL, created_at TEXT NOT NULL);
      CREATE TRIGGER IF NOT EXISTS immutable_audit_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'Audit records are append-only'); END;
      CREATE TRIGGER IF NOT EXISTS immutable_audit_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'Audit records are append-only'); END;
      CREATE TRIGGER IF NOT EXISTS immutable_revision_update BEFORE UPDATE ON revisions BEGIN SELECT RAISE(ABORT,'Revisions are append-only'); END;
      CREATE TRIGGER IF NOT EXISTS immutable_revision_delete BEFORE DELETE ON revisions BEGIN SELECT RAISE(ABORT,'Revisions are append-only'); END;`)
    // Bootstrap only an empty membership registry, never reactivate a revoked user.
    if (!this.db.prepare('SELECT 1 FROM staff LIMIT 1').get()) {
      for (const member of bootstrap) this.setInitialStaff(member)
    }
  }
  setInitialStaff(member) {
    if (!member.user_id || !member.name || !roles.includes(member.role) || !departments.includes(member.department)) fail('Invalid bootstrap member.')
    this.db.prepare('INSERT INTO staff VALUES (?,?,?,?,1)').run(member.user_id, member.name, member.department, member.role)
  }
  who(id) {
    const member = this.db.prepare('SELECT * FROM staff WHERE user_id=? AND active=1').get(id)
    if (!member) fail('Your staff access is not enabled. Contact the CMS administrator.', 403)
    return { ...member, active: true }
  }
  scope(actor, entry) { if (actor.role !== 'admin' && actor.department !== entry.department) fail('This content belongs to another department.', 403) }
  reviewer(actor) { if (!['admin', 'approver'].includes(actor.role)) fail('An approver is required for this action.', 403) }
  transaction(run) { this.db.exec('BEGIN IMMEDIATE'); try { const result = run(); this.db.exec('COMMIT'); return result } catch (error) { this.db.exec('ROLLBACK'); throw error } }
  audit(actor, action, id, detail = '') { this.db.prepare('INSERT INTO audit(actor,action,entry_id,detail,created_at) VALUES (?,?,?,?,?)').run(actor, action, id, detail, now()) }
  snapshot(actor, action, entry, note = '') {
    this.db.prepare('INSERT INTO revisions(entry_id,version,actor,action,note,snapshot,created_at) VALUES (?,?,?,?,?,?,?)').run(entry.id, entry.version, actor, action, note, JSON.stringify(entry), now())
    this.audit(actor, action, entry.id, `Version ${entry.version}${note ? ': ' + note : ''}`)
  }
  rawEntry(id) { return decode(this.db.prepare('SELECT * FROM entries WHERE id=?').get(id)) || fail('Content was not found.', 404) }
  entry(userId, id) { const actor = this.who(userId), entry = this.rawEntry(id); this.scope(actor, entry); return entry }
  entries(userId) {
    const actor = this.who(userId)
    return (actor.role === 'admin' ? this.db.prepare('SELECT * FROM entries ORDER BY updated_at DESC').all() : this.db.prepare('SELECT * FROM entries WHERE department=? ORDER BY updated_at DESC').all(actor.department)).map(decode)
  }
  publicEntries(kind) { return (kind ? this.db.prepare('SELECT * FROM releases WHERE kind=? ORDER BY published_at DESC').all(kind) : this.db.prepare('SELECT * FROM releases ORDER BY published_at DESC').all()).map(decode) }
  expectVersion(entry, version) { if (!Number.isInteger(version) || entry.version !== version) fail('This record changed. Reload it before saving to avoid overwriting another editor.', 409) }
  validateMedia(actor, data) {
    for (const id of new Set(mediaIds(data))) {
      const asset = this.db.prepare('SELECT * FROM media WHERE id=?').get(id)
      if (!asset) fail('An image reference is unavailable.')
      this.scope(actor, asset)
    }
  }
  save(userId, payload) {
    const actor = this.who(userId)
    return this.transaction(() => {
      const existing = payload.id ? this.entry(userId, payload.id) : null
      if (!Object.hasOwn(models, payload.kind) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug || '') || payload.slug.length > 120 || typeof payload.title !== 'string' || !payload.title.trim() || payload.title.length > 200 || !departments.includes(payload.department)) fail('Check the title, URL slug, content type and department.')
      this.scope(actor, payload)
      if (existing) { this.expectVersion(existing, payload.version); if (existing.kind !== payload.kind || existing.department !== payload.department) fail('Content type and department cannot be changed after creation.') }
      else if (payload.version !== 0) fail('New content must start at version zero.', 409)
      if (models[payload.kind].singleton && this.db.prepare('SELECT id FROM entries WHERE kind=? AND id<>?').get(payload.kind, existing?.id || '')) fail('There is already a site-settings record.')
      if (this.db.prepare('SELECT id FROM entries WHERE kind=? AND slug=? AND id<>?').get(payload.kind, payload.slug, existing?.id || '')) fail('That URL slug is already used for this content type.', 409)
      validate(payload.kind, payload.data)
      payload = { ...payload, data: { ...emptyData(payload.kind), ...payload.data } }
      this.validateMedia(actor, payload.data)
      const entry = { id: existing?.id || randomUUID(), kind: payload.kind, slug: payload.slug, title: payload.title.trim(), department: payload.department, data: payload.data, status: 'draft', version: (existing?.version || 0) + 1, created_by: existing?.created_by || userId, edited_by: userId, approved_by: null, updated_at: now() }
      if (existing) this.db.prepare('UPDATE entries SET slug=?,title=?,data=?,status=?,version=?,edited_by=?,approved_by=NULL,updated_at=? WHERE id=?').run(entry.slug, entry.title, JSON.stringify(entry.data), entry.status, entry.version, userId, entry.updated_at, entry.id)
      else this.db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(entry.id, entry.kind, entry.slug, entry.title, entry.department, JSON.stringify(entry.data), entry.status, entry.version, userId, userId, null, entry.updated_at)
      this.snapshot(userId, existing ? 'save_draft' : 'create', entry)
      return entry
    })
  }
  action(userId, id, action, version, note = '') {
    const actor = this.who(userId)
    if (typeof note !== 'string' || note.length > 1000) fail('Keep the review note under 1000 characters.')
    return this.transaction(() => {
      const entry = this.entry(userId, id)
      this.expectVersion(entry, version)
      if (action === 'submit') {
        if (entry.status !== 'draft') fail('Only drafts can be submitted.')
        validate(entry.kind, entry.data, true); this.validateMedia(actor, entry.data)
        entry.status = 'review'; entry.approved_by = null
      } else if (action === 'approve') {
        this.reviewer(actor)
        if (entry.status !== 'review') fail('Submit the content for review first.')
        if ([entry.created_by, entry.edited_by].includes(userId)) fail('Another authorised person must approve this content.', 403)
        entry.status = 'approved'; entry.approved_by = userId
      } else if (action === 'return') {
        this.reviewer(actor)
        if (!['review', 'approved'].includes(entry.status) || !note.trim()) fail('A review note is required when returning content.')
        entry.status = 'draft'; entry.approved_by = null
      } else if (action === 'publish') {
        this.reviewer(actor)
        if (entry.status !== 'approved' || !entry.approved_by) fail('This exact version must be approved before publication.', 403)
        validate(entry.kind, entry.data, true); this.validateMedia(actor, entry.data)
        this.db.prepare('INSERT INTO releases VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,data=excluded.data,version=excluded.version,published_at=excluded.published_at').run(entry.id, entry.kind, entry.slug, entry.title, JSON.stringify(entry.data), entry.version + 1, now())
        entry.status = 'published'
      } else if (action === 'unpublish') {
        this.reviewer(actor)
        if (!this.db.prepare('SELECT id FROM releases WHERE id=?').get(id)) fail('There is no published version.')
        this.db.prepare('DELETE FROM releases WHERE id=?').run(id)
        entry.status = 'draft'; entry.approved_by = null
      } else if (action === 'archive') {
        this.reviewer(actor)
        if (this.db.prepare('SELECT id FROM releases WHERE id=?').get(id)) fail('Unpublish this record before archiving.')
        entry.status = 'archived'; entry.approved_by = null
      } else fail('Unsupported content action.')
      entry.version++; entry.updated_at = now()
      this.db.prepare('UPDATE entries SET status=?,version=?,approved_by=?,updated_at=? WHERE id=?').run(entry.status, entry.version, entry.approved_by, entry.updated_at, id)
      this.snapshot(userId, action, entry, note.trim())
      return entry
    })
  }
  history(userId, id) { this.entry(userId, id); return this.db.prepare('SELECT * FROM revisions WHERE entry_id=? ORDER BY version DESC').all(id).map(row => ({ ...row, snapshot: JSON.parse(row.snapshot) })) }
  restore(userId, id, revision, version) {
    this.entry(userId, id)
    const snapshot = this.db.prepare('SELECT snapshot FROM revisions WHERE entry_id=? AND version=?').get(id, revision)
    if (!snapshot) fail('Revision was not found.', 404)
    const record = JSON.parse(snapshot.snapshot)
    return this.save(userId, { ...record, id, version })
  }
  staff(userId) { if (this.who(userId).role !== 'admin') fail('Administrator access is required.', 403); return this.db.prepare('SELECT * FROM staff ORDER BY name').all().map(row => ({ ...row, active: Boolean(row.active) })) }
  saveStaff(userId, member) {
    if (this.who(userId).role !== 'admin') fail('Administrator access is required.', 403)
    if (!/^[a-f0-9-]{36}$/.test(member.user_id || '') || typeof member.name !== 'string' || !member.name.trim() || member.name.length > 100 || !roles.includes(member.role) || !departments.includes(member.department) || typeof member.active !== 'boolean') fail('Check the staff details.')
    if (member.user_id === userId) fail('Ask another administrator to change your access.', 403)
    return this.transaction(() => {
      const previous = this.db.prepare('SELECT * FROM staff WHERE user_id=?').get(member.user_id)
      if (previous?.role === 'admin' && previous.active && (!member.active || member.role !== 'admin') && this.db.prepare("SELECT count(*) AS n FROM staff WHERE role='admin' AND active=1").get().n <= 1) fail('Keep at least one active administrator.')
      this.db.prepare('INSERT INTO staff VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,department=excluded.department,role=excluded.role,active=excluded.active').run(member.user_id, member.name.trim(), member.department, member.role, Number(member.active))
      this.audit(userId, 'staff_access_changed', null, `${member.user_id}: ${member.role}, ${member.department}, ${member.active ? 'active' : 'revoked'}`)
      return this.staff(userId)
    })
  }
  auditLog(userId) {
    const actor = this.who(userId)
    return actor.role === 'admin' ? this.db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 1000').all() : this.db.prepare('SELECT audit.* FROM audit JOIN entries ON entries.id=audit.entry_id WHERE entries.department=? ORDER BY audit.id DESC LIMIT 1000').all(actor.department)
  }
  addMedia(userId, { id, department, label, bytes }) {
    const actor = this.who(userId); this.scope(actor, { department })
    if (!departments.includes(department) || typeof label !== 'string' || label.length > 200 || !Number.isInteger(bytes) || bytes < 1) fail('Invalid image metadata.')
    this.transaction(() => { this.db.prepare('INSERT INTO media VALUES (?,?,?,?,?,?)').run(id, department, userId, label, bytes, now()); this.audit(userId, 'image_uploaded', null, id) })
  }
  assets(userId) { const actor = this.who(userId); return actor.role === 'admin' ? this.db.prepare('SELECT * FROM media ORDER BY created_at DESC').all() : this.db.prepare('SELECT * FROM media WHERE department=? ORDER BY created_at DESC').all(actor.department) }
  canReadMedia(userId, id) {
    const media = this.db.prepare('SELECT * FROM media WHERE id=?').get(id)
    if (!media) return false
    if (this.publicEntries().some(entry => mediaIds(entry.data).includes(id))) return true
    if (!userId) return false
    this.scope(this.who(userId), media); return true
  }
  export(userId) {
    if (this.who(userId).role !== 'admin') fail('Administrator access is required.', 403)
    this.audit(userId, 'content_exported', null)
    return { format: 'rapidlink-cms-v1', exported_at: now(), entries: this.entries(userId), releases: this.publicEntries(), revisions: this.db.prepare('SELECT * FROM revisions').all(), audit: this.db.prepare('SELECT * FROM audit ORDER BY id').all(), media: this.assets(userId), staff: this.staff(userId) }
  }
  close() { this.db.close() }
}
