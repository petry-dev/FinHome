'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface ActionContextValue {
  trigger: number
  fire: () => void
}

const ActionContext = createContext<ActionContextValue>({
  trigger: 0,
  fire: () => {},
})

export function ActionProvider({ children }: { children: React.ReactNode }) {
  const [trigger, setTrigger] = useState(0)
  const fire = useCallback(() => setTrigger(t => t + 1), [])

  return (
    <ActionContext.Provider value={{ trigger, fire }}>
      {children}
    </ActionContext.Provider>
  )
}

export function useAction(): ActionContextValue {
  return useContext(ActionContext)
}
