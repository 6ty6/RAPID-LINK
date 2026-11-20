// Curated public information only. No AI, remote requests or customer records.
export const whatsappChatbotUrl = 'https://wa.me/233550584668'
const assistance = [['Continue on WhatsApp', whatsappChatbotUrl], ['Call our team', 'tel:+233303955183'], ['Contact details', '/contact']]
const unavailable = { id: 'unavailable', text: 'I do not have confirmed information about that. Please continue with our WhatsApp chatbot or contact our team for assistance.', links: assistance }

export function getHelpReply(message) {
  const text = String(message || '').trim().toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ')
  if (!text || text.length > 300) return unavailable
  if (/\b(password|pin|otp|one.time code|ghana card|account number|my balance|my transaction)\b/.test(text) || /(?:\d[\s-]*){8,}/.test(text)) return { id: 'privacy', text: 'Please do not share account numbers, identity documents, passwords, PINs or one-time codes here. I cannot access customer accounts. Contact our team through an approved channel.', links: assistance }
  const helpRequest = text.replace(/[!?.,:;]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^(?:(?:hi|hello|hey|abena|please|kindly|good morning|good afternoon|good evening)\s+)+/, '')
    .replace(/(?:\s+(?:please|kindly|abena|today))+$/, '')
  const asksForHelp = [
    /^(?:help|assist|support)(?: me| us)?$/,
    /^(?:(?:i|we) )?(?:really |urgently )?(?:need|want|would like) (?:some |your |a little |urgent )?(?:help|assistance|support)$/,
    /^(?:can|could|would|will) (?:you|someone|somebody) (?:please )?(?:help|assist|support)(?: me| us)?$/,
    /^(?:i am|im|we are|were) (?:lost|confused|stuck)$/,
    /^i (?:dont|do not) know (?:where to start|what to do)$/,
    /^is (?:anyone|anybody) (?:there|available)$/,
  ].some(pattern => pattern.test(helpRequest))
  if (asksForHelp) return { id: 'help', text: 'Of course, I am here to help you find your next step. Is your question about opening an account, loans, savings, branch locations or contacting our team? Choose a topic below, or tell me a little more without sharing private account details.', links: [['Speak to our team', 'tel:+233303955183'], ['Continue on WhatsApp', whatsappChatbotUrl]] }
  if (/\b(opening hours|opening time|closing time|close today|open today|weekend|holiday|apr|rate|rates|interest|fees?|charges?|approval time|how much|how long)\b/.test(text)) return unavailable
  if (/\b(whatsapp|chatbot)\b/.test(text)) return { id: 'whatsapp', text: 'You can continue with RapidLink’s WhatsApp chatbot. It opens a separate conversation in WhatsApp; I will not send this question or any conversation history with the link.', links: [['Open WhatsApp chatbot', whatsappChatbotUrl]] }
  if (/\b(speak|talk|contact|hotline|phone|telephone|email|human|agent|someone|complaint)\b/.test(text)) return { id: 'contact', text: 'You can call RapidLink on 030 395 5183 or email info@rapidlinkfinance.com. I cannot connect a live agent inside this chat.', links: [['Call RapidLink', 'tel:+233303955183'], ['Email RapidLink', 'mailto:info@rapidlinkfinance.com'], ['Contact details', '/contact']] }
  if (/\b(branch|branches|location|locations|located|address|asylum down|madina)\b/.test(text)) return { id: 'branches', text: 'Our listed locations are the Head Office at Asylum Down, Accra, and the Madina branch. Please use our contact page for addresses, directions and telephone numbers. I do not have confirmed details for other locations.', links: [['Find our branches', '/contact#branch-map-title']] }
  if (/\b(open|opening|apply for|create|start)\b.*\baccount\b|\baccount opening\b/.test(text)) return { id: 'account', text: 'Online account opening is coming soon. Applications cannot be submitted through this website yet. Our team can help you with the next steps.', links: [['Account-opening update', '/open-account'], ['Contact our team', '/contact']] }
  if (/\b(loan|loans|borrow|borrowing|controller|cagd)\b/.test(text)) return { id: 'loans', text: 'I can direct you to RapidLink’s published loan information and application guidance. Eligibility and approval are assessed by the loans team. I cannot approve a loan or confirm personalised terms.', links: [['Loan application guidance', '/apply-loan'], ['Controller loan information', '/deduct-at-source-loan']] }
  if (/\b(savings|save|investment|investments|fixed deposit|products|services)\b/.test(text)) return { id: 'products', text: 'The website has information about RapidLink savings, investment and loan products. Explore the relevant product page, or ask our team for confirmed current terms.', links: [['Rapid Savings', '/rapid-savings'], ['Fixed Deposit', '/fixed-deposit'], ['Contact our team', '/contact']] }
  if (/\b(about rapidlink|who is rapidlink|what is rapidlink|company|mission|vision)\b/.test(text)) return { id: 'company', text: 'I can help you find public information about RapidLink Microfinance. Our Institutional Profile describes the company, its mission and vision.', links: [['About RapidLink', '/institutional-profile']] }
  if (/\b(faq|faqs|common questions|frequently asked)\b/.test(text)) return { id: 'faqs', text: 'You can find our published frequently asked questions on the website. If your question is not covered, our team can help you check.', links: [['Read the FAQs', '/faqs']] }
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)( abena)?[!.?]*$/.test(text)) return { id: 'greeting', text: 'Hello! I’m Abena, RapidLink’s automated website guide. Ask about our branches, products, loan guidance or account opening, or choose a topic below.', links: [] }
  if (/^(thanks|thank you|thank you abena|thanks abena|great|okay|ok)[!.?]*$/.test(text)) return { id: 'thanks', text: 'You’re welcome. I’m here if you need help finding RapidLink information.', links: [] }
  if (/^(bye|goodbye|see you|bye abena)[!.?]*$/.test(text)) return { id: 'goodbye', text: 'Goodbye! You can open Abena again whenever you need help.', links: [] }
  if (/^(how are you|how are you abena|who are you|what is your name|whats your name)[!.?]*$/.test(text)) return { id: 'identity', text: 'I’m Abena, RapidLink’s automated website guide. I use prepared answers, not AI, and can help you find public company information.', links: [] }
  return unavailable
}

