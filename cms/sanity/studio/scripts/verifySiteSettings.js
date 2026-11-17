import { deepStrictEqual } from 'node:assert'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const { siteInformation } = await import(pathToFileURL(resolve(repositoryRoot, 'src/content/site.js')).href)
const client = getCliClient({ apiVersion: '2026-11-17' })

const record = await client.fetch(`*[_type == "siteSettings" && _id == "rapidlink-site-settings"][0]{
  email,
  supportLines[]{label, mobileLabel, display, href},
  loanSupportLines[]{display, href},
  branches[]{title, contactTitle, address, fullAddress, digitalAddress, mapName, phones},
  socialProfiles[]{name, href, icon}
}`)

const expected = {
  email: siteInformation.contact.email,
  supportLines: siteInformation.contact.supportLines.map(({ label, mobileLabel, display, href }) => ({ label, mobileLabel, display, href })),
  loanSupportLines: siteInformation.contact.loanSupportLines,
  branches: siteInformation.branches.map(({ title, contactTitle, address, fullAddress, digitalAddress, mapName, phones }) => ({ title, contactTitle, address, fullAddress, digitalAddress, mapName, phones })),
  socialProfiles: siteInformation.socialProfiles,
}

deepStrictEqual(record, expected, 'The hosted contact and social settings do not match the website source.')

console.log(`PASS: contact settings, ${record.branches.length} branches and ${record.socialProfiles.length} social profiles match the website source.`)
