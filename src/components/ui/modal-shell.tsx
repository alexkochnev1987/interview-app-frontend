'use client'

import * as React from 'react'

import { Dialog as DialogPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const overlayVariants = cva('fixed inset-0', {
  variants: {
    layer: {
      default: 'z-50 bg-scrim/55',
      tour: 'z-[1000000001] bg-black/45',
    },
  },
  defaultVariants: {
    layer: 'default',
  },
})

const modalContentVariants = cva(
  'fixed left-1/2 top-1/2 w-full max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-4 outline-none',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
      },
      layer: {
        default: 'z-50',
        tour: 'z-[1000000001]',
      },
    },
    defaultVariants: {
      size: 'md',
      layer: 'default',
    },
  },
)

interface ModalShellProps extends VariantProps<typeof modalContentVariants> {
  children: React.ReactNode
  /** When true, escape and outside clicks do not close the dialog. */
  dismissDisabled?: boolean
  onDismiss?: () => void
  /** Screen reader dialog name; pair with the visible heading inside `children`. */
  accessibilityTitle: string
  accessibilityDescription?: string
  layer?: 'default' | 'tour'
}

export function ModalShell({
  children,
  dismissDisabled = false,
  onDismiss,
  size,
  layer = 'default',
  accessibilityTitle,
  accessibilityDescription,
}: ModalShellProps) {
  if (typeof document === 'undefined') return null

  return (
    <DialogPrimitive.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open && !dismissDisabled) onDismiss?.()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={overlayVariants({ layer })} />
        <DialogPrimitive.Content
          className={cn(modalContentVariants({ size, layer }))}
          onPointerDownOutside={(event) => {
            if (dismissDisabled) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (dismissDisabled) event.preventDefault()
          }}
          onFocusOutside={(event) => {
            if (dismissDisabled) event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            if (dismissDisabled) event.preventDefault()
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            {accessibilityTitle}
          </DialogPrimitive.Title>
          {accessibilityDescription ? (
            <DialogPrimitive.Description className="sr-only">
              {accessibilityDescription}
            </DialogPrimitive.Description>
          ) : null}
          <Card
            variant={layer === 'tour' ? 'floatingSolid' : 'floating'}
            className={cn('w-full', layer === 'tour' && 'shadow-none')}
          >
            {children}
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
