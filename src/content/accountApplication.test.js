import { describe, expect, it } from 'vitest'
import { imageError, requestFits, fields } from './accountApplication'
describe('account API guide limits',()=>{
 it('allows only JPG/PNG images up to decimal 2 MB',()=>{
  expect(imageError({type:'image/png',size:2000000})).toBe('')
  expect(imageError({type:'image/png',size:2000001})).not.toBe('')
  expect(imageError({type:'application/pdf',size:100})).not.toBe('')
 })
 it('counts base64 expansion against the total 9 MB request',()=>{
  expect(requestFits({}, {photo:{size:2000000},signature:{size:2000000}})).toBe(true)
  expect(requestFits({},Object.fromEntries(['photo','signature','id_front','id_back'].map(key=>[key,{size:2000000}])))).toBe(false)
 })
 it('uses exactly the documented account types and optional next of kin',()=>{
  expect(fields.find(field=>field[0]==='account_type')[4]).toEqual(['savings','current'])
  expect(fields.filter(field=>field[0].startsWith('next_of_kin')).every(field=>!field[3])).toBe(true)
 })
})
