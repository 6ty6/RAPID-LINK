import { describe, it, expect } from 'vitest'
import { getManagedHelpReply } from './abenaReplies'
const answer = { id: 'approved-answer', kind: 'abena', questions: ['Where can I find the test notice?'], replies: ['Please visit the test notice page.'], links: [{label:'Notice',href:'/stories/test-notice'}] }
const cms = { enabled:true,loading:false,error:false,records:[answer] }
describe('CMS and Abena integration',()=>{
  it('uses a matching published reply and its approved links',()=>{
    const reply=getManagedHelpReply('Where can I find the test notice',cms)
    expect(reply.text).toBe(answer.replies[0]);expect(reply.links).toEqual([['Notice','/stories/test-notice']])
    expect(getManagedHelpReply('tell me more',cms,{lastTopic:'cms:approved-answer'}).text).toBe(answer.replies[0])
  })
  it('never falls back to unconfirmed static company facts in CMS mode',()=>{
    expect(getManagedHelpReply('Where are your branches?',{...cms,records:[]}).id).toBe('unavailable')
    expect(getManagedHelpReply('Where are your branches?',{enabled:false}).id).toBe('branches')
  })
  it('does not let a CMS reply override privacy protection',()=>{
    expect(getManagedHelpReply('my account number', {...cms,records:[{...answer,questions:['my account number']}]}).id).toBe('privacy')
  })
  it('withdrawn answers and outages do not supply a cached reply',()=>{
    expect(getManagedHelpReply(answer.questions[0],{...cms,records:[]}).id).toBe('unavailable')
    expect(getManagedHelpReply(answer.questions[0],{...cms,error:true}).id).toBe('unavailable')
    expect(getManagedHelpReply('tell me more',{...cms,records:[]},{lastTopic:'cms:approved-answer'}).id).toBe('unavailable')
  })
  it('can use an exactly matched published FAQ while keeping friendly greetings',()=>{
    expect(getManagedHelpReply('A test question?',{...cms,records:[{kind:'faq',id:'faq',title:'A test question?',answer:'A confirmed answer.'}]}).text).toBe('A confirmed answer.')
    expect(getManagedHelpReply('hello',cms).id).toBe('greeting')
  })
})
