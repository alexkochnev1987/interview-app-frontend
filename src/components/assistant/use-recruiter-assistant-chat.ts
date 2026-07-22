'use client'

import { FormEvent, useMemo, useState } from 'react'

import {
  RecruiterAssistantPendingAction,
  sendRecruiterAssistantMessage,
} from '@/lib/api'
import { ApiError } from '@/lib/api-error'

import {
  recruiterAssistantStarterPrompt,
  recruiterAssistantWelcomeMessage,
  type RecruiterAssistantChatMessage,
} from './recruiter-assistant-chat-types'

function createMessage(
  message: Omit<RecruiterAssistantChatMessage, 'id'>,
): RecruiterAssistantChatMessage {
  return {
    id: crypto.randomUUID(),
    ...message,
  }
}

function formatError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Assistant request failed.'
}

export function useRecruiterAssistantChat() {
  const [messages, setMessages] = useState<RecruiterAssistantChatMessage[]>([
    recruiterAssistantWelcomeMessage,
  ])
  const [input, setInput] = useState(recruiterAssistantStarterPrompt)
  const [pendingAction, setPendingAction] =
    useState<RecruiterAssistantPendingAction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const latestResult = useMemo(
    () => [...messages].reverse().find((message) => message.result)?.result,
    [messages],
  )

  async function submitMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setError(null)
    setLoading(true)
    setInput('')
    appendMessage({ role: 'user', text })

    try {
      const result = await sendRecruiterAssistantMessage({ message: text })
      setPendingAction(result.pendingAction ?? null)
      appendMessage({
        role: 'assistant',
        text: result.response,
        result,
      })
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction || loading) return

    setError(null)
    setLoading(true)
    appendMessage({ role: 'user', text: 'Confirm' })

    try {
      const result = await sendRecruiterAssistantMessage({
        message: 'confirm',
        pendingAction,
      })
      setPendingAction(result.pendingAction ?? null)
      appendMessage({
        role: 'assistant',
        text: result.response,
        result,
      })
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }

  function appendMessage(message: Omit<RecruiterAssistantChatMessage, 'id'>) {
    setMessages((current) => [...current, createMessage(message)])
  }

  return {
    messages,
    input,
    setInput,
    pendingAction,
    loading,
    error,
    latestResult,
    submitMessage,
    confirmPendingAction,
  }
}
