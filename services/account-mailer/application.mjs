import sharp from 'sharp'

export const FILE_LIMIT = 1.5 * 1024 * 1024
export const documentNames = ['id_front', 'id_back', 'passport_picture']
const groups = {
  Product: ['product_type', 'initial_deposit'],
  'Personal details': ['title', 'gender', 'first_name', 'last_name', 'tin', 'dob', 'pob', 'marital_status', 'telephone', 'spouse_name', 'pep'],
  Identification: ['id_form', 'id_number', 'id_issue_authority', 'id_expiry_date', 'id_issue_date', 'id_issue_place', 'nationality', 'social_security_no'],
  Residence: ['region', 'suburb', 'residential_digital_address', 'postal_address', 'nearest_landmarks'],
  'Employment and funds': ['occupation', 'source_of_fund', 'employer_contact_person', 'employer_contact_no', 'work_nearest_landmark', 'net_income'],
  'Next of kin': ['nok_first_name', 'nok_surname', 'nok_relationship', 'nok_phone_number'],
  Consent: ['accept_terms', 'accept_email_delivery'],
}
const fields = Object.values(groups).flat()
const optional = new Set(['tin', 'spouse_name', 'social_security_no', 'postal_address', 'nearest_landmarks', 'employer_contact_person', 'employer_contact_no', 'work_nearest_landmark', 'net_income'])
const products = { rapid_savings: 'Rapid Savings', rapid_fixed_deposit: 'Rapid Fixed Deposit', premium_account: 'Premium account', investment_account: 'Investment account', edugrow_account: 'Edu-Grow account' }
const choices = { gender: ['female', 'male', 'other', 'prefer_not_to_say'], marital_status: ['married', 'single', 'divorced', 'separated'] }
const label = key => ({ tin: 'TIN', dob: 'Date of birth', pob: 'Place of birth', pep: 'Politically exposed person (PEP)', id_form: 'Identification type', nok_first_name: 'First name', nok_surname: 'Surname', nok_relationship: 'Relationship', nok_phone_number: 'Phone number', accept_terms: 'Account creation terms accepted' }[key] || key.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase()))

export function validateApplication(data, signature) {
  if (!data || Array.isArray(data) || typeof data !== 'object' || Object.keys(data).some(key => !fields.includes(key))) throw Error('Invalid application fields.')
  for (const key of fields) {
    if (['pep', 'accept_terms', 'accept_email_delivery'].includes(key)) {
      if (typeof data[key] !== 'boolean') throw Error('Invalid consent or PEP choice.')
    } else if (typeof data[key] !== 'string' || data[key].length > 500 || /[\x00-\x1f\x7f]/.test(data[key]) || (!optional.has(key) && !data[key].trim())) throw Error(`Check ${label(key)}.`)
  }
  if (!Object.hasOwn(products, data.product_type) || data.id_form !== 'Ghana Card') throw Error('Invalid product or identification type.')
  for (const [key, values] of Object.entries(choices)) if (!values.includes(data[key])) throw Error(`Invalid ${key}.`)
  if (!data.accept_terms || !data.accept_email_delivery) throw Error('Consent is required.')
  for (const key of ['initial_deposit', 'net_income']) if (data[key] && (!/^\d+(\.\d{1,2})?$/.test(data[key]) || Number(data[key]) > 1e12)) throw Error(`Check ${label(key)}.`)
  for (const key of ['dob', 'id_issue_date', 'id_expiry_date']) {
    const date = new Date(data[key])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data[key]) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data[key]) throw Error(`Check ${label(key)}.`)
  }
  if (data.dob > new Date().toISOString().slice(0, 10) || data.id_issue_date > data.id_expiry_date) throw Error('Check the dates supplied.')
  for (const key of ['telephone', 'nok_phone_number', 'employer_contact_no']) if (data[key] && !/^[+\d() .-]{6,30}$/.test(data[key])) throw Error(`Check ${label(key)}.`)
  if (typeof signature !== 'string' || !signature.trim() || signature.length > 2.2e6) throw Error('A valid signature is required.')
  if (!signature.startsWith('data:') && (signature.length > 200 || /[\x00-\x1f\x7f]/.test(signature))) throw Error('Check the typed signature.')
}

export async function cleanImage(buffer, name, signature = false) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > FILE_LIMIT) throw Error('Each image must be 1.5 MB or smaller.')
  const png = buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  const jpeg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
  const webp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
  if (!(png || jpeg || webp) || (signature && !png)) throw Error('Only valid PNG, JPEG or WebP images are accepted.')
  // Fully decode/re-encode raster images; drop original names and metadata.
  const image = sharp(buffer, { limitInputPixels: 20000000, failOn: 'warning', animated: false }).rotate()
  const metadata = await image.metadata()
  if (metadata.pages > 1) throw Error('Animated images are not accepted.')
  const content = await image.png().toBuffer()
  if (content.length > 6 * 1024 * 1024) throw Error('Image dimensions are too large.')
  return { filename: `${name}.png`, content, contentType: 'image/png' }
}

export async function prepareEmail(data, signature, files, reference, privacyVersion) {
  validateApplication(data, signature)
  if (Object.keys(files).length !== 3 || documentNames.some(key => !files[key])) throw Error('Upload all three required documents.')
  const attachments = []
  for (const key of documentNames) attachments.push(await cleanImage(files[key], key))
  let signatureText = signature
  if (signature.startsWith('data:')) {
    if (!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(signature)) throw Error('Invalid drawn signature.')
    attachments.push(await cleanImage(Buffer.from(signature.split(',')[1], 'base64'), 'signature', true))
    signatureText = 'Drawn signature attached as signature.png'
  }
  const lines = [`ACCOUNT APPLICATION ${reference}`, `Received: ${new Date().toISOString()}`, 'Application only: this does not open or approve an account.']
  for (const [heading, keys] of Object.entries(groups)) {
    lines.push('', heading.toUpperCase())
    for (const key of keys) {
      const value = typeof data[key] === 'boolean' ? (data[key] ? 'Yes' : 'No') : key === 'product_type' ? products[data[key]] : data[key].trim().replaceAll('_', ' ') || 'Not supplied'
      lines.push(`${label(key)}: ${value}`)
    }
  }
  lines.push('', 'SIGNATURE', signatureText, '', `Privacy notice version: ${privacyVersion}`, '', 'DOCUMENTS', ...attachments.map(file => file.filename))
  return { text: lines.join('\n'), attachments }
}
