import { useState } from 'react'
import { ArrowRight, FileText, Building2, Briefcase, Info, Menu, X } from '../icons'
import { models } from './models'

export const contentGroups = [
  { title: 'Website & homepage', description: 'Shape the pages and promotions visitors see.', icon: FileText, kinds: ['page', 'product', 'slide', 'announcement'] },
  { title: 'News & careers', description: 'Share company updates and job opportunities.', icon: Briefcase, kinds: ['news', 'vacancy'] },
  { title: 'Company information', description: 'Keep locations, people and public resources current.', icon: Building2, kinds: ['branch', 'board', 'channel', 'document'] },
  { title: 'Customer help', description: 'Maintain useful answers and contact information.', icon: Info, kinds: ['faq', 'abena', 'settings'] },
]
export const contentDescriptions = {
  news: 'Write and review company news before it reaches the newsroom.', vacancy: 'Manage job descriptions, departments and application details.',
  page: 'Edit page introductions, sections and search descriptions.', product: 'Maintain approved product descriptions and requirements.',
  slide: 'Choose homepage flyers, their order and destinations.', announcement: 'Manage the short notices shown across the website.',
  branch: 'Keep branch addresses, phone numbers and opening hours up to date.', board: 'Maintain approved biographies, roles and portraits.',
  channel: 'Explain verified digital services and how customers can use them.', document: 'Organise links to approved public documents.',
  faq: 'Give customers clear answers to common questions.', abena: 'Prepare approved reply content for future connection to Abena.',
  settings: 'Keep official public contact information consistent.',
}
export const statusLabels = { draft: 'Draft', review: 'Awaiting review', approved: 'Ready to publish', published: 'Published', archived: 'Archived' }
export function CmsNavigation({ view, kind, records, admin, navigate }) {
  const [expanded, setExpanded] = useState(false)
  function go(next, nextKind) { if (navigate(next, nextKind) !== false) setExpanded(false) }
  return <aside className={`cms-nav ${expanded ? 'is-expanded' : ''}`} aria-label="CMS sections">
    <div className="cms-nav-brand"><span className="cms-brand-mark">R<span>•</span></span><div><strong>RapidLink</strong><small>Content management</small></div><button className="cms-nav-toggle" aria-label="Browse sections" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? <X size={20} /> : <Menu size={20} />}</button></div>
    <button className={`cms-nav-overview ${view === 'overview' ? 'is-active' : ''}`} aria-current={view === 'overview' ? 'page' : undefined} onClick={() => go('overview')}><span>Workspace overview</span><ArrowRight size={16} /></button>
    <nav className="cms-nav-groups" aria-label="Content categories">{contentGroups.map(group => <section className="cms-nav-group" key={group.title}><h2>{group.title}</h2>{group.kinds.map(key => <button key={key} className={view === 'content' && kind === key ? 'is-active' : ''} aria-current={view === 'content' && kind === key ? 'page' : undefined} onClick={() => go('content', key)}><span>{models[key].label}</span><span className="cms-nav-count">{records.filter(record => record.kind === key).length}</span></button>)}</section>)}
      <section className="cms-nav-group"><h2>Workspace tools</h2>{[['calculator', 'Loan calculator'], ['media', 'Image library'], ['audit', 'Activity log'], ...(admin ? [['staff', 'Staff access'], ['tools', 'Import & export']] : [])].map(([key, label]) => <button className={view === key ? 'is-active' : ''} aria-current={view === key ? 'page' : undefined} key={key} onClick={() => go(key)}><span>{label}</span></button>)}</section>
    </nav>
  </aside>
}
export function CmsOverview({ member, records, navigate }) {
  return <div className="cms-overview"><div className="cms-welcome"><p className="eyebrow">Your workspace</p><h2>What would you like to update?</h2><p>Choose a content group below. Save your changes as a draft, then send them for approval.</p><span className="cms-role-label">{member.department} · {member.role}</span></div>
    <div className="cms-summary" aria-label="Content workflow summary">{[['draft', 'Drafts', 'Still being written'], ['review', 'Awaiting review', 'Waiting for approval'], ['approved', 'Ready to publish', 'Approved for the next step']].map(([key, label, help]) => <div key={key} className={`cms-summary-item summary-${key}`}><span>{label}</span><strong>{records.filter(record => record.status === key).length}</strong><small>{help}</small></div>)}</div>
    <div className="cms-group-grid">{contentGroups.map(group => <section className="cms-group-card" key={group.title}><div className="cms-group-heading"><span className="cms-group-icon"><group.icon size={22} /></span><div><h3>{group.title}</h3><p>{group.description}</p></div></div><div className="cms-group-links">{group.kinds.map(key => <button key={key} aria-label={`Manage ${models[key].label}`} onClick={() => navigate('content', key)}><span>{models[key].label}</span><span><small>{records.filter(record => record.kind === key).length} records</small><ArrowRight size={16} /></span></button>)}</div></section>)}</div>
    <button className="cms-calculator-shortcut" aria-label="Review loan calculator" onClick={() => navigate('calculator')}><span><strong>Loan calculator</strong><small>Review approved rates and limits, or test a calculation.</small></span><ArrowRight size={20} /></button>
    <div className="cms-getting-started"><strong>How publishing works</strong><ol><li><span>1</span>Write a draft</li><li><span>2</span>A colleague reviews it</li><li><span>3</span>Publish the approved version</li></ol></div>
  </div>
}
export function CmsWorkflowSteps({ status }) {
  const step = status === 'published' ? 3 : ['review', 'approved'].includes(status) ? 2 : 1
  const help = { draft: 'Make your changes, save the draft, then submit it for review.', review: 'This draft is waiting for a different authorised colleague to approve it.', approved: 'Review is complete. An authorised approver can publish this version.', published: 'This version is published. Saving more changes starts a new draft.', archived: 'This record is archived. Save changes to start a new draft.' }
  return <div className="cms-progress"><ol aria-label="Publishing steps">{['Write', 'Review', 'Publish'].map((label, index) => <li key={label} className={index + 1 <= step ? 'is-reached' : ''} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1}</span>{label}</li>)}</ol><p>{help[status]}</p></div>
}
