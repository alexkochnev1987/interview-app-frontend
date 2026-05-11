'use client'

import { useEffect } from 'react'

import { notifyError } from '@/lib/toast'

type FlashErrorToastProps = {
  message: string
  description?: string
  toastId: string
}

export function FlashErrorToast({ message, description, toastId }: FlashErrorToastProps) {
  useEffect(() => {
    notifyError(message, {
      id: toastId,
      ...(description ? { description } : {}),
    })
  }, [message, description, toastId])

  return null
}
