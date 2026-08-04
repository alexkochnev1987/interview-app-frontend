'use client'

import { useTranslations } from 'next-intl'
import { FormEvent, useEffect, useRef, useState } from 'react'

import { RecruiterAssistantPendingAction, sendRecruiterAssistantMessage } from '@/lib/api'
import { ApiError } from '@/lib/api-error'
import { useAuth } from '@/lib/auth-context'

import type { AiAssistantChatMessage } from './ai-assistant-chat-types'
import { ASSISTANT_CONFIRM_MESSAGE } from './assistant-api-contract'
import { resolveAssistantWelcomeRole } from './assistant-i18n'
import { buildAssistantWelcomeText } from './build-assistant-welcome'

function createMessage(message: Omit<AiAssistantChatMessage, 'id'>): AiAssistantChatMessage {
  return {
    id: crypto.randomUUID(),
    ...message,
  }
}

function formatError(err: unknown, fallbackMessage: string): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return fallbackMessage
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

function applyAssistantResult(
  result: Awaited<ReturnType<typeof sendRecruiterAssistantMessage>>,
  t: ReturnType<typeof useTranslations<'assistant'>>,
): {
  pendingAction: RecruiterAssistantPendingAction | null
  pendingActionId: string | null
  sessionId: string | null
  error: string | null
} {
  const sessionId = result.sessionId ?? null

  if (result.status === 'needs_confirmation') {
    if (!result.pendingAction || !result.pendingActionId) {
      return {
        pendingAction: null,
        pendingActionId: null,
        sessionId,
        error: t('errors.missingPendingAction'),
      }
    }

    return {
      pendingAction: result.pendingAction,
      pendingActionId: result.pendingActionId,
      sessionId,
      error: null,
    }
  }

  return {
    pendingAction: null,
    pendingActionId: null,
    sessionId,
    error: null,
  }
}

export function useAiAssistantChat() {
  const { user } = useAuth()
  const t = useTranslations('assistant')
  const welcomeRole = resolveAssistantWelcomeRole(user?.role)
  const welcomeText = buildAssistantWelcomeText(t, welcomeRole)

  const [messages, setMessages] = useState<AiAssistantChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', text: welcomeText },
  ])
  const [input, setInput] = useState('')
  const [pendingAction, setPendingAction] = useState<RecruiterAssistantPendingAction | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  function beginRequest() {
    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    const requestId = ++requestIdRef.current
    return { abortController, requestId }
  }

  function isLatestRequest(requestId: number) {
    return requestId === requestIdRef.current
  }

  async function submitMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setError(null)
    setPendingAction(null)
    setPendingActionId(null)
    setLoading(true)
    appendMessage({ role: 'user', text })

    const { abortController, requestId } = beginRequest()

    try {
      const result = await sendRecruiterAssistantMessage(
        { message: text, ...(sessionId ? { sessionId } : {}) },
        { signal: abortController.signal },
      )
      if (!isLatestRequest(requestId)) return

      const applied = applyAssistantResult(result, t)
      setPendingAction(applied.pendingAction)
      setPendingActionId(applied.pendingActionId)
      if (applied.sessionId) setSessionId(applied.sessionId)
      if (applied.error) setError(applied.error)
      appendMessage({
        role: 'assistant',
        text: result.response,
        result,
      })
      setInput('')
    } catch (err) {
      if (!isLatestRequest(requestId) || isAbortError(err)) return
      setError(formatError(err, t('errors.requestFailed')))
      setInput(text)
    } finally {
      if (isLatestRequest(requestId)) {
        setLoading(false)
      }
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction || !pendingActionId || loading) return

    setError(null)
    setLoading(true)
    appendMessage({ role: 'user', text: t('confirm.userMessage') })

    const { abortController, requestId } = beginRequest()

    try {
      const result = await sendRecruiterAssistantMessage(
        {
          message: ASSISTANT_CONFIRM_MESSAGE,
          pendingActionId,
          ...(sessionId ? { sessionId } : {}),
        },
        { signal: abortController.signal },
      )
      if (!isLatestRequest(requestId)) return

      const applied = applyAssistantResult(result, t)
      setPendingAction(applied.pendingAction)
      setPendingActionId(applied.pendingActionId)
      if (applied.sessionId) setSessionId(applied.sessionId)
      if (applied.error) setError(applied.error)
      appendMessage({
        role: 'assistant',
        text: result.response,
        result,
      })
    } catch (err) {
      if (!isLatestRequest(requestId) || isAbortError(err)) return
      setError(formatError(err, t('errors.requestFailed')))
    } finally {
      if (isLatestRequest(requestId)) {
        setLoading(false)
      }
    }
  }

  function dismissPendingAction() {
    setPendingAction(null)
    setPendingActionId(null)
  }

  function appendMessage(message: Omit<AiAssistantChatMessage, 'id'>) {
    setMessages((current) => [...current, createMessage(message)])
  }

  return {
    messages,
    input,
    setInput,
    pendingAction,
    loading,
    error,
    welcomeRole,
    submitMessage,
    confirmPendingAction,
    dismissPendingAction,
  }
}
