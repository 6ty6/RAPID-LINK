import {useId} from 'react'
import './editor-help.css'

export const sectionHelp = {
 Homepage:'Edit the homepage flyers, product selection, service links and section headings. Announcements appear in the shared website ticker.',
 Products:'Create and edit product pages. Their titles, introductions and photos also supply homepage cards. Select homepage products separately under Homepage.',
 'Digital Channels':'Edit service artwork, instructions and official links. Card flipping and styling remain automatic.',
 'Loan Calculator':'Page appearance changes wording and pictures. Rates, fees & approval changes validated calculator settings; the public rates table is separate.',
 'About RapidLink':'Edit the company introduction, vision, mission and the verified impact numbers.',
 'Board of Directors':'Edit the existing public director profiles, portraits and biographies. Drag profiles to reorder them.',
 News:'Edit the newsroom headings and articles. Feature on homepage prioritises a published article in the three homepage spaces.',
 Careers:'Edit headings, department filters and vacancies. Open/closed controls application availability; visibility controls listing.',
 FAQs:'Edit the FAQ banner and individual questions and answers.',
 'Contact & branches':'Edit contact headings, official contacts, branch addresses, maps and social links shared across the website.',
 'Rates & documents':'Edit the published investment rate table and upload the Controller loan rates guide. These do not change calculator pricing.',
 'Account-opening update':'Edit the current unavailable/coming-soon notice. This does not enable form submissions.',
 'Loan application guidance':'Edit application guidance wording. The secure application destination is configured separately by the developer.',
 Abena:'Edit prepared replies, quick questions and approved links. This is a rules-based assistant; topics and privacy checks remain in code.',
 'Shared website content':'Edit the footer, shared footer links and app-download promotion. Store destinations are configured separately.',
 'Navigation menus':'Edit dropdown labels and destinations shared by the header and footer. Adding a product does not automatically add a menu link.',
}

const fieldHelp = {
 isPublished:'Turn on to include this record or item on the public website, then Publish. Turning it off and publishing hides it.',
 displayOrder:'Lower numbers appear first. This does not select a product for the homepage.',
 slug:'The product or page address. Keep existing addresses unchanged to avoid broken links. Product slugs must be unique.',
 loan:'Turn on for a loan product: its action leads to loan application guidance. Turn off for savings/investment account opening.',
 featuredSlugs:'Choose published products by name, then use Move up / Move down to set their homepage order. Removing a selection does not delete the product.',
 id:'Stable identifier used by the website. Existing identifiers cannot be edited.',
 icon:'Choose a supported website icon; this changes the symbol, not the information or action.',
 variations:'Alternative approved answers for this same topic. Abena cycles through them; this does not teach her new topics.',
 followUpVariations:'Replies for follow-up prompts such as “tell me more” after this topic.',
 imageAlt:'Describe what the photograph conveys for customers using a screen reader. This does not change the picture.',
 heroImage:'The banner photograph on the product page. The main Image supplies its detail photograph and homepage card.',
 image:'Upload or select the existing approved artwork or photograph. Products share this image between their detail page and homepage card.',
 benefits:'Public product benefits, shown on its detail page. These do not change calculator settings.',
 requirements:'Approved account or loan requirements, shown on the product page.',
 sectionHeading:'The bold introduction above the product benefits and requirements.',
 status:'Open vacancies allow applications. Closed vacancies remain visible if visibility is on but show their closed status.',
 publishedAt:'Orders newsroom articles and stories within each homepage priority group. This date does not schedule publication.',
}

export function EditorFieldHelp(props){
 const id=useId()
 const help=props.schemaType.description || fieldHelp[props.name] || `Edit ${props.schemaType.title || props.name}. Save the public version with Publish; a draft alone does not change the website.`
 return <div className="cms-help-field">
  <details className="cms-field-help"><summary title={help} aria-label={`Help for ${props.schemaType.title || props.name}`} aria-describedby={id}>i</summary><p id={id}>{help}</p></details>
  {props.renderDefault(props)}
 </div>
}

export const helpIcon = text => function SectionHelpIcon(){
 return <svg viewBox="0 0 24 24" width="1em" height="1em" role="img" aria-label={text} tabIndex={0}><title>{text}</title><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 11v6m0-10v1" stroke="currentColor" strokeWidth="2"/></svg>
}
