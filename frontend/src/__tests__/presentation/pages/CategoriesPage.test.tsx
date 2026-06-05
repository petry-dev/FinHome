import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CategoriesPage } from '@/presentation/pages/CategoriesPage'
import { ActionProvider } from '@/presentation/contexts/ActionContext'
import React from 'react'

function renderPage() {
  return renderWithProviders(
    <ActionProvider>
      <CategoriesPage />
    </ActionProvider>
  )
}

describe('CategoriesPage', () => {
  it('renders categories with correct badge text ("Despesa", "Receita", "Ambas")', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument()
      expect(screen.getByText('Salário')).toBeInTheDocument()
      expect(screen.getByText('Transferência')).toBeInTheDocument()
    })

    expect(screen.getByText('Despesa')).toBeInTheDocument()
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('Ambas')).toBeInTheDocument()
  })

  it('badge for purpose=0 has class fh-badge-red', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument()
    })

    const despesaBadge = screen.getByText('Despesa')
    expect(despesaBadge).toHaveClass('fh-badge-red')
  })
})
