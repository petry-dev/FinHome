import { describe, it, expect } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/__tests__/test-utils'
import { PeoplePage } from '@/presentation/pages/PeoplePage'
import { ActionProvider } from '@/presentation/contexts/ActionContext'
import React from 'react'

function renderPage() {
  return renderWithProviders(
    <ActionProvider>
      <PeoplePage />
    </ActionProvider>
  )
}

describe('PeoplePage', () => {
  it('renders the table with people names after loading', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Alice Silva')).toBeInTheDocument()
      expect(screen.getByText('Bob Junior')).toBeInTheDocument()
    })
  })

  it('shows "Nenhuma pessoa cadastrada" empty state when list is empty', async () => {
    server.use(
      http.get('http://localhost:5000/api/people', () =>
        HttpResponse.json({ items: [], totalCount: 0, page: 1, pageSize: 100 })
      )
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Nenhuma pessoa cadastrada')).toBeInTheDocument()
    })
  })

  it('opens modal when "Nova pessoa" button clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Alice Silva')).toBeInTheDocument())

    await user.click(screen.getAllByText('+ Nova pessoa')[0])

    expect(screen.getByText('Nova pessoa')).toBeInTheDocument()
  })

  it('shows validation error "Nome é obrigatório." when submitting empty name', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Alice Silva')).toBeInTheDocument())

    await user.click(screen.getAllByText('+ Nova pessoa')[0])

    // Submit without filling name
    await user.click(screen.getByText('Adicionar'))

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório.')).toBeInTheDocument()
    })
  })

  it('closes modal and refreshes list after successful create', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Alice Silva')).toBeInTheDocument())

    await user.click(screen.getAllByText('+ Nova pessoa')[0])

    const nameInput = screen.getByPlaceholderText('Nome da pessoa')
    const ageInput = screen.getByPlaceholderText('Ex: 32')

    await user.type(nameInput, 'Carlos Mendes')
    await user.type(ageInput, '35')

    await act(async () => {
      await user.click(screen.getByText('Adicionar'))
    })

    await waitFor(() => {
      expect(screen.queryByText('Nova pessoa')).not.toBeInTheDocument()
    })
  })
})
