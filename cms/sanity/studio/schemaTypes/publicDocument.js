import {defineField,defineType} from 'sanity'
import {allowedDocumentExtensions} from '../../../../src/content/documents.js'
export const publicDocument=defineType({
 name:'publicDocument',title:'Public document',type:'document',
 description:'Approved public documents only. Add each rates version as a separate record so older files are retained. Never upload customer applications or identification documents.',
 initialValue:{isPublished:false,showInLibrary:false,displayOrder:1},
 fields:[
  defineField({name:'title',title:'Document title',type:'string',validation:rule=>rule.required().max(160)}),
  defineField({name:'slug',title:'Download name',type:'string',description:'Lowercase words separated by hyphens, for example controller-loan-rates-2026. The website adds the correct file extension.',validation:rule=>rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100)}),
  defineField({name:'description',title:'Description',type:'text',rows:3,validation:rule=>rule.max(600)}),
  defineField({name:'category',title:'Category',type:'string',options:{list:['Loan rates','Forms','Guides','Notices','Other']},validation:rule=>rule.required()}),
  defineField({name:'file',title:'Document upload',type:'file',options:{accept:allowedDocumentExtensions.map(extension=>`.${extension}`).join(',')},validation:rule=>rule.required().custom(async(value,context)=>{
   if(!value?.asset?._ref)return 'Upload a document.'
   const asset=await context.getClient({apiVersion:'2026-11-14'}).fetch('*[_id == $id][0]{extension,mimeType}',{id:value.asset._ref})
   return allowedDocumentExtensions.includes(asset?.extension?.toLowerCase())||`Choose PDF, Excel, Word, PowerPoint, CSV or a supported text document (${allowedDocumentExtensions.join(', ')}).`
  })}),
  defineField({name:'documentDate',title:'Document date',type:'date'}),
  defineField({name:'version',title:'Version or reference',type:'string',validation:rule=>rule.max(100)}),
  defineField({name:'isPublished',title:'Available on website',type:'boolean'}),
  defineField({name:'showInLibrary',title:'List on Documents page',type:'boolean'}),
  defineField({name:'displayOrder',title:'Display order',type:'number',validation:rule=>rule.required().integer().min(0)}),
 ],
 preview:{select:{title:'title',category:'category',version:'version',visible:'isPublished'},prepare:({title,category,version,visible})=>({title,subtitle:`${category||'Document'}${version?` · ${version}`:''} · ${visible?'Available':'Hidden'}`})},
})
