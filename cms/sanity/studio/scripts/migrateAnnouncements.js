import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')

const bundled = await import(pathToFileURL(resolve(repositoryRoot, 'src/content.js')).href)
const announcements = bundled.announcements.map((message, index) => ({
  _id: `rapidlink-announcement-${index + 1}`,
  _type: 'announcement',
  message,
  priority: message.startsWith('IMPORTANT NOTICE:') ? 'important' : 'normal',
  displayOrder: index + 1,
  isPublished: true,
}))

console.log(`Prepared ${announcements.length} announcement record(s) for migration.`)
for (const announcement of announcements) {
  console.log(`${announcement.displayOrder}. [${announcement.priority}] ${announcement.message}`)
}

if (dryRun) {
  console.log('Dry run complete. No Sanity records were changed.')
  process.exit(0)
}

const client = getCliClient({ apiVersion: '2026-11-17' })
let transaction = client.transaction()
for (const announcement of announcements) {
  transaction = transaction
    .createOrReplace(announcement)
    .delete(`drafts.${announcement._id}`)
}
await transaction.commit()

console.log(`Sanity announcement migration completed successfully: ${announcements.length} published announcement(s).`)
