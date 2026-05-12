'use client'

import { useEffect, useRef } from 'react'

import { notifyError } from '@/lib/toast'

type FlashErrorToastProps = {
  message: string
  description?: string
  toastId: string
}

export function FlashErrorToast({ message, description, toastId }: FlashErrorToastProps) {
  const shownRef = useRef(false)

  useEffect(() => {
    if (shownRef.current) {
      return
    }
    shownRef.current = true
    notifyError(message, {
      id: toastId,
      ...(description ? { description } : {}),
    })
  }, [message, description, toastId])

  return null
}
