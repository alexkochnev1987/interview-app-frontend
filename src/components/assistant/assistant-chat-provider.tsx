'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { ASSISTANT_CHAT_LAUNCHER_ID } from './assistant-api-contract'
import { useAiAssistantChat } from './use-ai-assistant-chat'

type AssistantChatSession = ReturnType<typeof useAiAssistantChat>

type AssistantChatContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  closeAndRestoreFocus: () => void
  session: AssistantChatSession
}

const AssistantChatContext = createContext<AssistantChatContextValue | null>(null)

export function AssistantChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const session = useAiAssistantChat()

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => {
      document.getElementById(ASSISTANT_CHAT_LAUNCHER_ID)?.focus()
    })
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((current) => !current),
      closeAndRestoreFocus,
      session,
    }),
    [closeAndRestoreFocus, open, session],
  )

  return <AssistantChatContext.Provider value={value}>{children}</AssistantChatContext.Provider>
}

export function useAssistantChatShell() {
  const context = useContext(AssistantChatContext)
  if (!context) {
    throw new Error('useAssistantChatShell must be used within AssistantChatProvider')
  }
  return context
}

export function useAssistantChatSession() {
  return useAssistantChatShell().session
}
