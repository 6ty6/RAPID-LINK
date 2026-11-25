import {useState,createRef} from 'react'
import {afterEach,describe,it,expect,vi} from 'vitest'
import {render,screen,cleanup} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GrowingTextInput from '../../cms/sanity/studio/GrowingTextInput.jsx'
afterEach(cleanup)

function Editable({initial='',onPatch=()=>{}}){
 const [value,setValue]=useState(initial)
 return <GrowingTextInput schemaType={{name:'string'}} path={['intro']} value={value} elementProps={{'aria-label':'Introduction'}} onChange={patch=>{onPatch(patch);setValue(patch.type==='unset'?'':patch.value)}}/>
}
describe('expanding CMS text fields',()=>{
 it('expands long sentences while retaining the same focused input and stored text',async()=>{
  const user=userEvent.setup(),onPatch=vi.fn()
  render(<Editable initial={'a'.repeat(79)} onPatch={onPatch}/> )
  const field=screen.getByRole('textbox',{name:'Introduction'})
  expect(field).toHaveAttribute('rows','1')
  await user.click(field);await user.type(field,'bc')
  expect(field).toHaveFocus()
  expect(field).toHaveAttribute('rows','3')
  expect(onPatch).toHaveBeenLastCalledWith({type:'set',path:[],value:'a'.repeat(79)+'bc'})
  expect(screen.getByRole('textbox',{name:'Introduction'})).toBe(field)
  await user.clear(field)
  expect(onPatch).toHaveBeenLastCalledWith({type:'unset',path:[]})
 })
 it('uses multiline controls for paragraph fields and preserves native focus/validation props',()=>{
  const ref=createRef(),onBlur=vi.fn()
  render(<GrowingTextInput schemaType={{name:'text'}} path={['description']} value="A paragraph" elementProps={{id:'description','aria-label':'Description','aria-describedby':'hint','aria-invalid':true,ref,onBlur}} onChange={vi.fn()}/> )
  const field=screen.getByRole('textbox',{name:'Description'})
  expect(field).toHaveAttribute('rows','3')
  expect(field).toHaveAttribute('aria-describedby','hint')
  expect(field).toHaveAttribute('aria-invalid','true')
  expect(ref.current).toBe(field)
 })
 it('retains built-in controls for URLs, selectors, read-only fields and rich text',()=>{
  const renderDefault=vi.fn(()=> <span>Original control</span>)
  for(const props of [
   {schemaType:{name:'string'},path:['links',{_key:'one'},'href']},
   {schemaType:{name:'url'}},
   {schemaType:{name:'string',options:{list:['Savings','Loans']}}},
   {schemaType:{name:'string'},readOnly:true},
   {schemaType:{name:'array'}},
  ]){
   const result=render(<GrowingTextInput {...props} renderDefault={renderDefault}/> )
   expect(screen.getByText('Original control')).toBeVisible();result.unmount()
  }
  expect(renderDefault).toHaveBeenCalledTimes(5)
 })
})
