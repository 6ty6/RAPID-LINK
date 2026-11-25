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

const singleton = (S,title,type,id) => S.listItem().title(title)
  .child(S.document().schemaType(type).documentId(id).title(title))
const group = (S,title,items) => S.listItem().title(title).child(S.list().title(title).items(items))

export const structure = S => S.list()
  .title('RapidLink content')
  .items([
    group(S,'Homepage',[
      contentSection(S,'Announcements','announcement','announcements'),
    ]),
    group(S,'Products & services',[
      singleton(S,'Digital channels — page & cards','digitalChannelsPage','rapidlink-digital-channels-page'),
      singleton(S,'Loan calculator','loanCalculatorSettings','rapidlink-loan-calculator-settings'),
    ]),
    group(S,'Company',[
      group(S,'Institutional profile',[
        contentSection(S,'Impact numbers','impactCounter','counters'),
      ]),
      singleton(S,'Contact page & social profiles','siteSettings','rapidlink-site-settings'),
    ]),
    group(S,'News & careers',[
      contentSection(S,'News','newsArticle','articles'),
      contentSection(S,'Careers','careerVacancy','vacancies'),
    ]),
    group(S,'Help',[
      contentSection(S,'FAQs','faq','questions'),
    ]),
    group(S,'Shared website content',[
      singleton(S,'Footer & app promotion','sharedSettings','rapidlink-shared-settings'),
    ]),
  ])