// Variation changes the tone, never the underlying company facts.
export function getConversationalReply(message, { lastTopic = '', turn = 0 } = {}) {
  const followUp = String(message).trim().toLowerCase().replace(/[!.?]+$/, '')
  const prompts = { branches: 'branch locations', loans: 'loan guidance', account: 'open an account', products: 'savings products', company: 'about rapidlink', contact: 'contact', faqs: 'faqs', whatsapp: 'whatsapp' }
  const contextual = ['tell me more', 'more please', 'yes please', 'please continue', 'and then', 'what next'].includes(followUp) && prompts[lastTopic]
  const reply = getHelpReply(contextual ? prompts[lastTopic] : message)
  const index = Math.abs(turn) % 3
  if (reply.id === 'help') return { ...reply, text: [
    "Of course, I'm here to help. Is it about opening an account, loan information, savings or finding a branch? Choose a topic below, or tell me a little more. Please keep private account details to yourself.",
    "Certainly. Let us take it one step at a time. What would you like help with: an account, our products, a branch or speaking to our team? You can choose a topic below.",
    "You are welcome to ask. I can help you find RapidLink information about accounts, loans, savings and branches. Tell me what you need, or choose a topic below. For personal assistance, our team is also available through the contact options.",
  ][index] }
  if (reply.id === 'greeting') return { ...reply, text: ["Hello! I'm Abena. It is lovely to welcome you to RapidLink. How may I help you today?", "Hello! Welcome to RapidLink. I'm Abena, your automated guide. What would you like help with?", "Hello! A warm welcome from RapidLink. I'm Abena. I can help with branches, product information and your next steps."][index] }
  if (reply.id === 'thanks') return { ...reply, text: ["You're very welcome. Is there anything else about RapidLink I can help you find?", "It is my pleasure to help. What else would you like to know?", "You're welcome. Take your time; I'm here if you need another direction."][index] }
  if (reply.id === 'unavailable') return { ...reply, text: ["I'd like to help, but I do not have confirmed information about that. Please try our WhatsApp chatbot or speak with our team so you can get an accurate answer.", "Thank you for asking. I do not have confirmed information about that, and I would rather not mislead you. Our WhatsApp chatbot or support team may be able to help.", "I'm sorry, I do not have confirmed information about that just yet. You can continue on WhatsApp or contact our team using the options below."][index] }
  if (reply.id === 'identity') return { ...reply, text: /how are you/.test(followUp) ? "I'm here and ready to help, thank you for asking. How may I assist you with RapidLink today?" : "My name is Abena, RapidLink's automated website guide. It is a pleasure to help you find the information you need." }
  if (reply.id === 'goodbye') return { ...reply, text: 'Thank you for visiting RapidLink. Have a lovely day, and do come back if you need help finding anything else.' }
  if (reply.id === 'privacy') return reply
  const opening = contextual ? 'Of course. Here is the information I can confirm. ' : ['Certainly. ', 'Happy to help. ', 'Of course. '][index]
  return { ...reply, text: opening + reply.text }
}
