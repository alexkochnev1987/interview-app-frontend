'use client'

import { useEffect, useRef } from 'react'

import { notifyError, notifySuccess } from '@/lib/toast'

const notifiedSessionKeys = new Set<string>()

function sessionKey(toastId: string, value: string) {
  return `${toastId}\0${value}`
}

export type UseNotifyOnceWhenOptions = {
  value: string | null | undefined
  enabled?: boolean
  toastId: string
  notify: () => void
}

export function useNotifyOnceWhen({
  value,
  enabled = true,
  toastId,
  notify,
}: UseNotifyOnceWhenOptions) {
  const lastValueRef = useRef<string | null>(null)
  const notifyRef = useRef(notify)

  useEffect(() => {
    notifyRef.current = notify
  })

  useEffect(() => {
    const activeValue = value?.trim() ? value.trim() : null

    if (!enabled || !activeValue) {
      if (lastValueRef.current) {
        notifiedSessionKeys.delete(sessionKey(toastId, lastValueRef.current))
      }
      lastValueRef.current = null
      return
    }

    if (activeValue === lastValueRef.current) {
      return
    }

    if (lastValueRef.current) {
      notifiedSessionKeys.delete(sessionKey(toastId, lastValueRef.current))
    }
    lastValueRef.current = activeValue

    const key = sessionKey(toastId, activeValue)
    if (notifiedSessionKeys.has(key)) {
      return
    }
    notifiedSessionKeys.add(key)

    notifyRef.current()
  }, [value, enabled, toastId])
}

export type UseNotifyErrorOnceOptions = {
  value: string | null | undefined
  enabled?: boolean
  toastId: string
  message: string
  description?: string | null
}

export function useNotifyErrorOnce({
  value,
  enabled = true,
  toastId,
  message,
  description,
}: UseNotifyErrorOnceOptions) {
  useNotifyOnceWhen({
    value,
    enabled,
    toastId,
    notify: () =>
      notifyError(message, {
        id: toastId,
        ...(description?.trim() ? { description } : {}),
      }),
  })
}

export type UseNotifySuccessOnceOptions = {
  value: string | null | undefined
  enabled?: boolean
  toastId: string
  message: string
  description?: string | null
}

export function useNotifySuccessOnce({
  value,
  enabled = true,
  toastId,
  message,
  description,
}: UseNotifySuccessOnceOptions) {
  useNotifyOnceWhen({
    value,
    enabled,
    toastId,
    notify: () =>
      notifySuccess(message, {
        id: toastId,
        ...(description?.trim() ? { description } : {}),
      }),
  })
}
