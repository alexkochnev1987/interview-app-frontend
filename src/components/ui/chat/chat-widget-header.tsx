'use client'

import { cva } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const chatWidgetHeaderVariants = cva(
  'rounded-t-[calc(0.75rem-2px)] border-b border-border/80 bg-card px-4 py-3',
)

type ChatWidgetHeaderProps = {
  children: ReactNode
  className?: string
}

export function ChatWidgetHeader({ children, className }: ChatWidgetHeaderProps) {
  return <div className={cn(chatWidgetHeaderVariants(), className)}>{children}</div>
}
