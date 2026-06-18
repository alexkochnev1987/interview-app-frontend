import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const sectionVariants = cva('flex flex-col', {
  variants: {
    gap: {
      0: 'gap-0',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
    },
    width: {
      default: '',
      prose: 'mx-auto max-w-4xl',
      reading: 'mx-auto max-w-5xl',
      wide: 'mx-auto max-w-6xl',
    },
  },
  defaultVariants: {
    gap: 4,
    width: 'default',
  },
})

type SectionProps = Omit<React.ComponentProps<'section'>, 'color'> &
  VariantProps<typeof sectionVariants> & {
    as?: 'section' | 'div' | 'article' | 'aside' | 'main'
  }

export function Section({
  as,
  className,
  gap,
  width,
  ...props
}: SectionProps) {
  const Comp = (as ?? 'section') as React.ElementType

  return (
    <Comp
      className={cn(sectionVariants({ gap, width }), className)}
      {...props}
    />
  )
}
