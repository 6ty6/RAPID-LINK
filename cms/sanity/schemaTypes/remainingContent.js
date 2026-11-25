import {defineArrayMember,defineField,defineType} from 'sanity'
import {remainingCms} from '../../../src/content/remainingCms.js'
import {isMedia,isFile} from '../../../src/content/cmsModelUtils.js'
const names={meta:'Page title & search description',hero:'Page banner',slides:'Flyer slider',products:'Featured products',services:'Services section',tools:'Rates & calculator section',news:'News section',body:'Company introduction',purpose:'Vision & Mission',impact:'Impact heading',members:'Director profiles',rows:'Rate table',file:'Downloadable PDF',preview:'Preview file',groups:'Menu groups',topics:'Prepared answers',variations:'Answer variations',slug:'Page address',listing:'Section introduction',content:'Page content',pending:'Connection pending',connected:'Portal connected'}
const label=key=>names[key]||key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,char=>char.toUpperCase())
function shape(value,name='content') {
 return Object.entries(value).map(([key,item])=>{
  const field={name:key,title:label(key)}
  if(key==='body')return defineField({...field,type:'array',of:[{type:'block',styles:[{title:'Paragraph',value:'normal'}],lists:[],marks:{decorators:[{title:'Bold',value:'strong'},{title:'Emphasis',value:'em'}],annotations:[]}}]})
  if(isMedia(key,item))return defineField({...field,type:isFile(item)?'file':'image',validation:rule=>rule.required()})
  if(Array.isArray(item))return defineField({...field,type:'array',of:[typeof item[0]==='object'?defineArrayMember({name:`${name}${key}Item`,type:'object',fields:shape(item[0],name+key),preview:{select:{title:'title',subtitle:'description',media:'image'}}}):{type:'string'}]})
  if(item && typeof item==='object')return defineField({...field,type:'object',fields:shape(item,name+key)})
  if(typeof item==='boolean')return defineField({...field,title:key==='isPublished'?'Show on website':field.title,type:'boolean',initialValue:false})
  if(typeof item==='number')return defineField({...field,type:'number'})
  const link=['link','to','href','aboutLink'].includes(key)
  return defineField({...field,type:(key==='biography'||String(item).length>180)?'text':'string',readOnly:key==='id',validation:link?rule=>rule.custom(text=>!text||/^(\/(?!\/)|https:\/\/|tel:|mailto:)/i.test(text)||'Use a site path, HTTPS, telephone or email destination.'):key==='slug'?rule=>rule.required().regex(/^[a-z0-9-]+$/):item?rule=>rule.required().min(1):undefined})
 })
}
export const remainingContentTypes=Object.entries(remainingCms).map(([key,model])=>{
 const sample=model.collection?model.content[0]:model.content
 const groups=Object.keys(sample).filter(field=>sample[field]&&typeof sample[field]==='object'&&!model.collection).map((field,index)=>({name:field,title:label(field),default:index===0}))
 return defineType({name:model.schema,title:model.title,type:'document',description:'Existing approved public website content. Publish to apply changes. The layout and behaviour remain in website code.',groups,
  fields:shape(sample,key).map(field=>({ ...field,...(groups.some(group=>group.name===field.name)?{group:field.name}:{}),...(model.schema==='publicPageCopy'&&['listing','departments'].includes(field.name)?{hidden:({document})=>field.name==='departments'?document?.slug!=='rapidlink-careers':document?.slug==='faqs'}:{}) })),
  preview:{select:{title:model.collection?'title':'meta.title',media:'image'},prepare:({title,media})=>({title:title||model.title,media})},
 })
})
