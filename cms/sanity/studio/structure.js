import {helpIcon} from './EditorHelp.jsx'
import {getSectionHelp} from './editorHelpText.js'
const info = (title,id) => helpIcon(getSectionHelp(title,id))
const singleton = (S,title,type,id) => S.listItem().title(title).icon(info(title,id))
  .child(S.document().schemaType(type).documentId(id).title(title))
const records = (S,title,type,listTitle=title) => S.listItem().title(title).icon(info(title))
  .child(S.documentTypeList(type).title(listTitle))
const group=(S,title,items)=>S.listItem().title(title).icon(info(title)).child(S.list().title(title).items(items))

// Page names stay visible at the first level. Existing record IDs are unchanged.
export const structure = S => S.list().title('Edit the website').items([
  group(S,'Homepage',[
    singleton(S,'Page content & flyers','publicHomepage','rapidlink-homepage'),
    records(S,'Announcements','announcement'),
  ]),
  records(S,'Products','publicProduct'),
  singleton(S,'Digital Channels','digitalChannelsPage','rapidlink-digital-channels-page'),
  S.listItem().title('Loan Calculator').icon(info('Loan Calculator')).child(S.list().title('Loan Calculator').items([
    singleton(S,'Page appearance & homepage card','loanCalculatorPage','rapidlink-loan-calculator-page'),
    singleton(S,'Rates, fees & approval','loanCalculatorSettings','rapidlink-loan-calculator-settings'),
  ])),
  group(S,'About RapidLink',[
    singleton(S,'Page content, Vision & Mission','publicInstitutionalPage','rapidlink-institutional-page'),
    records(S,'Impact numbers','impactCounter'),
  ]),
  singleton(S,'Board of Directors','publicBoardPage','rapidlink-board-page'),
  group(S,'News',[
    singleton(S,'Page headings','publicPageCopy','rapidlink-pages-stories'),records(S,'Articles','newsArticle'),
  ]),
  group(S,'Careers',[
    singleton(S,'Page headings & departments','publicPageCopy','rapidlink-pages-rapidlink-careers'),records(S,'Vacancies','careerVacancy'),
  ]),
  group(S,'FAQs',[
    singleton(S,'Page banner','publicPageCopy','rapidlink-pages-faqs'),records(S,'Questions & answers','faq'),
  ]),
  group(S,'Contact & branches',[
    singleton(S,'Page headings','publicPageCopy','rapidlink-pages-contact'),singleton(S,'Contact details & social profiles','siteSettings','rapidlink-site-settings'),
  ]),
  group(S,'Rates & documents',[
    singleton(S,'Current rate table','publicRatesPage','rapidlink-rates-page'),singleton(S,'Controller loan rates guide','publicRateGuide','rapidlink-rate-guide'),
  ]),
  singleton(S,'Account-opening update','publicAccountPage','rapidlink-account-page'),
  singleton(S,'Loan application guidance','publicLoanGuidance','rapidlink-loan-guidance'),
  singleton(S,'Abena','publicAbena','rapidlink-abena'),
  S.divider(),
  singleton(S,'Shared website content','sharedSettings','rapidlink-shared-settings'),
  singleton(S,'Navigation menus','publicNavigation','rapidlink-navigation'),
])
