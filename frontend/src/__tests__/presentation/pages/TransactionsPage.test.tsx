import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/test-utils'
import { TransactionsPage } from '@/presentation/pages/TransactionsPage'
import { ActionProvider } from '@/presentation/contexts/ActionContext'
import React from 'react'

function renderPage() {
  return renderWithProviders(
    <ActionProvider>
      <TransactionsPage />
    </ActionProvider>
  )
}

describe('TransactionsPage', () => {
  it('renders transaction descriptions', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Feira semanal')).toBeInTheDocument()
      expect(screen.getByText('Salário junho')).toBeInTheDocument()
    })
  })

  it('shows "+ R$" prefix for income (type=1), "− R$" for expense (type=0)', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Feira semanal')).toBeInTheDocument()
    })

    // Income transaction (type=1) shows "+ R$"
    const incomeAmounts = screen.getAllByText(/\+ /)
    const incomeAmount = incomeAmounts.find(el => el.tagName === 'SPAN')
    expect(incomeAmount).toBeInTheDocument()

    // Expense transaction (type=0) shows "− R$"
    const expenseAmount = screen.getByText(/− /)
    expect(expenseAmount).toBeInTheDocument()
  })

  it('opens delete confirm modal when delete button clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Feira semanal')).toBeInTheDocument()
    })

    // Click the first delete button (Excluir title)
    const deleteButtons = screen.getAllByTitle('Excluir')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Excluir transação')).toBeInTheDocument()
    })
  })
})
