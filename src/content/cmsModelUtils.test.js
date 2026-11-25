import {describe,it,expect} from 'vitest'
import {remainingCms} from './remainingCms.js'
import {projection,completeContent} from './cmsModelUtils.js'
describe('editorial CMS records',()=>{
 it('keeps all current products and company records in structured fallbacks',()=>{
  expect(remainingCms.products.content).toHaveLength(10)
  expect(remainingCms.board.content.members).toHaveLength(3)
  expect(remainingCms.institutional.content.body).toHaveLength(3)
  expect(remainingCms.homepage.content.slides).toHaveLength(3)
  const keys=Object.keys(remainingCms.products.content[0])
  for(const product of remainingCms.products.content)expect(Object.keys(product).sort()).toEqual([...keys].sort())
 })
 it('projects nested media while preserving rich text and published visibility',()=>{
  const query=projection(remainingCms.homepage.content)
  expect(query).toContain('slides[isPublished != false]')
  expect(query).toContain('image.asset->url')
  expect(projection(remainingCms.institutional.content)).toContain('body')
  expect(projection(remainingCms.rateGuide.content)).toContain('file.asset->url')
 })
 it('retains missing-field fallbacks but honours intentionally empty arrays',()=>{
  const local=remainingCms.homepage.content
  const result=completeContent({slides:[],meta:{title:'New page title'}},local)
  expect(result.slides).toEqual([])
  expect(result.meta.title).toBe('New page title')
  expect(result.meta.description).toBe(local.meta.description)
  expect(()=>completeContent({groups:[{items:[{href:'javascript:alert(1)'}]}]},remainingCms.navigation.content)).toThrow('Unsupported')
 })
})
