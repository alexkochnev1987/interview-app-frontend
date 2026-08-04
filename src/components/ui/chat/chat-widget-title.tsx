'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const chatWidgetTitleIconVariants = cva(
  'relative flex shrink-0 items-center justify-center text-[hsl(var(--primary))]',
  {
    variants: {
      size: {
        md: 'size-9',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const chatWidgetTitleStatusDotVariants = cva(
  'absolute rounded-full border-2 border-card bg-pill-emerald',
  {
    variants: {
      size: {
        md: 'bottom-0 right-0 size-2.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

type ChatWidgetTitleProps = VariantProps<typeof chatWidgetTitleIconVariants> & {
  name: string
  status: string
  icon: ReactNode
  titleId?: string
  className?: string
}

export function ChatWidgetTitle({
  name,
  status,
  icon,
  size,
  titleId,
  className,
}: ChatWidgetTitleProps) {
  return (
    <Inline gap={3} align="center" className={className}>
      <div className={cn(chatWidgetTitleIconVariants({ size }))}>
        {icon}
        <span className={chatWidgetTitleStatusDotVariants({ size })} aria-hidden />
      </div>
      <Stack gap={0}>
        <BodyText as="span" id={titleId} size="sm-tight" weight="semibold" tone="foreground">
          {name}
        </BodyText>
        <BodyText as="span" size="xs" tone="muted">
          {status}
        </BodyText>
      </Stack>
    </Inline>
  )
}
