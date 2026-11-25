import {describe,it,expect} from 'vitest'
import {normalisePublicDocument,resolveRateDocument,documentDownloadUrl} from './documents.js'
const row={id:'rates',title:'Current rates',slug:'current-rates',isPublished:true,showInLibrary:true,file:'https://cdn.sanity.io/files/04unhu7g/production/current.pdf'}
describe('public document library',()=>{
 it('accepts published PDFs and rejects hidden, missing and unsafe files',()=>{
  expect(normalisePublicDocument(row).title).toBe('Current rates')
  for(const extension of ['xlsx','xls','docx','doc','pptx','csv','txt','ods','odt','rtf'])expect(normalisePublicDocument({...row,file:row.file.replace('.pdf','.'+extension)}).extension).toBe(extension)
  for(const bad of [{...row,isPublished:false},{...row,file:null},{...row,file:'javascript:alert(1)'},{...row,file:'https://example.test/private.html'}])expect(normalisePublicDocument(bad)).toBeNull()
 })
 it('shares the selected PDF with the rates viewer and does not revive the old file when it is hidden',()=>{
  const page={file:'/downloads/old.pdf',preview:'/downloads/old-preview.txt'}
  expect(resolveRateDocument(page,{rateDocumentSelected:true,linkedDocument:row})).toMatchObject({file:row.file,preview:row.file,dialogTitle:row.title})
  expect(resolveRateDocument(page,{rateDocumentSelected:true,linkedDocument:null})).toMatchObject({file:'',preview:'',documentUnavailable:true})
  expect(resolveRateDocument(page,{})).toBe(page)
  const workbook={...row,version:'2026 revision',file:row.file.replace('.pdf','.xlsx')}
  expect(resolveRateDocument(page,{rateDocumentSelected:true,linkedDocument:workbook})).toMatchObject({file:workbook.file,dialogTitle:'Current rates — 2026 revision'})
  expect(row.file).toContain('.pdf')
 })
 it('uses the supported CDN download filename without changing local PDF links',()=>{
  expect(documentDownloadUrl(row.file,'rates.pdf')).toContain('?dl=rates.pdf')
  expect(documentDownloadUrl('/downloads/rate-chart.pdf')).toBe('/downloads/rate-chart.pdf')
 })
})
