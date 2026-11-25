import { fields, images } from './accountApplication.js'
export const accountFormModel = {
 schema: 'publicAccountForm', title: 'Account application form', id: 'rapidlink-account-form',
 content: {
  introduction: { eyebrow:'Open an account', title:'Let’s take the first step.', description:'Complete your application in a few clear steps. When submissions become available, RapidLink will review your request after Ghana Card verification. Completing this form does not open an account.' },
  stepLabels: { account:'Account', personal:'Your details', work:'Address & work', documents:'Documents', review:'Review' },
  accounts: { heading:'Choose your account type *', guidance:'Select a card, then continue. Both account types require the documents listed below.', savingsTitle:'Savings account', savingsDescription:'Start an application for a savings account.', currentTitle:'Current account', currentDescription:'Start an application for a current account.', selected:'Selected', select:'Select account', requirementsHeading:'Have these ready' },
  branches: { heading:'Choose your preferred branch', optional:'(optional)', guidance:'If you leave this blank, your application will be assigned to Asylum Down.', headOffice:'Head Office' },
  fieldLabels: Object.fromEntries(fields.map(([name,label])=>[name,label])),
  documents: { introduction:'Add a passport-style photograph and a photo or scan of your signature. Ghana Card images are optional. Use sample images while testing.', photo:images[0][1], signature:images[1][1], id_front:images[2][1], id_back:images[3][1] },
  review: { introduction:'Check your entries. Choose Edit to correct a section.', edit:'Edit', notProvided:'Not provided', requirementsCard:'Valid Ghana Card details', requirementsPhoto:'Passport-style photograph', requirementsSignature:'Signature photograph or scan' },
  controls: { continue:'Continue', back:'Back', review:'Review application', clear:'Clear form', required:'(required)', optional:'(optional)', fieldGuidance:'Fields marked * are required. Other fields are optional.', selectPlaceholder:'Select an option', removeImage:'Remove image' },
  clearPopup: { title:'Clear this form?', description:'This will remove all your entries and images.', cancel:'Keep my entries', confirm:'Yes, clear form' },
 }
}
