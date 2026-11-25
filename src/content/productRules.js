export const reservedProductSlugs = ['home','apply-loan','open-account','institutional-profile','board-of-directors','digital-channels','rates','rate-chart','loan-calculator','faqs','stories','rapidlink-careers','content-management','cms','accept-invite','career-management','contact','assets','downloads']
export const isProductSlug = slug => typeof slug==='string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && !reservedProductSlugs.includes(slug)

export function newProductFallback(row){
 if(!isProductSlug(row.slug) || !['title','category','intro','sectionHeading','image','heroImage','imageAlt'].every(key=>typeof row[key]==='string'&&row[key].trim())
  || !Array.isArray(row.benefits) || !row.benefits.length || !row.benefits.every(value=>typeof value==='string'&&value.trim())
  || !Array.isArray(row.requirements) || !row.requirements.length || !row.requirements.every(value=>typeof value==='string'&&value.trim()) || typeof row.loan!=='boolean')return null
 // Never borrow another product's terms, images or requirements for a new record.
 return {...row}
}
