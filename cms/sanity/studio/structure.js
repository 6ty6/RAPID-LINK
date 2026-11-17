const visibilityLists = (S, type, title) => [
  S.documentTypeListItem(type).title(`All ${title}`),
  S.listItem()
    .title('Visible on website')
    .child(S.documentList().title(`Visible ${title}`).schemaType(type).filter(`_type == "${type}" && isPublished == true`)),
  S.listItem()
    .title('Hidden or draft')
    .child(S.documentList().title(`Hidden ${title}`).schemaType(type).filter(`_type == "${type}" && isPublished != true`)),
]

const contentSection = (S, title, type, pluralTitle) => S.listItem()
  .title(title)
  .child(S.list().title(title).items(visibilityLists(S, type, pluralTitle)))

export const structure = S => S.list()
  .title('RapidLink content')
  .items([
    contentSection(S, 'News', 'newsArticle', 'articles'),
    contentSection(S, 'Careers', 'careerVacancy', 'vacancies'),
    contentSection(S, 'FAQs', 'faq', 'questions'),
    contentSection(S, 'Impact numbers', 'impactCounter', 'counters'),
  ])
