export const allowedDocumentExtensions=['pdf','xls','xlsx','csv','doc','docx','ppt','pptx','txt','rtf','odt','ods']
export const documentExtension=file=>typeof file==='string'?file.match(/\.([a-z0-9]+)(?:[?#]|$)/i)?.[1]?.toLowerCase()||'':''
export const documentProjection='"id":_id,title,slug,description,category,documentDate,version,isPublished,showInLibrary,displayOrder,"file":file.asset->url'
export function normalisePublicDocument(row){
 if(!row||row.isPublished!==true||typeof row.title!=='string'||!row.title.trim()||typeof row.file!=='string'
  || !/^(https:\/\/cdn\.sanity\.io\/files\/|\/downloads\/)/i.test(row.file)||!allowedDocumentExtensions.includes(documentExtension(row.file)))return null
 return {id:row.id,title:row.title,slug:/^[a-z0-9-]+$/.test(row.slug||'')?row.slug:'rapidlink-document',description:row.description||'',category:row.category||'Other',documentDate:row.documentDate||'',version:row.version||'',file:row.file,extension:documentExtension(row.file),showInLibrary:row.showInLibrary===true}
}
export function documentDownloadUrl(file,filename=`RapidLink-document.${documentExtension(file)||'pdf'}`){
 if(!file.startsWith('https://cdn.sanity.io/'))return file
 const url=new URL(file);url.searchParams.set('dl',filename);return url.href
}
export function resolveRateDocument(page,row){
 if(!row.rateDocumentSelected)return page // Existing standalone guides remain compatible.
 const document=normalisePublicDocument(row.linkedDocument)
 if(!document)return {...page,file:'',preview:'',documentUnavailable:true}
 return {...page,file:document.file,preview:document.file,dialogTitle:`${document.title}${document.version?` — ${document.version}`:''}`,documentUnavailable:false}
}
