'use client'

import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const overlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-scrim/55 p-4 backdrop-blur-sm',
)

const modalCardVariants = cva('w-full', {
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface ModalShellProps extends VariantProps<typeof modalCardVariants> {
  children: ReactNode
  onDismiss?: () => void
}

export function ModalShell({ children, onDismiss, size }: ModalShellProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={overlayVariants()}
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
    >
      <Card
        variant="floating"
        className={cn(modalCardVariants({ size }))}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Card>
    </div>,
    document.body,
  )
}
