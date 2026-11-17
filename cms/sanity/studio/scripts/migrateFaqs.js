import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')

function categoryFor(question) {
  const normalized = question.toLowerCase()
  if (normalized.includes('loan')) return 'Loans'
  if (normalized.includes('savings')) return 'Savings'
  if (normalized.includes('account')) return 'Accounts'
  if (normalized.includes('secure')) return 'Security'
  if (normalized.includes('investment') || normalized.includes('fixed deposit')) return 'Investments'
  return 'General'
}

const bundled = await import(pathToFileURL(resolve(repositoryRoot, 'src/content.js')).href)
const faqs = bundled.faqs.map(([question, answer], index) => ({
  _id: `rapidlink-faq-${index + 1}`,
  _type: 'faq',
  question,
  answer,
  category: categoryFor(question),
  displayOrder: index + 1,
  isPublished: true,
}))

console.log(`Prepared ${faqs.length} FAQ record(s) for migration.`)
for (const faq of faqs) console.log(`${faq.displayOrder}. [${faq.category}] ${faq.question}`)

if (dryRun) {
  console.log('Dry run complete. No Sanity records were changed.')
  process.exit(0)
}

const client = getCliClient({ apiVersion: '2026-11-14' })
let transaction = client.transaction()
for (const faq of faqs) transaction = transaction.createOrReplace(faq).delete(`drafts.${faq._id}`)
await transaction.commit()
console.log(`Sanity FAQ migration completed successfully: ${faqs.length} published question(s).`)
