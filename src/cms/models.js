import { calculatorDraftDefaults, validateCalculatorConfig } from '../content/calculatorConfig.js'
export const departments = ['Credit', 'Finance', 'Human Resources', 'Marketing/Sales', 'Operations', 'Strategy Support']
export const roles = ['writer', 'approver', 'admin']
const field = (key, label, type = 'text', required = false, extra = {}) => ({ key, label, type, required, ...extra })
const text = (key, label, required = false) => field(key, label, 'text', required)
const area = (key, label, required = false) => field(key, label, 'textarea', required)
const list = (key, label) => field(key, label, 'list')
const image = [field('image', 'Image', 'image'), text('imageAlt', 'Image description')]
const link = (key, label) => field(key, label, 'link')
export const models = {
  calculator: { label: 'Loan calculator settings', department: 'Credit', singleton: true, fields: [
    field('minimumPrincipal','Minimum loan amount','number',true), field('maximumPrincipal','Maximum loan amount','number',true),
    field('minimumMonths','Minimum duration (months)','number',true), field('maximumMonths','Maximum duration (months)','number',true),
    field('monthlyFlatRate','Monthly flat interest rate (%)','number',true), field('processingFeeRate','Processing fee (%)','number',true),
    field('insuranceFeeRate','Insurance fee (%)','number',true), field('managementFeeRate','Management fee (%)','number',true), field('earlySettlementRate','Early settlement fee (%)','number',true),
    field('weeklySchedule','Approved weekly schedule','objects',true,{fields:[field('month','Duration in months','number',true),field('payments','Number of weekly payments','number',true)]}),
    area('heroIntro','Calculator introduction',true), area('disclaimer','Estimate disclosure',true), field('effectiveDate','Effective date','date',true),
    area('approvalReference','Credit approval reference',true),
    field('verificationCases','Verified repayment examples','objects',true,{fields:[field('principal','Example principal','number',true),field('duration','Example duration in months','number',true),field('frequency','Example frequency','select',true,{options:['monthly','weekly']}),field('paymentsMade','Example instalments paid','number',true),field('expectedTotal','Expected total repayment','number',true),field('expectedInstalment','Expected instalment','number',true),field('expectedSettlement','Expected early settlement','number',true)]}),
  ] },
  news: { label: 'News', department: 'Marketing/Sales', fields: [text('category', 'Category', true), field('publishedAt', 'Publication date', 'date', true), area('summary', 'Summary', true), ...image, field('featured', 'Featured story', 'boolean'), field('sections', 'Article sections', 'objects', true, { fields: [text('heading', 'Section heading'), list('paragraphs', 'Paragraphs')] }), link('externalLink', 'Related external link'), text('externalLabel', 'External link label')] },
  vacancy: { label: 'Careers', department: 'Human Resources', fields: [text('department', 'Hiring department', true), text('location', 'Location', true), text('employment_type', 'Employment type', true), area('summary', 'Role summary', true), list('responsibilities', 'Responsibilities'), field('status', 'Vacancy status', 'select', true, { options: ['open', 'closed'] }), field('application_email', 'Application email', 'email', true)] },
  page: { label: 'Pages', department: 'Marketing/Sales', fields: [text('eyebrow', 'Section label'), area('intro', 'Introduction'), ...image, field('sections', 'Page sections', 'objects', false, { fields: [text('heading', 'Heading'), list('paragraphs', 'Paragraphs')] }), text('seoTitle', 'Search title'), area('seoDescription', 'Search description')] },
  product: { label: 'Products', department: 'Credit', fields: [field('category', 'Category', 'select', true, { options: ['Loans', 'Savings', 'Investments'] }), area('intro', 'Introduction', true), ...image, field('heroImage', 'Banner image', 'image'), list('benefits', 'Benefits'), list('requirements', 'Requirements'), field('loan', 'Loan product', 'boolean')] },
  announcement: { label: 'Announcements', department: 'Marketing/Sales', fields: [area('message', 'Announcement', true), link('href', 'Optional destination'), field('order', 'Display order', 'number')] },
  faq: { label: 'FAQs', department: 'Operations', fields: [area('answer', 'Answer', true), text('category', 'Category'), field('order', 'Display order', 'number')] },
  branch: { label: 'Branches', department: 'Operations', fields: [area('address', 'Address', true), text('digital', 'Digital address'), list('phones', 'Phone numbers'), text('mapQuery', 'Map search address', true), text('hours', 'Approved opening hours')] },
  board: { label: 'Board profiles', department: 'Strategy Support', fields: [text('role', 'Role', true), ...image, area('biography', 'Approved biography', true), field('order', 'Display order', 'number')] },
  channel: { label: 'Digital channels', department: 'Operations', fields: [area('description', 'Description', true), ...image, link('href', 'Service destination'), text('code', 'Verified service code')] },
  document: { label: 'Public documents', department: 'Operations', fields: [area('description', 'Description', true), link('file', 'Approved document URL'), text('version', 'Document version'), field('effectiveDate', 'Effective date', 'date'), text('category', 'Category')] },
  slide: { label: 'Homepage flyers', department: 'Marketing/Sales', fields: [field('image', 'Flyer', 'image', true), text('imageAlt', 'Flyer description', true), link('link', 'Destination'), field('order', 'Display order', 'number')] },
  abena: { label: 'Abena answers', department: 'Operations', fields: [list('questions', 'Example questions'), field('replies', 'Prepared reply variations', 'list', true), field('links', 'Related links', 'objects', false, { fields: [text('label', 'Link label', true), link('href', 'Destination')] }), text('source', 'Approved information source', true)] },
  settings: { label: 'Site settings', department: 'Strategy Support', singleton: true, fields: [field('email', 'Public email', 'email', true), text('supportPhone', 'Support phone', true), text('loanPhone', 'Loan support phone'), link('whatsapp', 'WhatsApp destination'), area('footerCopy', 'Footer text')] },
}

