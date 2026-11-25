import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const bundled = await import(pathToFileURL(resolve(repositoryRoot, 'src/content.js')).href)
const client = getCliClient({ apiVersion: '2026-11-17' })

const records = await client.fetch(`*[
  _type == "announcement" &&
  _id in $ids
] | order(displayOrder asc) {
  _id,
  message,
  priority,
  displayOrder,
  isPublished
}`, {
  ids: bundled.announcements.map((_, index) => `rapidlink-announcement-${index + 1}`),
})

const passed = records.length === bundled.announcements.length && records.every((record, index) => (
  record._id === `rapidlink-announcement-${index + 1}` &&
  record.message === bundled.announcements[index] &&
  record.displayOrder === index + 1 &&
  record.isPublished === true
))

if (!passed) {
  throw new Error(`Announcement verification failed: expected ${bundled.announcements.length} matching published records, received ${records.length}.`)
}

console.log(`PASS: ${records.length} original website announcements are published in Sanity with matching text and order.`)
