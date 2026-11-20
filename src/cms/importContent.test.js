import { describe, it, expect, vi } from 'vitest'
import { bundledDrafts, importBundledContent } from './importContent'
import { validateData } from './models'
import { resolveMedia } from './public'
describe('existing-content migration', () => {
  it('produces valid drafts with unique keys without importing any calculator settings', () => {
    const records=bundledDrafts()
    expect(records.length).toBeGreaterThan(25)
    expect(new Set(records.map(record=>record.kind+':'+record.slug)).size).toBe(records.length)
    records.forEach(record=>{expect(record.version).toBe(0);expect(()=>validateData(record.kind,record.data)).not.toThrow()})
    expect(records.some(record=>record.slug==='loan-calculator')).toBe(false)
  })
  it('skips existing records and never calls a publication action',async()=>{
    const first=bundledDrafts()[0]
    const request=vi.fn(async (path)=>path==='/entries'&&request.mock.calls.length===1?[first]:{})
    const result=await importBundledContent(request)
    expect(result.skipped).toBe(1)
    expect(result.imported).toBe(bundledDrafts().length-1)
    expect(request.mock.calls.some(([path])=>path.includes('/action'))).toBe(false)
    expect(request.mock.calls.slice(1).some(([,options])=>options.body.slug===first.slug)).toBe(false)
  })
  it('resolves nested published image references without changing their source records',()=>{
    const value={image:'media:11111111-1111-4111-8111-111111111111',sections:[{text:'Approved words'}]}
    const result=resolveMedia(value)
    expect(result.image).toContain('/api/cms/media/11111111-1111-4111-8111-111111111111')
    expect(result.sections).toEqual(value.sections)
    expect(value.image).toMatch(/^media:/)
  })
})