export function emptyData(kind) {
  if (kind === 'calculator') return calculatorDraftDefaults()
  return Object.fromEntries(models[kind].fields.map(f => [f.key, f.type === 'boolean' ? false : f.type === 'number' ? 0 : ['list', 'objects'].includes(f.type) ? [] : f.options?.[0] || '']))
}

export function safeLink(value, imageOnly = false) {
  if (!value) return true
  if (/^media:[a-f0-9-]{36}$/.test(value)) return true
  if (!imageOnly && /^\/[a-z0-9][a-z0-9/-]*$/.test(value) && !value.includes('//')) return true
  if (/^\/(?:assets|downloads)\/[a-zA-Z0-9_./ -]+$/.test(value) && !value.includes('..')) return true
  try {
    const url = new URL(value)
    if (url.username || url.password || /[\x00-\x1f]/.test(value)) return false
    return url.protocol === 'https:' || (!imageOnly && ['tel:', 'mailto:'].includes(url.protocol))
  } catch { return false }
}

export function validateData(kind, data, strict = false) {
  const model = Object.hasOwn(models, kind) ? models[kind] : null
  if (!model || !data || typeof data !== 'object' || Array.isArray(data)) throw Error('Choose a supported content type.')
  function check(fields, record, prefix = '') {
    if (!record || typeof record !== 'object' || Array.isArray(record) || Object.keys(record).some(k => !fields.some(f => f.key === k))) throw Error('Unexpected content fields.')
    for (const f of fields) {
      const value = record[f.key]
      if (value === undefined) { if (strict && f.required) throw Error(`${prefix}${f.label} is required.`); continue }
      if (f.type === 'boolean') { if (typeof value !== 'boolean') throw Error(`Check ${f.label}.`) }
      else if (f.type === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1e9) throw Error(`Check ${f.label}.`) }
      else if (['list', 'objects'].includes(f.type)) {
        if (!Array.isArray(value) || value.length > 100 || (strict && f.required && (!value.length || (f.type === 'list' && !value.some(item => typeof item === 'string' && item.trim()))))) throw Error(`Check ${f.label}.`)
        for (const item of value) { if (f.type === 'objects') check(f.fields, item, `${f.label}: `); else if (typeof item !== 'string' || item.length > 10000) throw Error(`Check ${f.label}.`) }
      } else {
        if (typeof value !== 'string' || value.length > (f.type === 'textarea' ? 20000 : 2000) || value.includes('\0') || (strict && f.required && !value.trim())) throw Error(`Check ${prefix}${f.label}.`)
        if (value && f.type === 'select' && !f.options.includes(value)) throw Error(`Check ${f.label}.`)
        if (value && ['image', 'link'].includes(f.type) && !safeLink(value, f.type === 'image')) throw Error(`Use an approved HTTPS link or local public asset for ${f.label}.`)
        if (value && f.type === 'email' && !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value)) throw Error(`Check ${f.label}.`)
        if (value && f.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw Error(`Check ${f.label}.`)
      }
    }
  }
  check(model.fields, data)
  if (kind === 'calculator') validateCalculatorConfig(data, {strict})
  if (BufferSafeSize(data) > 150000) throw Error('Content is too large.')
  if (strict && kind === 'document' && !data.file) throw Error('An approved document URL is required before publication.')
  if (strict && data.image && !data.imageAlt?.trim()) throw Error('Add an image description.')
  return data
}
function BufferSafeSize(data) { return new TextEncoder().encode(JSON.stringify(data)).length }
