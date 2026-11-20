import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const dryRun = process.argv.includes('--dry-run')
const { sharedContent } = await import(pathToFileURL(resolve(repositoryRoot, 'src/content/shared.js')).href)

const menuDescriptions = Object.entries(sharedContent.footer.menuDescriptions).map(([menu, description], index) => ({
  _key: `menu-${index + 1}`,
  _type: 'menuDescription',
  menu,
  description,
}))

const links = (items, prefix) => items.map((item, index) => ({
  _key: `${prefix}-${index + 1}`,
  _type: 'footerLink',
  ...item,
}))

console.log('Prepared the footer and app-promotion singleton.')
console.log(`App heading: ${sharedContent.appDownload.title}`)
console.log(`Footer links: ${sharedContent.footer.exploreLinks.length + sharedContent.footer.companyLinks.length}`)

if (dryRun) {
  console.log('Dry run complete. No Sanity records or assets were changed.')
  process.exit(0)
}

const imageTypes = {
  '.avif': 'image/avif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}
const imagePath = resolve(repositoryRoot, 'public', sharedContent.appDownload.image.replace(/^\//, ''))
const filename = imagePath.split(/[\\/]/).pop()
const { getCliClient } = await import('sanity/cli')
const client = getCliClient({ apiVersion: '2026-11-20' })
const asset = await client.assets.upload('image', await readFile(imagePath), {
  filename,
  contentType: imageTypes[extname(imagePath).toLowerCase()] || 'application/octet-stream',
  label: 'RapidLink mobile app promotion',
})

const document = {
  _id: 'rapidlink-shared-settings',
  _type: 'sharedSettings',
  appEyebrow: sharedContent.appDownload.eyebrow,
  appTitle: sharedContent.appDownload.title,
  appDescription: sharedContent.appDownload.description,
  appImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
  appImageAlt: sharedContent.appDownload.imageAlt,
  iosLabel: sharedContent.appDownload.iosLabel,
  androidLabel: sharedContent.appDownload.androidLabel,
  footerDescription: sharedContent.footer.description,
  companyName: sharedContent.footer.companyName,
  privacyNotice: sharedContent.footer.privacyNotice,
  socialHeading: sharedContent.footer.headings.social,
  exploreHeading: sharedContent.footer.headings.explore,
  companyHeading: sharedContent.footer.headings.company,
  contactHeading: sharedContent.footer.headings.contact,
  menuDescriptions,
  exploreLinks: links(sharedContent.footer.exploreLinks, 'explore'),
  companyLinks: links(sharedContent.footer.companyLinks, 'company'),
}

await client.transaction()
  .createOrReplace(document)
  .delete(`drafts.${document._id}`)
  .commit()

console.log('Sanity footer and app-promotion migration completed successfully.')
