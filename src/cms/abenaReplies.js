import { getConversationalReply, whatsappChatbotUrl } from '../content/helpReplies'
const normalise = value => String(value || '').toLowerCase().trim().replace(/[’']/g, '').replace(/[!?.,:;]+/g, ' ').replace(/\s+/g, ' ').trim()
export function managedContacts(records = []) {
  const settings = records.find(record => record.kind === 'settings')
  const phone = (settings?.supportPhone || '').replace(/[^+0-9]/g, '')
  return { phone: /^\+?\d{6,15}$/.test(phone) ? `tel:${phone}` : 'tel:+233303955183', whatsapp: settings?.whatsapp || whatsappChatbotUrl, email: settings?.email || 'info@rapidlinkfinance.com' }
}
export function getManagedHelpReply(message, cms, context = {}) {
  const prepared = getConversationalReply(message, { ...context, lastTopic: context.lastTopic?.startsWith('cms:') ? '' : context.lastTopic })
  if (!cms.enabled) return prepared
  const contacts = managedContacts(cms.records)
  const assistance = [['Continue on WhatsApp', contacts.whatsapp], ['Call our team', contacts.phone], ['Contact details', '/contact']]
  const unavailable = { id: 'unavailable', text: cms.loading ? 'I am still loading our published information. Please try again shortly, or contact our team for assistance.' : 'I do not have published, confirmed information to answer that question. Our team will be happy to help you check.', links: assistance }
  // These replies explain the interface or protect privacy, rather than supply CMS facts.
  if (['privacy', 'greeting', 'thanks', 'goodbye', 'identity', 'help', 'account'].includes(prepared.id)) return { ...prepared, links: prepared.links?.map(([label, href]) => [label, href === whatsappChatbotUrl ? contacts.whatsapp : href === 'tel:+233303955183' ? contacts.phone : href]) }
  if (cms.loading || cms.error) return unavailable
  const text = normalise(message), records = cms.records || []
  const entry = records.find(record => record.kind === 'abena' && ((record.questions || []).some(question => normalise(question) === text) || (/^(tell me more|more details|explain|please explain)$/.test(text) && context.lastTopic === `cms:${record.id}`)))
  if (entry?.replies?.some(reply => reply.trim())) {
    const replies = entry.replies.filter(reply => reply.trim())
    return { id: `cms:${entry.id}`, text: replies[Math.abs(context.turn || 0) % replies.length], links: (entry.links || []).map(link => [link.label, link.href]).filter(([, href]) => href) }
  }
  const faq = records.find(record => record.kind === 'faq' && normalise(record.title) === text)
  if (faq) return { id: `cms:${faq.id}`, text: faq.answer, links: [['More frequently asked questions', '/faqs']] }
  if (prepared.id === 'contact' || prepared.id === 'whatsapp') return { id: 'contact', text: 'Of course. You can contact our team or continue in a separate WhatsApp conversation. I will not forward this chat or any personal information.', links: [...assistance, ['Email our team', `mailto:${contacts.email}`]] }
  if (prepared.id === 'branches') {
    const branches = records.filter(record => record.kind === 'branch')
    return branches.length ? { id: 'branches', text: 'Our published branch information lists: ' + branches.map(record => `${record.title} — ${record.address}`).join('; ') + '. Please visit our contact page for directions.', links: [['Branch information', '/contact']] } : unavailable
  }
  if (['products', 'loans'].includes(prepared.id)) {
    const products = records.filter(record => record.kind === 'product' && (prepared.id !== 'loans' || record.loan))
    return products.length ? { id: prepared.id, text: 'Certainly. You can explore these published products. Our team can confirm the current terms and help with your next step.', links: products.slice(0, 6).map(record => [record.title, '/' + record.slug]) } : unavailable
  }
  if (prepared.id === 'faqs' && records.some(record => record.kind === 'faq')) return { id: 'faqs', text: 'You can find our published answers on the FAQs page. If your question is not covered, I can help you contact our team.', links: [['Read the FAQs', '/faqs']] }
  if (prepared.id === 'company') {
    const page = records.find(record => record.kind === 'page' && record.slug === 'institutional-profile')
    if (page) return { id: 'company', text: page.intro, links: [['About RapidLink', '/institutional-profile']] }
  }
  return unavailable
}
