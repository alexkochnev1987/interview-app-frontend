'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { cn } from '@/lib/utils'

const sheetOverlayVariants = cva(
  'fixed inset-0 z-50 bg-scrim/55 backdrop-blur-sm data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0',
)

const sheetContentVariants = cva(
  'fixed z-50 flex flex-col outline-none data-open:animate-in data-closed:animate-out data-closed:duration-150',
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-full w-full max-w-xs data-open:slide-in-from-right-full data-closed:slide-out-to-right-full sm:max-w-sm',
        bottom:
          'inset-x-0 bottom-0 max-h-[85vh] w-full data-open:slide-in-from-bottom-full data-closed:slide-out-to-bottom-full',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

const sheetCardVariants = cva('gap-0 border-y-0', {
  variants: {
    side: {
      right: 'rounded-none border-l sm:rounded-l-2xl',
      bottom: 'rounded-t-2xl border-x-0',
    },
  },
  defaultVariants: {
    side: 'right',
  },
})

interface SheetProps extends VariantProps<typeof sheetContentVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  accessibilityDescription?: string
}

export function Sheet({
  open,
  onOpenChange,
  side,
  children,
  accessibilityDescription,
}: SheetProps) {
  if (typeof document === 'undefined') return null

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={sheetOverlayVariants()} />
        <DialogPrimitive.Content className={cn(sheetContentVariants({ side }))}>
          {accessibilityDescription ? (
            <DialogPrimitive.Description className="sr-only">
              {accessibilityDescription}
            </DialogPrimitive.Description>
          ) : null}
          <Card variant="floating" height="full" className={cn(sheetCardVariants({ side }))}>
            {children}
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

interface SheetHeaderProps {
  title: ReactNode
  onClose: () => void
  closeLabel: string
}

export function SheetHeader({ title, onClose, closeLabel }: SheetHeaderProps) {
  return (
    <Inline
      justify="between"
      align="center"
      className="shrink-0 border-b border-border/50 px-4 py-3"
    >
      <DialogPrimitive.Title asChild>
        <CardTitle size="md">{title}</CardTitle>
      </DialogPrimitive.Title>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <Icon size="md">
          <X />
        </Icon>
      </Button>
    </Inline>
  )
}

export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto p-4', className)}>{children}</div>
}
