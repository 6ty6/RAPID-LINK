import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-11-14' }).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const records = await client.fetch(`
  *[
    _type in ["newsArticle", "careerVacancy"] &&
    (_id match "rapidlink-*" || _id match "drafts.rapidlink-*")
  ] | order(_type asc, title asc) {
    _id,
    _type,
    title,
    isPublished,
    status,
    "slug": slug.current,
    "imageAsset": image.asset->_id
  }
`)

const news = records.filter(record => record._type === 'newsArticle')
const vacancies = records.filter(record => record._type === 'careerVacancy')
const publishedNews = news.filter(record => !record._id.startsWith('drafts.') && record.isPublished)
const draftNews = news.filter(record => record._id.startsWith('drafts.'))
const publishedVacancies = vacancies.filter(record => !record._id.startsWith('drafts.') && record.isPublished)
const draftVacancies = vacancies.filter(record => record._id.startsWith('drafts.'))
const newsWithImages = news.filter(record => record.imageAsset)

console.log(`VERIFICATION: ${news.length} news (${publishedNews.length} published, ${draftNews.length} draft); ${vacancies.length} careers (${publishedVacancies.length} published, ${draftVacancies.length} draft).`)
for (const record of records) {
  console.log(`${record._id.startsWith('drafts.') ? 'DRAFT' : 'PUBLISHED'} | ${record._type} | ${record.title}`)
}

if (news.length !== 5 || newsWithImages.length !== 5 || publishedNews.length !== 3 || draftNews.length !== 2 ||
    vacancies.length !== 2 || publishedVacancies.length !== 1 || draftVacancies.length !== 1) {
  throw new Error('The migrated Sanity record counts do not match the expected transfer inventory.')
}

console.log('VERIFICATION PASSED')
