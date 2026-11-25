export const isMedia = (key,value) => typeof value==='string' && (/^\/assets\//.test(value)||/^\/downloads\//.test(value))
export const isFile = value => /\.(pdf|txt)$/i.test(value)
export function projection(value) {
 return Object.entries(value).map(([key,item])=>{
  if(key==='body')return key
  if(isMedia(key,item))return `"${key}":${key}.asset->url`
  if(Array.isArray(item) && item[0] && typeof item[0]==='object')return `${key}[isPublished != false]{${projection(item[0])}}`
  if(item && typeof item==='object' && !Array.isArray(item))return `${key}{${projection(item)}}`
  return key
 }).join(',')
}
export function completeContent(value,sample,key=''){
 if(typeof value==='string'&&['link','href','to','aboutLink','whatsappUrl'].includes(key)&&value&&!/^(\/(?!\/)|https:\/\/|tel:|mailto:)/i.test(value))throw Error('Unsupported public destination.')
 if(value==null)return structuredClone(sample)
 if(Array.isArray(sample))return Array.isArray(value)?value.map(item=>sample[0]&&typeof sample[0]==='object'?completeContent(item,sample[0]):item):structuredClone(sample)
 if(sample&&typeof sample==='object')return Object.fromEntries(Object.entries(sample).map(([key,item])=>[key,completeContent(value[key],item,key)]))
 return typeof value===typeof sample?value:sample
}
