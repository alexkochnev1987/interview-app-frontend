import * as React from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const sectionHeadingVariants = cva('font-semibold text-foreground', {
  variants: {
    size: {
      prompt: 'text-base tracking-display-loose',
      sm: 'text-lg tracking-display-loose',
      md: 'text-xl tracking-display',
      lg: 'text-2xl tracking-display',
      xl: 'text-3xl font-semibold tracking-display-tight',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})

interface SectionHeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof sectionHeadingVariants> {
  as?: 'h2' | 'h3' | 'h4'
}

export function SectionHeading({
  className,
  size,
  as: Tag = 'h2',
  ...props
}: SectionHeadingProps) {
  return (
    <Tag className={cn(sectionHeadingVariants({ size }), className)} {...props} />
  )
}

const bodyTextVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs leading-5',
      sm: 'text-sm leading-6',
      base: 'text-base leading-7',
      lead: 'text-sm leading-7',
      'responsive-sm': 'text-sm md:text-base',
      'sm-tight': 'text-sm font-medium',
    },
    tone: {
      foreground: 'text-foreground',
      muted: 'text-muted-foreground',
      danger: 'text-danger-soft-foreground',
      warning: 'text-warning-soft-foreground',
      primary: 'text-[hsl(var(--primary))]',
    },
    weight: {
      normal: '',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    width: {
      auto: '',
      prose: 'max-w-prose',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-2xl',
    },
    italic: {
      true: 'italic',
      false: '',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'muted',
    weight: 'normal',
    width: 'auto',
    italic: false,
  },
})

interface BodyTextProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof bodyTextVariants> {
  as?: 'p' | 'span' | 'div' | 'li' | 'strong'
}

export function BodyText({
  className,
  size,
  tone,
  weight,
  width,
  italic,
  as: Tag = 'p',
  ...props
}: BodyTextProps) {
  const Comp = Tag as React.ElementType
  return (
    <Comp
      className={cn(
        bodyTextVariants({ size, tone, weight, width, italic }),
        className,
      )}
      {...props}
    />
  )
}
