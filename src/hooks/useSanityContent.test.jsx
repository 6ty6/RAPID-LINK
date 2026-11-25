import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
vi.mock('../services/content/sanityContentRepository.js',()=>({sanityEnabled:true}))
import useSanityContent from './useSanityContent.js'
afterEach(()=>vi.restoreAllMocks())
describe('Sanity content lifecycle',()=>{
  it('refreshes shared readers without resetting unchanged settings, then applies published edits',async()=>{
    vi.useFakeTimers()
    const load=vi.fn().mockResolvedValue({rate:6})
    const first=renderHook(()=>useSanityContent('live-settings',load,{rate:6}))
    const second=renderHook(()=>useSanityContent('live-settings',load,{rate:6}))
    try {
      await act(async()=>{})
      const original=first.result.current.data
      expect(load).toHaveBeenCalledTimes(1)
      await act(async()=>{await vi.advanceTimersByTimeAsync(5000)})
      expect(load).toHaveBeenCalledTimes(2)
      expect(first.result.current.data).toBe(original)
      load.mockResolvedValue({rate:7})
      await act(async()=>{await vi.advanceTimersByTimeAsync(5000)})
      expect(first.result.current.data).toEqual({rate:7})
      expect(second.result.current.data).toEqual({rate:7})
      const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true)
      await act(async()=>{await vi.advanceTimersByTimeAsync(10000)})
      expect(load).toHaveBeenCalledTimes(3)
      hidden.mockReturnValue(false)
      await act(async()=>{document.dispatchEvent(new Event('visibilitychange'))})
      expect(load).toHaveBeenCalledTimes(4)
      first.unmount(); second.unmount()
      await vi.advanceTimersByTimeAsync(10000)
      expect(load).toHaveBeenCalledTimes(4)
    } finally {first.unmount();second.unmount();vi.useRealTimers()}
  })
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
