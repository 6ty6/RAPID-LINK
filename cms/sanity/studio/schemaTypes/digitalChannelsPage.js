import { defineArrayMember, defineField, defineType } from 'sanity'
export const digitalChannelsPage = defineType({
  name:'digitalChannelsPage',title:'Digital channels page',type:'document',
  description:'The /digital-channels page. Keep codes, merchant IDs and service links verified before publishing. Reorder the cards by dragging them.',
  groups:[{name:'banner',title:'Banner',default:true},{name:'channels',title:'Service cards'}],
  fields:[
    defineField({name:'title',title:'Page title',type:'string',group:'banner',validation:rule=>rule.required().max(100)}),
    defineField({name:'description',title:'Search description',type:'text',rows:2,group:'banner',validation:rule=>rule.required().max(240)}),
    defineField({name:'bannerImage',title:'Current page banner',type:'image',group:'banner',description:'Keep the complete flyer readable. The website preserves the existing banner layout.',validation:rule=>rule.required()}),
    defineField({name:'bannerAlt',title:'Banner image description',type:'string',group:'banner',validation:rule=>rule.required().max(240)}),
    defineField({name:'channels',title:'Service cards in display order',type:'array',group:'channels',of:[defineArrayMember({
      name:'digitalChannel',title:'Digital channel',type:'object',
      fields:[
        defineField({name:'title',title:'Service name',type:'string',validation:rule=>rule.required().max(100)}),
        defineField({name:'description',title:'How to use the service',type:'text',rows:4,description:'Shown on the back of the card. Include the exact verified dial code or merchant ID.',validation:rule=>rule.required().max(1200)}),
        defineField({name:'image',title:'Current service artwork',type:'image',validation:rule=>rule.required()}),
        defineField({name:'imageAlt',title:'Image description',type:'string',validation:rule=>rule.required().max(240)}),
        defineField({name:'link',title:'Optional service destination',type:'url',description:'Leave empty for USSD or merchant instructions. Never put applicant data in a link.',validation:rule=>rule.uri({scheme:['https']})}),
        defineField({name:'isPublished',title:'Show this card on the website',type:'boolean',initialValue:true,validation:rule=>rule.required()}),
      ],
      preview:{select:{title:'title',media:'image',visible:'isPublished'},prepare:({title,media,visible})=>({title,media,subtitle:visible?'Visible on website':'Hidden from website'})},
    })],validation:rule=>rule.required().max(30)}),
  ],
  preview:{select:{title:'title',media:'bannerImage'},prepare:({title,media})=>({title:title || 'Digital channels',subtitle:'/digital-channels',media})},
})
