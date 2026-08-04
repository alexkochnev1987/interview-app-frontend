'use client'

// oxlint-disable jsx-a11y/prefer-tag-over-role
import { FocusScope } from '@radix-ui/react-focus-scope'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const chatWidgetShellVariants = cva(
  'fixed z-40 flex min-h-0 flex-col overflow-hidden origin-bottom-right motion-reduce:animate-none',
  {
    variants: {
      motion: {
        in: 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-8 slide-in-from-right-4 duration-300 ease-out',
        out: 'animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-8 slide-out-to-right-4 duration-200 ease-in',
      },
      corner: {
        'bottom-right': 'bottom-6 right-6',
      },
      size: {
        default: 'h-[min(560px,calc(100vh-6rem))] w-[min(400px,calc(100vw-3rem))]',
      },
    },
    defaultVariants: {
      motion: 'in',
      corner: 'bottom-right',
      size: 'default',
    },
  },
)

type ChatWidgetShellProps = React.ComponentProps<'div'> &
  VariantProps<typeof chatWidgetShellVariants> & {
    closing?: boolean
    titleId?: string
    trapped?: boolean
  }

export function ChatWidgetShell({
  children,
  className,
  corner,
  size,
  closing = false,
  titleId,
  trapped = false,
  ...props
}: ChatWidgetShellProps) {
  return (
    <Card
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      variant="chatWidget"
      size="flush"
      height="full"
      className={cn(
        chatWidgetShellVariants({ corner, size, motion: closing ? 'out' : 'in' }),
        className,
      )}
      {...props}
    >
      <FocusScope
        trapped={trapped}
        loop
        className="flex h-full min-h-0 w-full flex-col"
        onMountAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </FocusScope>
    </Card>
  )
}
