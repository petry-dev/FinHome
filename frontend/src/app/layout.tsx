import type { Metadata } from 'next'
import './globals.css'
import { ActionProvider } from '@/presentation/contexts/ActionContext'
import { MainLayout } from '@/presentation/layouts/MainLayout'

export const metadata: Metadata = {
  title: 'FinHome',
  description: 'Controle de gastos residenciais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ActionProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ActionProvider>
      </body>
    </html>
  )
}
