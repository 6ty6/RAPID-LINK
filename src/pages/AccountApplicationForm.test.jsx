import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountApplicationForm from './AccountApplicationForm'
import usePageContent from '../hooks/usePageContent.js'
import { accountFormModel } from '../content/accountFormModel.js'
vi.mock('../hooks/usePageContent.js',()=>({default:vi.fn()}))
beforeEach(()=>{usePageContent.mockReturnValue({data:structuredClone(accountFormModel.content)})})
describe('CMS account form presentation',()=>{
 it('applies published headings and field labels without changing account API values',async()=>{
  const copy=structuredClone(accountFormModel.content)
  copy.introduction.title='Your account starts here'
  copy.accounts.savingsTitle='Choose savings'
  copy.fieldLabels.first_name='Names on your Ghana Card'
  usePageContent.mockReturnValue({data:copy})
  const user=userEvent.setup()
  render(<AccountApplicationForm />)
  expect(screen.getByRole('heading',{name:'Your account starts here'})).toBeVisible()
  const radio=screen.getByRole('radio',{name:'Choose savings'})
  expect(radio).toHaveAttribute('value','savings')
  await user.click(radio)
  await user.click(screen.getByRole('button',{name:'Continue',exact:true}))
  expect(screen.getByLabelText('Names on your Ghana Card *')).toHaveAttribute('name','first_name')
  expect(screen.getByLabelText('Ghana Card number: GHA-123456789-0 *')).toHaveAttribute('pattern','GHA-[0-9]{9}-[0-9]')
 })
})
