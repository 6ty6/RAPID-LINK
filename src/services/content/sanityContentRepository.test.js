import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSanityPublishedNews, getSanityPublishedVacancies, getSanitySharedContent, getSanityLoanCalculatorSettings } from './sanityContentRepository.js'
import { loanCalculatorSettings } from '../../content/loanCalculator.js'
afterEach(() => vi.unstubAllGlobals())
const respond = result => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok:true, json:async()=>({result}) }))
describe('Sanity public content', () => {
  it('reads the configured project with published perspective and no credentials', async () => {
    respond([{slug:'notice',title:'Published notice'}])
    expect((await getSanityPublishedNews())[0].title).toBe('Published notice')
    const [endpoint,options]=fetch.mock.calls[0]
    expect(endpoint.hostname).toBe('04unhu7g.api.sanity.io')
    expect(options.cache).toBe('no-store')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(endpoint.searchParams.get('perspective')).toBe('published')
    expect(endpoint.searchParams.get('query')).toContain('isPublished == true')
    expect(options.credentials).toBe('omit')
    expect(options.headers.Authorization).toBeUndefined()
  })
  it('honours an empty published careers list and maps existing fields', async () => {
    respond([])
    expect(await getSanityPublishedVacancies()).toEqual([])
    respond([{title:'Officer',employmentType:'Full-time',applicationEmail:'jobs@example.test',isPublished:true}])
    expect((await getSanityPublishedVacancies())[0]).toMatchObject({employment_type:'Full-time',application_email:'jobs@example.test',responsibilities:[]})
  })
  it.each(['network', 'http', 'malformed'])('uses the CDN when the API has a %s failure', async failure => {
    const fetchMock = vi.fn()
    if (failure === 'network') fetchMock.mockRejectedValueOnce(Error('offline'))
    else fetchMock.mockResolvedValueOnce({ok:failure !== 'http',json:async()=>({result:null})})
    fetchMock.mockResolvedValueOnce({ok:true,json:async()=>({result:[{title:'CDN news'}]})})
    vi.stubGlobal('fetch',fetchMock)
    expect((await getSanityPublishedNews())[0].title).toBe('CDN news')
    expect(fetchMock.mock.calls.map(([url])=>url.hostname)).toEqual(['04unhu7g.api.sanity.io','04unhu7g.apicdn.sanity.io'])
    expect(fetchMock.mock.calls[1][0].searchParams.get('perspective')).toBe('published')
  })
  it('does not consult stale CDN content after a successful empty API response', async () => {
    respond([])
    expect(await getSanityPublishedNews()).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('aborts a stalled API request before trying the CDN', async () => {
    vi.useFakeTimers()
    try {
      const fetchMock=vi.fn().mockImplementationOnce((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout')))))
        .mockResolvedValueOnce({ok:true,json:async()=>({result:[]})})
      vi.stubGlobal('fetch',fetchMock)
      const pending=getSanityPublishedNews()
      await vi.advanceTimersByTimeAsync(5000)
      expect(await pending).toEqual([])
      expect(fetchMock.mock.calls[1][0].hostname).toBe('04unhu7g.apicdn.sanity.io')
    } finally {vi.useRealTimers()}
  })
  it('reports failed and malformed remote reads instead of silently republishing local news', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:async()=>({})}))
    await expect(getSanityPublishedNews()).rejects.toThrow()
    respond(null)
    await expect(getSanityPublishedNews()).rejects.toThrow('unexpected')
  })
  it('preserves app and footer defaults for incomplete shared settings', async () => {
    respond([{appTitle:'Updated app heading'}])
    const settings=await getSanitySharedContent()
    expect(settings.appDownload.title).toBe('Updated app heading')
    expect(settings.appDownload.image).toBe('/assets/rapidlink-mobile-app.png')
    expect(settings.footer.headings.contact).toBe('Get in touch')
  })
  it('accepts complete approved pricing and rejects unapproved or incomplete schedules', async () => {
    const record={...loanCalculatorSettings,weeklySchedule:Object.entries(loanCalculatorSettings.weeklyPaymentsByMonth).map(([months,payments])=>({months:Number(months),payments}))}
    respond([record])
    expect((await getSanityLoanCalculatorSettings()).maximumPrincipal).toBe(20000)
    expect(fetch.mock.calls[0][0].searchParams.get('query')).toContain('approvalStatus == "approved"')
    respond([{...record,approvalStatus:'provisional'}])
    await expect(getSanityLoanCalculatorSettings()).rejects.toThrow('approval')
    respond([{...record,weeklySchedule:[]}])
    await expect(getSanityLoanCalculatorSettings()).rejects.toThrow('weekly schedule')
  })
})
