import { DatabaseSync, backup } from 'node:sqlite'
import { mkdirSync, cpSync, existsSync, writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
export async function backupCms(dataDir, destination) {
  const source = resolve(dataDir), target = resolve(destination)
  if (target === source || target.startsWith(source + '/') || target.startsWith(source + '\\')) throw Error('Backup must be outside the live data directory.')
  if (existsSync(target)) throw Error('Choose a new, empty backup destination.')
  const file = join(source, 'cms.sqlite')
  if (!existsSync(file)) throw Error('CMS database was not found.')
  mkdirSync(target, { recursive: true, mode: 0o700 })
  // Copy media first: a concurrent publication may reference only already-written files.
  // Run in the documented maintenance window for a complete point-in-time snapshot.
  if (existsSync(join(source, 'media'))) cpSync(join(source, 'media'), join(target, 'media'), { recursive: true })
  const db = new DatabaseSync(file, { readOnly: true })
  try { await backup(db, join(target, 'cms.sqlite')) } finally { db.close() }
  const files = ['cms.sqlite', ...(existsSync(join(target, 'media')) ? readdirSync(join(target, 'media')).map(name => 'media/' + name) : [])]
  const checksums = Object.fromEntries(files.map(name => [name, createHash('sha256').update(readFileSync(join(target, name))).digest('hex')]))
  writeFileSync(join(target, 'manifest.json'), JSON.stringify({ format: 'rapidlink-cms-backup-v1', created_at: new Date().toISOString(), checksums }, null, 2), { mode: 0o600 })
  return { destination: target, files: files.length }
}
export function verifyBackup(directory) {
  const root = resolve(directory), manifest = JSON.parse(readFileSync(join(root, 'manifest.json')))
  if (manifest.format !== 'rapidlink-cms-backup-v1' || !manifest.checksums?.['cms.sqlite']) throw Error('Invalid backup manifest.')
  for (const [name, expected] of Object.entries(manifest.checksums)) {
    if (!/^(cms\.sqlite|media\/[a-zA-Z0-9_.-]+)$/.test(name) || name.includes('..')) throw Error('Invalid backup path.')
    if (createHash('sha256').update(readFileSync(join(root, name))).digest('hex') !== expected) throw Error(`Backup checksum failed: ${name}`)
  }
  const db = new DatabaseSync(join(root, 'cms.sqlite'), { readOnly: true })
  try { if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw Error('Backup database integrity check failed.') } finally { db.close() }
  return true
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv[2] === '--verify') { verifyBackup(process.argv[3]); process.stdout.write('Backup checksums and database integrity verified.\n'); process.exit(0) }
  if (!process.argv[2] || !process.argv[3]) throw Error('Usage: node server/cms/backup.mjs DATA_DIRECTORY NEW_BACKUP_DIRECTORY')
  process.stdout.write(JSON.stringify(await backupCms(process.argv[2], process.argv[3])) + '\n')
}
