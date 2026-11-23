import { describe, it, expect } from 'vitest'
import { getHelpReply, getConversationalReply, whatsappChatbotUrl } from './helpReplies'

describe('Abena prepared replies', () => {
  it('uses the user-supplied WhatsApp number without copying questions into the link', () => {
    expect(new URL(whatsappChatbotUrl).pathname).toBe('/15554784866')
    expect(new URL(whatsappChatbotUrl).searchParams.get('text')).toBe('Hello Abena, I would like to continue this conversation.')
  })
  it('recognises greetings and company topics with prepared answers', () => {
    expect(getHelpReply('Hello Abena!').id).toBe('greeting')
    expect(getHelpReply('Thank you').id).toBe('thanks')
    expect(getHelpReply('Where are your branches?').id).toBe('branches')
    expect(getHelpReply('How can I open an account?').text).toContain('cannot be submitted')
    expect(getHelpReply('I want to speak to someone').id).toBe('contact')
  })
  it('does not fabricate unavailable pricing, hours or unrelated answers', () => {
    for (const text of ['What are your loan interest rates?', 'What are your opening hours?', 'Who won the world cup?', '', 'x'.repeat(301)]) {
      expect(getHelpReply(text).id).toBe('unavailable')
      expect(getHelpReply(text).text).toContain('do not have confirmed information')
    }
  })
  it('redirects sensitive information requests without echoing the input', () => {
    const secret = 'My account number is 123456789012'
    expect(getHelpReply(secret).id).toBe('privacy')
    expect(getHelpReply(secret).text).not.toContain('123456789012')
  })
  it('varies polite phrasing without changing facts and follows a known topic', () => {
    expect(getConversationalReply('Hello', { turn: 0 }).text).not.toBe(getConversationalReply('Hello', { turn: 1 }).text)
    const reply = getConversationalReply('tell me more', { lastTopic: 'branches' })
    expect(reply.id).toBe('branches')
    expect(reply.text).toContain('Asylum Down')
    expect(getConversationalReply('tell me more').id).toBe('unavailable')
    expect(getConversationalReply('Show me your FAQs').id).toBe('faqs')
  })
  it('offers warm guidance for general requests while keeping specific questions specific', () => {
    for (const phrase of ['help me', 'I need help', 'Can you help me?', 'Hi Abena, please help me!', 'I need some assistance', 'Could someone help me please', 'I am confused', 'I do not know where to start', 'please assist me', 'support me', 'We need help']) {
      expect(getHelpReply(phrase).id, phrase).toBe('help')
      expect(getConversationalReply(phrase).text, phrase).not.toContain('do not have confirmed information')
    }
    expect(getHelpReply('Help me open an account').id).toBe('account')
    expect(getHelpReply('I need help with loan interest rates').id).toBe('unavailable')
    expect(getHelpReply('Help me with my account number 123456789').id).toBe('privacy')
    expect(getHelpReply('Can you help me solve algebra?').id).toBe('unavailable')
  })
})
