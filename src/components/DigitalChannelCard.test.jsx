import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import DigitalChannelCard from './DigitalChannelCard'

describe('digital channel flip card', () => {
  it('flips back when the revealed instructions are clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<DigitalChannelCard title="RapidPay USSD" text="Dial *899*727# on all networks." image="/assets/digital-rapidpay-ussd.png" index={1} />)
    await user.click(screen.getByRole('button', { name: 'View RapidPay USSD details' }))
    await user.click(screen.getByText('Dial *899*727# on all networks.'))
    expect(container.querySelector('.digital-card')).not.toHaveClass('is-flipped')
    expect(screen.getByRole('button', { name: 'View RapidPay USSD details' })).toBeInTheDocument()
  })
  it('reveals instructions and transfers focus, then returns with Escape', async () => {
    const user = userEvent.setup()
    const { container } = render(<DigitalChannelCard title="RapidPay USSD" text="Dial *899*727# on all networks." image="/assets/digital-rapidpay-ussd.png" index={1} />)
    expect(container.querySelector('.digital-flip-back')).toHaveAttribute('inert')
    await user.click(screen.getByRole('button', { name: 'View RapidPay USSD details' }))
    expect(container.querySelector('.digital-flip-front')).toHaveAttribute('inert')
    expect(screen.getByText('Dial *899*727# on all networks.')).toBeVisible()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back to RapidPay USSD' })).toHaveFocus())
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByRole('button', { name: 'View RapidPay USSD details' })).toHaveFocus())
    expect(container.querySelector('.digital-flip-back')).toHaveAttribute('aria-hidden', 'true')
  })
  it('keeps external service navigation separate from the flip controls', async () => {
    const user = userEvent.setup()
    render(<DigitalChannelCard title="MoneyQube" text="Digital nano loans." image="/assets/digital-moneyqube.png" link="https://example.com/service" index={0} />)
    expect(screen.queryByRole('link', { name: /Open service/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View MoneyQube details' }))
    expect(screen.getByRole('link', { name: /Open service/ })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Open service/ })).toHaveAttribute('target', '_blank')
  })
})
