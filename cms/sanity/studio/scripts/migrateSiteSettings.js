import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')
const { siteInformation } = await import(pathToFileURL(resolve(repositoryRoot, 'src/content/site.js')).href)

const document = {
  _id: 'rapidlink-site-settings',
  _type: 'siteSettings',
  email: siteInformation.contact.email,
  supportLines: siteInformation.contact.supportLines.map(line => ({
    _key: line.id,
    _type: 'supportLine',
    label: line.label,
    mobileLabel: line.mobileLabel,
    display: line.display,
    href: line.href,
  })),
  loanSupportLines: siteInformation.contact.loanSupportLines.map((line, index) => ({
    _key: `loan-support-${index + 1}`,
    _type: 'loanSupportLine',
    ...line,
  })),
  branches: siteInformation.branches.map(branch => ({
    _key: branch.id,
    _type: 'branch',
    title: branch.title,
    contactTitle: branch.contactTitle,
    address: branch.address,
    fullAddress: branch.fullAddress,
    digitalAddress: branch.digitalAddress,
    mapName: branch.mapName,
    phones: branch.phones,
  })),
  socialProfiles: siteInformation.socialProfiles.map(profile => ({
    _key: profile.icon,
    _type: 'socialProfile',
    ...profile,
  })),
}

console.log('Prepared the RapidLink contact and social settings singleton.')
console.log(`Email: ${document.email}`)
console.log(`Support numbers: ${document.supportLines.length}; loan numbers: ${document.loanSupportLines.length}`)
console.log(`Branches: ${document.branches.length}; social profiles: ${document.socialProfiles.length}`)

if (dryRun) {
  console.log('Dry run complete. No Sanity records were changed.')
  process.exit(0)
}

const client = getCliClient({ apiVersion: '2026-11-17' })
await client.transaction()
  .createOrReplace(document)
  .delete(`drafts.${document._id}`)
  .commit()

console.log('Sanity contact and social settings migration completed successfully.')
