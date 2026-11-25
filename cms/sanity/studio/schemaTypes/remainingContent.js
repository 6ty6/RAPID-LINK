import {defineArrayMember,defineField,defineType} from 'sanity'
import {remainingCms} from '../../../../src/content/remainingCms.js'
import {isMedia,isFile} from '../../../../src/content/cmsModelUtils.js'
import {isProductSlug} from '../../../../src/content/productRules.js'
import FeaturedProductsInput from '../FeaturedProductsInput.jsx'
const names={meta:'Page title & search description',hero:'Page banner',slides:'Flyer slider',products:'Featured products',services:'Services section',tools:'Rates & calculator section',news:'News section',body:'Company introduction',purpose:'Vision & Mission',impact:'Impact heading',members:'Director profiles',rows:'Rate table',file:'Downloadable PDF',preview:'Preview file',groups:'Menu groups',topics:'Prepared answers',variations:'Answer variations',slug:'Page address',listing:'Section introduction',content:'Page content',pending:'Connection pending',connected:'Portal connected'}
const label=key=>names[key]||key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,char=>char.toUpperCase())
function shape(value,name='content') {
 return Object.entries(value).map(([key,item])=>{
  const field={name:key,title:label(key)}
  if(key==='featuredSlugs')return defineField({...field,title:'Homepage products',description:'Choose published products by name. Move them up or down to change their order; remove only removes the homepage card.',type:'array',of:[{type:'string'}],components:{input:FeaturedProductsInput},validation:rule=>rule.unique()})
  if(key==='body')return defineField({...field,type:'array',of:[{type:'block',styles:[{title:'Paragraph',value:'normal'}],lists:[],marks:{decorators:[{title:'Bold',value:'strong'},{title:'Emphasis',value:'em'}],annotations:[]}}]})
  if(isMedia(key,item))return defineField({...field,type:isFile(item)?'file':'image',validation:rule=>rule.required()})
  if(Array.isArray(item))return defineField({...field,type:'array',...(name==='abena'&&key==='topics'?{description:'Edit these supported topics and their answer variations. New topic recognition requires a code change.',options:{disableActions:['add','remove','duplicate']}}:{}),of:[typeof item[0]==='object'?defineArrayMember({name:`${name}${key}Item`,type:'object',initialValue:()=>({id:crypto.randomUUID(),isPublished:false}),fields:shape(item[0],name+key),preview:{select:{title:'title',subtitle:'label',media:'image'}}}):{type:'string'}],...(name==='products'&&['benefits','requirements'].includes(key)?{validation:rule=>rule.required().min(1)}:{})})
  if(item && typeof item==='object')return defineField({...field,type:'object',fields:shape(item,name+key)})
  if(typeof item==='boolean')return defineField({...field,title:key==='isPublished'?'Show on website':field.title,type:'boolean',initialValue:false})
  if(typeof item==='number')return defineField({...field,type:'number'})
  const link=['link','to','href','aboutLink'].includes(key)
  if(key==='icon'&&name==='homepageservicesitems')return defineField({...field,type:'string',options:{list:['savings','business','digital']},validation:rule=>rule.required()})
  // These legacy fields are retained for import compatibility but are not rendered.
  if((name==='homepageslides'&&['eyebrow','text','action'].includes(key)) || (name==='navigationgroups'&&key==='href'))return defineField({...field,type:'string',hidden:true})
  if(name==='products'&&key==='category')return defineField({...field,type:'string',options:{list:['Savings','Investments','Loans']},validation:rule=>rule.required()})
  if(name==='products'&&key==='slug')return defineField({...field,type:'string',description:'Unique page address, for example rapid-business-savings. Avoid changing published addresses; existing links do not redirect automatically.',validation:rule=>rule.required().custom(async(slug,context)=>{
   if(!isProductSlug(slug))return 'Use lowercase words separated by hyphens, and avoid existing website page addresses.'
   const id=context.document?._id?.replace(/^drafts\./,'')
   const count=await context.getClient({apiVersion:'2026-11-14'}).fetch('count(*[_type == "publicProduct" && slug == $slug && !(_id in [$id,$draft])])',{slug,id:id||'',draft:`drafts.${id}`})
   return count===0||'Another product already uses this address.'
  })})
  return defineField({...field,type:(key==='biography'||String(item).length>180)?'text':'string',readOnly:key==='id',validation:link?rule=>rule.custom(text=>!text||/^(\/(?!\/)|https:\/\/|tel:|mailto:)/i.test(text)||'Use a site path, HTTPS, telephone or email destination.'):key==='slug'?rule=>rule.required().regex(/^[a-z0-9-]+$/):item?rule=>rule.required().min(1):undefined})
 })
}
export const remainingContentTypes=Object.entries(remainingCms).map(([key,model])=>{
 const sample=model.collection?model.content[0]:model.content
 const groups=Object.keys(sample).filter(field=>sample[field]&&typeof sample[field]==='object'&&!model.collection).map((field,index)=>({name:field,title:label(field),default:index===0}))
 if(model.schema==='publicRateGuide'){
  groups.forEach(group=>{group.default=false})
  groups.unshift({name:'document',title:'Current document & viewer',default:true})
 }
 return defineType({name:model.schema,title:model.title,type:'document',description:'Existing approved public website content. Publish to apply changes. The layout and behaviour remain in website code.',groups,
  initialValue:model.schema==='publicProduct'?{isPublished:false,loan:false,benefits:[],requirements:[],displayOrder:11}:undefined,
  fields:[...(model.schema==='publicRateGuide'?[defineField({name:'rateDocument',group:'document',title:'Current rates document from Documents library',type:'reference',to:[{type:'publicDocument'}],options:{filter:'isPublished == true'},description:'Select a published rates version from Documents library. PDFs preview on the page; Excel and other supported formats download.'})]:[]),...shape(sample,key).map(field=>({ ...field,...(model.schema==='publicRateGuide'&&field.name!=='hero'?{group:'document'}:{}),...(groups.some(group=>group.name===field.name)?{group:field.name}:{}),...(model.schema==='publicPageCopy'&&['listing','departments'].includes(field.name)?{hidden:({document})=>field.name==='departments'?document?.slug!=='rapidlink-careers':document?.slug==='faqs'}:{}),...(model.schema==='publicRateGuide'&&['file','preview'].includes(field.name)?{hidden:({document})=>Boolean(document?.rateDocument),validation:rule=>rule.custom((value,context)=>context.document?.rateDocument||value?.asset?._ref?true:'Upload the file or select a document from the library.')}:{}) }))],
  preview:{select:{title:model.collection?'title':'meta.title',media:'image'},prepare:({title,media})=>({title:title||model.title,media})},
 })
})
