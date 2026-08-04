'use client'

import type { ReactNode } from 'react'

type ChatReplyAnnouncerProps = {
  children: ReactNode
}

export function ChatReplyAnnouncer({ children }: ChatReplyAnnouncerProps) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {children}
    </div>
  )
}
