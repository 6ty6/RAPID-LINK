import {useState} from 'react'
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest'
import {render,screen,waitFor,cleanup} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeaturedProductsInput from '../../cms/sanity/studio/FeaturedProductsInput.jsx'
import {EditorFieldHelp} from '../../cms/sanity/studio/EditorHelp.jsx'

beforeEach(()=>{
 globalThis.cmsTestDocument={_type:'publicHomepage'}
 globalThis.cmsTestClient={fetch:vi.fn().mockResolvedValue([{slug:'savings',title:'Savings',isPublished:true},{slug:'loan',title:'Loan',isPublished:true},{slug:'hidden',title:'Hidden',isPublished:false}])}
})
afterEach(()=>{cleanup();delete globalThis.cmsTestClient;delete globalThis.cmsTestDocument})

function Picker({onPatch=()=>{}}){
 const [value,setValue]=useState(['savings'])
 return <FeaturedProductsInput value={value} onChange={patch=>{onPatch(patch);setValue(patch.value)}}/>
}
describe('CMS editor controls',()=>{
 it('selects products by name and saves explicit reorder/removal patches only',async()=>{
  const user=userEvent.setup(),onPatch=vi.fn()
  render(<Picker onPatch={onPatch}/> )
  await screen.findByRole('option',{name:'Loan'})
  expect(onPatch).not.toHaveBeenCalled()
  expect(screen.queryByRole('option',{name:'Hidden'})).not.toBeInTheDocument()
  await user.selectOptions(screen.getByRole('combobox',{name:'Add homepage product'}),'loan')
  expect(onPatch).toHaveBeenLastCalledWith({type:'set',path:[],value:['savings','loan']})
  await user.click(screen.getByRole('button',{name:'Move Loan up'}))
  expect(onPatch).toHaveBeenLastCalledWith({type:'set',path:[],value:['loan','savings']})
  await user.click(screen.getByRole('button',{name:'Remove Savings from homepage'}))
  expect(onPatch).toHaveBeenLastCalledWith({type:'set',path:[],value:['loan']})
 })
 it('keeps saved choices unchanged when loading fails and lets an editor retry',async()=>{
  const user=userEvent.setup(),onPatch=vi.fn()
  globalThis.cmsTestClient.fetch.mockRejectedValueOnce(Error('offline'))
  render(<Picker onPatch={onPatch}/> )
  await screen.findByText(/Products could not be loaded/)
  expect(onPatch).not.toHaveBeenCalled()
  expect(screen.getByRole('combobox')).toBeDisabled()
  expect(screen.getByText('savings')).toBeInTheDocument()
  await user.click(screen.getByRole('button',{name:'Refresh products'}))
  await screen.findByRole('option',{name:'Loan'})
  expect(onPatch).not.toHaveBeenCalled()
 })
 it('keeps the original field and makes help available with keyboard or click',async()=>{
  const user=userEvent.setup()
  render(<EditorFieldHelp name="featuredSlugs" path={['products','featuredSlugs']} schemaType={{title:'Homepage products'}} renderDefault={()=> <input aria-label="Original field"/>}/> )
  expect(screen.getByRole('textbox',{name:'Original field'})).toBeVisible()
  const help=screen.getByLabelText('Help for Homepage products')
  await user.tab()
  expect(help).toHaveFocus()
  await user.click(help)
  await waitFor(()=>expect(help.parentElement).toHaveAttribute('open'))
  expect(screen.getByText(/Chooses which product cards appear on the homepage/)).toBeVisible()
  await user.click(help)
  expect(help.parentElement).not.toHaveAttribute('open')
 })
 it('replaces a generic field description with its actual website effect',()=>{
  globalThis.cmsTestDocument={_type:'sharedSettings'}
  const renderDefault=vi.fn(()=> <input aria-label="Footer company name"/>)
  render(<EditorFieldHelp name="companyName" path={['companyName']} description="Edit the field" schemaType={{title:'Company name',description:'Old generic instructions'}} renderDefault={renderDefault}/> )
  expect(renderDefault.mock.calls[0][0].description).toContain('copyright line at the very bottom of every page')
  expect(screen.getByLabelText('Help for Company name')).toHaveAttribute('title',expect.stringContaining('copyright line'))
 })
})
