export const steps = ['Account', 'Your details', 'Address & work', 'Documents', 'Review']
export const fields = [
 ['account_type','Account type',0,true,['savings','current']],
 ['preferred_branch','Preferred branch',0,false,['Asylum Down','Madina']],
 ['title','Title',1,true,['Mr','Mrs','Miss','Dr','Prof']],
 ['first_name','First and middle names (as on Ghana Card)',1,true],
 ['last_name','Surname (as on Ghana Card)',1,true],
 ['gender','Gender',1,true,['male','female']],
 ['date_of_birth','Date of birth',1,true,null,'date'],
 ['nationality','Nationality: three-letter code, e.g. GHA',1,true,null,'text',3,'[A-Z]{3}'],
 ['phone','Phone number, e.g. 0241234567',1,true,null,'tel'],
 ['email','Email address',1,false,null,'email'],
 ['ghana_card_number','Ghana Card number: GHA-123456789-0',1,true,null,'text',null,'GHA-[0-9]{9}-[0-9]'],
 ['ghana_card_issue_date','Ghana Card issue date',1,true,null,'date'],
 ['ghana_card_expiry_date','Ghana Card expiry date',1,true,null,'date'],
 ['place_of_birth','Place of birth',1,false,null,'text',80],
 ['residential_address','Residential address',2,true,null,'textarea',200],
 ['digital_address','Ghana Post GPS address',2,false],
 ['occupation','Occupation',2,true,null,'text',80],
 ['employer','Employer',2,false,null,'text',80],
 ['next_of_kin_first_name','Next of kin: first name',2,false],
 ['next_of_kin_last_name','Next of kin: surname',2,false],
 ['next_of_kin_phone','Next of kin: phone',2,false,null,'tel'],
]
export const images = [['photo','Passport-style photograph',true],['signature','Signature photo or scan',true],['id_front','Ghana Card front',false],['id_back','Ghana Card back',false]]
export function imageError(file) {
 if (!['image/jpeg','image/png'].includes(file.type)) return 'Choose a JPG or PNG image.'
 if (!file.size || file.size > 2000000) return 'Choose an image no larger than 2 MB.'
 return ''
}
export function requestFits(data, files) {
 return new TextEncoder().encode(JSON.stringify(data)).length + 512 + Object.values(files).reduce((total,file)=>total+(file ? 4*Math.ceil(file.size/3)+40 : 0),0) <= 9000000
}
