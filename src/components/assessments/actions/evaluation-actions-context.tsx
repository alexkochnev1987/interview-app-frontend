'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * Broadcasts "evaluation work was just triggered" to descendant action buttons
 * so they do not have to receive a refresh callback drilled through every
 * intermediate presentational component (question sections, cards). The owning
 * client component (which holds the live-polling loop) provides the callback.
 */
const EvaluationStartedContext = createContext<() => void>(() => {})

export function EvaluationActionsProvider({
  onEvaluationStarted,
  children,
}: {
  onEvaluationStarted: () => void
  children: ReactNode
}) {
  return (
    <EvaluationStartedContext.Provider value={onEvaluationStarted}>
      {children}
    </EvaluationStartedContext.Provider>
  )
}

export function useEvaluationStarted(): () => void {
  return useContext(EvaluationStartedContext)
}
