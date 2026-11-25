const singleton = (S,title,type,id) => S.listItem().title(title)
  .child(S.document().schemaType(type).documentId(id).title(title))
const records = (S,title,type,listTitle=title) => S.listItem().title(title)
  .child(S.documentTypeList(type).title(listTitle))

// Page names stay visible at the first level. Existing record IDs are unchanged.
export const structure = S => S.list().title('Edit the website').items([
  records(S,'Homepage','announcement','Homepage announcements'),
  singleton(S,'Digital Channels','digitalChannelsPage','rapidlink-digital-channels-page'),
  S.listItem().title('Loan Calculator').child(S.list().title('Loan Calculator').items([
    singleton(S,'Page appearance & homepage card','loanCalculatorPage','rapidlink-loan-calculator-page'),
    singleton(S,'Rates, fees & approval','loanCalculatorSettings','rapidlink-loan-calculator-settings'),
  ])),
  records(S,'About RapidLink','impactCounter','Institutional profile — impact numbers'),
  records(S,'News','newsArticle'),
  records(S,'Careers','careerVacancy'),
  records(S,'FAQs','faq'),
  singleton(S,'Contact & branches','siteSettings','rapidlink-site-settings'),
  S.divider(),
  singleton(S,'Shared website content','sharedSettings','rapidlink-shared-settings'),
])
