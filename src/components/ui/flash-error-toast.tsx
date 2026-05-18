'use client'

import { useNotifyErrorOnce } from '@/hooks/use-notify-once'

type FlashErrorToastProps = {
  message: string
  description?: string
  toastId: string
}

function flashDedupeValue(message: string, description?: string) {
  const title = message.trim()
  const detail = description?.trim()
  if (!detail) {
    return title
  }
  return `${title}\0${detail}`
}

export function FlashErrorToast({ message, description, toastId }: FlashErrorToastProps) {
  useNotifyErrorOnce({
    value: flashDedupeValue(message, description),
    toastId,
    message,
    description,
  })

  return null
}
