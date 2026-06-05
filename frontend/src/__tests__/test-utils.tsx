import { render, RenderOptions } from '@testing-library/react'
import { Toaster } from '@/presentation/components/Toaster'
import { useToast } from '@/hooks/useToast'

function Providers({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast()
  return <>{children}<Toaster toasts={toasts} onRemove={removeToast} /></>
}

export function renderWithProviders(ui: React.ReactElement, opts?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...opts })
}
export * from '@testing-library/react'
