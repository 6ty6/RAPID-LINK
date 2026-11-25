import {describe,it,expect} from 'vitest'
import {isProductSlug,newProductFallback} from './productRules.js'
describe('new CMS products',()=>{
 const product={slug:'new-savings',title:'New savings',category:'Savings',intro:'Approved introduction',sectionHeading:'Save for tomorrow',image:'https://cdn.sanity.io/new.jpg',heroImage:'https://cdn.sanity.io/banner.jpg',imageAlt:'Approved photo',benefits:['A benefit'],requirements:['A requirement'],loan:false}
 it('accepts a complete independent record and rejects missing terms instead of borrowing another product',()=>{
  expect(newProductFallback(product)).toEqual(product)
  expect(newProductFallback({...product,requirements:null})).toBeNull()
  expect(newProductFallback({...product,heroImage:null})).toBeNull()
 })
 it('prevents collisions with existing website routes and malformed addresses',()=>{
  expect(isProductSlug('new-savings')).toBe(true)
  for(const slug of ['rates','cms','contact','loan-calculator','two/parts','bad--slug','../home','Upper'])expect(isProductSlug(slug)).toBe(false)
 })
})
