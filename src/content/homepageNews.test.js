import {describe,it,expect} from 'vitest'
import {selectHomepageNews} from './homepageNews.js'
describe('homepage news selection',()=>{
 const items=[{slug:'newest',publishedAt:'2026-11-25'},{slug:'chosen',publishedAt:'2026-11-01',featured:true},{slug:'middle',publishedAt:'2026-11-20'},{slug:'older',publishedAt:'2026-10-01'}]
 it('prioritises featured articles and fills remaining places without mutating the newsroom',()=>{
  expect(selectHomepageNews(items).map(item=>item.slug)).toEqual(['chosen','newest','middle'])
  expect(items[0].slug).toBe('newest')
 })
 it('limits multiple featured stories by date and restores recency when none are featured',()=>{
  expect(selectHomepageNews(items.map(item=>({...item,featured:true}))).map(item=>item.slug)).toEqual(['newest','middle','chosen'])
  expect(selectHomepageNews(items.map(item=>({...item,featured:false}))).map(item=>item.slug)).toEqual(['newest','middle','chosen'])
  expect(selectHomepageNews([])).toEqual([])
 })
})
