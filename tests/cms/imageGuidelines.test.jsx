import {afterEach,describe,it,expect,vi} from 'vitest'
import {render,screen,cleanup} from '@testing-library/react'
import {getImageGuidance,getImageDimensions} from '../../cms/sanity/studio/imageGuidelines.js'
import {schemaTypes} from '../../cms/sanity/studio/schemaTypes/index.js'
import {EditorFieldHelp} from '../../cms/sanity/studio/EditorHelp.jsx'
afterEach(()=>{cleanup();delete globalThis.cmsTestDocument})
describe('CMS image size guidance',()=>{
 it('covers every image upload field including nested cards and portraits',()=>{
  const missing=[]
  function walk(fields,type,path=[]){
   for(const field of fields){
    const next=[...path,field.name]
    if(field.type==='image'&&!getImageGuidance({_type:type,slug:'rapidlink-careers'},next))missing.push(`${type}.${next.join('.')}`)
    if(field.fields)walk(field.fields,type,next)
    for(const member of field.of||[])if(member.fields)walk(member.fields,type,[...next,{_key:'one'}])
   }
  }
  for(const type of schemaTypes)walk(type.fields,type.name)
  expect(missing).toEqual([])
 })
 it('distinguishes shared product crops, page banners and portrait channel artwork',()=>{
  expect(getImageGuidance({_type:'publicProduct',slug:'business-loan'},['image'])).toMatchObject({width:1500,height:1000,ratio:'3:2'})
  expect(getImageGuidance({_type:'publicProduct',slug:'rapid-savings'},['image'])).toMatchObject({width:1200,height:1500,ratio:'4:5'})
  expect(getImageGuidance({_type:'publicInstitutionalPage'},['hero','image']).display).toContain('on the right')
  const document={_type:'digitalChannelsPage',channels:[{_key:'mobile-app',title:'Renamed app'}]}
  expect(getImageGuidance(document,['channels',{_key:'mobile-app'},'image'])).toMatchObject({width:1000,height:1200})
  expect(getImageGuidance({_type:'publicPageCopy',slug:'faqs'},['hero','image']).placement).toContain('FAQ')
 })
 it('reads real dimensions without another API request and does not guess when metadata is missing',()=>{
  expect(getImageDimensions({asset:{_ref:'image-abc123-2172x724-webp'}})).toEqual({width:2172,height:724})
  expect(getImageDimensions({asset:{_ref:'image-abc123-0x0-svg'}})).toBeNull()
  expect(getImageDimensions()).toBeNull()
 })
 it('shows recommendations and selected dimensions while leaving the upload control and validation unchanged',()=>{
  globalThis.cmsTestDocument={_type:'publicInstitutionalPage'}
  const value={asset:{_ref:'image-abc123-2172x724-webp'}}
  const validation=[{level:'warning',message:'An existing validation message'}]
  const renderDefault=vi.fn(()=> <button>Original upload control</button>)
  render(<EditorFieldHelp name="image" path={['hero','image']} schemaType={{name:'image',title:'Banner image'}} value={value} validation={validation} renderDefault={renderDefault}/> )
  const strip=screen.getByRole('complementary',{name:'Image size guidance for Banner image'})
  expect(strip).toHaveTextContent('Recommended: 2160 × 720 px (3:1)')
  expect(strip).toHaveTextContent('Selected: 2172 × 724 px')
  expect(strip).toHaveStyle({background:'#eef3ff',borderLeft:'3px solid #ff7400',borderRadius:'8px'})
  expect(strip.querySelectorAll('p,small')).toHaveLength(0)
  expect(screen.getByLabelText('Help for Banner image')).toHaveAttribute('title',expect.stringContaining('Keep the crowd/main subjects on the right'))
  expect(screen.getByRole('button',{name:'Original upload control'})).toBeVisible()
  expect(renderDefault.mock.calls[0][0].value).toBe(value)
  expect(renderDefault.mock.calls[0][0].validation).toBe(validation)
  expect(renderDefault.mock.calls[0][0].description).toBeUndefined()
 })
})
