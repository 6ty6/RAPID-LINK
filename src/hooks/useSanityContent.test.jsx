import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
vi.mock('../services/content/sanityContentRepository.js',()=>({sanityEnabled:true}))
import useSanityContent from './useSanityContent.js'
afterEach(()=>vi.restoreAllMocks())
describe('Sanity content lifecycle',()=>{
  it('shares an in-flight request and honours successful unpublishing',async()=>{
    const load=vi.fn().mockResolvedValue([])
    const first=renderHook(()=>useSanityContent('empty-test',load,['local']))
    const second=renderHook(()=>useSanityContent('empty-test',load,['local']))
    await waitFor(()=>expect(first.result.current.loading).toBe(false))
    expect(first.result.current.data).toEqual([])
    expect(second.result.current.data).toEqual([])
    expect(load).toHaveBeenCalledTimes(1)
  })
  it('clears public lists on failure but retains reviewed settings fallbacks',async()=>{
    const fail=vi.fn().mockRejectedValue(Error('offline'))
    const list=renderHook(()=>useSanityContent('failed-list',fail,['old vacancy'],{clearOnError:true}))
    const settings=renderHook(()=>useSanityContent('failed-settings',fail,{rate:6}))
    await waitFor(()=>expect(list.result.current.error).toBe(true))
    expect(list.result.current.data).toEqual([])
    await waitFor(()=>expect(settings.result.current.error).toBe(true))
    expect(settings.result.current.data).toEqual({rate:6})
  })
})
