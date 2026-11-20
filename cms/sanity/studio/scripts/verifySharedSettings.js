import { deepStrictEqual, ok } from 'node:assert'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { getCliClient } from 'sanity/cli'

const studioDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(studioDirectory, '../../..')
const { sharedContent } = await import(pathToFileURL(resolve(repositoryRoot, 'src/content/shared.js')).href)
const client = getCliClient({ apiVersion: '2026-11-20' })

const record = await client.fetch(`*[_type == "sharedSettings" && _id == "rapidlink-shared-settings"][0]{
  appEyebrow,
  appTitle,
  appDescription,
  "imageAsset": appImage.asset->_id,
  "imageFilename": appImage.asset->originalFilename,
  appImageAlt,
  iosLabel,
  androidLabel,
  footerDescription,
  companyName,
  privacyNotice,
  socialHeading,
  exploreHeading,
  companyHeading,
  contactHeading,
  menuDescriptions[]{menu, description},
  exploreLinks[]{label, href},
  companyLinks[]{label, href}
}`)

ok(record, 'The hosted footer and app-promotion singleton does not exist.')
ok(record.imageAsset, 'The hosted app-promotion image is missing.')

deepStrictEqual({
  ...record,
  imageAsset: undefined,
  imageFilename: undefined,
}, {
  appEyebrow: sharedContent.appDownload.eyebrow,
  appTitle: sharedContent.appDownload.title,
  appDescription: sharedContent.appDownload.description,
  imageAsset: undefined,
  imageFilename: undefined,
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
  menuDescriptions: Object.entries(sharedContent.footer.menuDescriptions).map(([menu, description]) => ({ menu, description })),
  exploreLinks: sharedContent.footer.exploreLinks,
  companyLinks: sharedContent.footer.companyLinks,
})

console.log(`PASS: footer, app promotion, ${record.exploreLinks.length} explore links and ${record.companyLinks.length} company links match the website source.`)
