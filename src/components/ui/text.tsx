import * as React from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const sectionHeadingVariants = cva('font-semibold text-foreground', {
  variants: {
    size: {
      prompt: 'text-base tracking-display-loose',
      sm: 'text-lg tracking-display-loose',
      md: 'text-xl tracking-display',
      lg: 'text-2xl tracking-display',
      xl: 'text-2xl font-semibold tracking-display-tight sm:text-3xl',
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
      inherit: 'text-inherit',
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

const takeTextVariants = cva('', {
  variants: {
    variant: {
      heroDescription:
        'max-w-2xl text-base leading-7 text-muted-foreground md:text-lg',
      bodyMutedSm: 'text-sm leading-6 text-muted-foreground',
      bodySm: 'text-sm leading-6 text-foreground',
      eyebrowLabel:
        'text-[0.72rem] font-semibold uppercase tracking-eyebrow-widest text-muted-foreground',
      metricLabel: 'text-[0.72rem] font-semibold uppercase tracking-[0.2em]',
      metricLabelCompact:
        'text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
      metricValueLg: 'text-3xl font-semibold tracking-[-0.04em] text-foreground',
      metricValueXl: 'text-4xl font-semibold tracking-[-0.04em] text-foreground',
      labelSmStrong: 'text-sm font-semibold text-foreground',
      labelSm: 'text-sm font-medium text-foreground',
      captionMutedXs: 'text-xs leading-5 text-muted-foreground',
      captionWarningXs: 'text-xs leading-5 text-[var(--color-status-pending-fg)]',
      transcriptDraft: 'ml-1 italic text-muted-foreground',
      iconPrimary: 'text-[hsl(var(--primary))]',
    },
  },
  defaultVariants: {
    variant: 'bodyMutedSm',
  },
})

type TakeTextTag = 'p' | 'span'

interface TextProps extends VariantProps<typeof takeTextVariants> {
  as?: TakeTextTag
  children: ReactNode
  className?: string
}

/** Semantic text variants used by take interview screens */
export function Text({ as = 'p', children, variant, className }: TextProps) {
  if (as === 'span') {
    return (
      <span className={cn(takeTextVariants({ variant }), className)}>
        {children}
      </span>
    )
  }

  return <p className={cn(takeTextVariants({ variant }), className)}>{children}</p>
}
