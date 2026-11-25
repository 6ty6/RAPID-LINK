const size=(width,height,ratio,placement,display)=>({width,height,ratio,placement,display})
const banner=placement=>size(2160,720,'3:1',placement,'Wide banner; edges can crop on smaller screens. Keep important people/details away from the outer edges and leave space on the left for the page text.')
const photo=placement=>size(1500,1000,'3:2',placement,'Cropped to fill its card. Keep the subject toward the right and allow space around it; the card text overlays the left side.')
const landscapeProducts=new Set(['personal-loan','business-loan','rapid-susu','rapid-edu-grow','fixed-deposit'])
const pathName=path=>path.filter(part=>typeof part==='string').join('.')

export function getImageDimensions(value){
 const ref=value?.asset?._ref||value?.asset?._id||''
 const match=ref.match(/-(\d+)x(\d+)-[a-z0-9]+$/i)
 return match&&Number(match[1])>0&&Number(match[2])>0?{width:Number(match[1]),height:Number(match[2])}:null
}

export function getImageGuidance(document={},path=[]){
 const key=pathName(path)
 switch(document._type){
  case 'publicHomepage':
   if(key==='slides.image')return size(1920,700,'approximately 2.74:1','Homepage flyer slider','The whole flyer is shown without cropping and its height follows the artwork. Use the same wide shape for all slides so the page does not jump in height. Keep flyer text large enough to read on mobile.')
   if(key==='tools.ratesImage')return photo('Homepage Current Interest Rates card')
   break
  case 'publicProduct':
   if(key==='heroImage')return size(1920,800,'12:5','This product page’s top banner','The photo fills the right-hand banner panel and may crop on mobile. Keep the main subject on the right; do not put essential wording inside the photograph.')
   if(key==='image'){
    if(document.slug==='business-loan')return size(1500,1000,'3:2','Business Loans detail photograph and its homepage product card','The detail page shows the full 3:2 photograph; the homepage card crops it. Keep the SME owner and their work near the centre, with clear space around them.')
    if(landscapeProducts.has(document.slug))return size(1500,1000,'3:2','This product’s detail photograph and its selected homepage card','Both uses share this image. The detail frame height varies with the text; homepage images fill a 285 px-high desktop or 260 px-high mobile frame. Edges may crop, so keep faces and important details centrally framed.')
    return size(1200,1500,'4:5','This product’s detail photograph and its selected homepage card','Portrait artwork suits the tall detail frame. The same image is cropped for the wider homepage card: keep faces in the upper-middle and essential details near the centre, with space around them.')
   }
   break
  case 'publicInstitutionalPage':
   if(key==='hero.image')return size(2160,720,'3:1','Institutional Profile banner background','Keep the crowd/main subjects on the right and a clear light area on the left for the existing heading and introduction. The background crops and fades more strongly on mobile; do not bake page text into it.')
   break
  case 'publicBoardPage':
   if(key==='hero.image')return banner('Board of Directors page banner')
   if(key==='members.image')return size(1000,1250,'4:5','This director’s board card and biography dialog','The card fits the whole portrait inside a square; the biography crops to 4:5. Keep the face centred near the top with clear space above the head. A transparent PNG/WebP cutout is also suitable.')
   break
  case 'publicPageCopy':
   if(key==='hero.image'){
    if(document.slug==='rapidlink-careers')return size(2000,500,'4:1','Careers page banner','Panoramic artwork. The fixed-height banner crops the sides on mobile; keep people and key details near the centre and allow space for the heading.')
    if(document.slug==='faqs')return size(1920,960,'2:1','FAQ page banner photograph','The photo occupies the right of the banner and is cropped to fill it. Keep the main subject on the right; the heading and introduction are website text.')
    return banner(document.slug==='contact'?'Contact page banner':document.slug==='stories'?'News page banner':'The selected page’s banner')
   }
   break
  case 'publicRatesPage':
  case 'publicRateGuide':
   if(key==='hero.image')return size(1920,960,'2:1','Rates page or rates-guide page banner photograph','Shown in the right-hand banner panel with cropping. Keep the subject on the right and leave space around it for responsive layouts.')
   break
  case 'loanCalculatorPage':
   if(key==='heroImage')return banner('Loan Calculator page banner photograph')
   if(key==='cardImage')return photo('Homepage Loan Calculator card')
   break
  case 'digitalChannelsPage':
   if(key==='bannerImage')return size(1920,700,'approximately 2.74:1','Digital Channels page banner','The banner fills a responsive fixed-height area and can crop on mobile. Keep key content near the centre; avoid small text or codes at the edges.')
   if(key==='channels.image'){
    const segment=path.find(part=>part&&typeof part==='object'&&part._key)
    const index=path.find(part=>typeof part==='number')
    const channel=segment?document.channels?.find(item=>item._key===segment._key):document.channels?.[index]
    const identity=`${channel?.id||''} ${channel?._key||''} ${channel?.title||''}`
    if(/mobile.?app|rapidpay|ussd/i.test(identity))return size(1000,1200,'5:6','Mobile-app or USSD artwork on this Digital Channels flip card','The whole artwork is fitted inside the card without cropping. Keep codes and labels large and readable; avoid extra white padding inside the uploaded image.')
    return size(1200,800,'3:2','Merchant artwork or service logo on this Digital Channels flip card','The whole artwork is fitted inside the card without cropping. Keep merchant numbers large and centred; use PNG or WebP for logos/transparent artwork.')
   }
   break
  case 'sharedSettings':
   if(key==='appImage')return size(1200,800,'3:2','Shared mobile-app download promotion on the homepage and Digital Channels page','The phone/app artwork is intentionally cropped inside a shallow display frame. Keep the phone screens grouped centrally and use a transparent background if the artwork needs one.')
   break
  case 'newsArticle':
   if(key==='image')return size(1600,900,'16:9','Article page, newsroom cards/feature and eligible homepage story','One image is shared across these layouts. Newsroom cards and the article header crop to fill; the homepage fits the full image. Keep faces and essential details in the centre; avoid embedding article headlines in the image.')
   break
 }
 return null
}

export const imageFileAdvice='Use an optimised WebP/JPG for photos, or PNG/WebP for transparent artwork. These are recommended source sizes, not fixed on-screen dimensions; existing images are not rejected or stretched.'
