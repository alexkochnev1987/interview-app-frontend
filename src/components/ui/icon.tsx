import { cloneElement, isValidElement, type ReactElement } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const iconVariants = cva('shrink-0', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-5',
      xl: 'size-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface IconProps extends VariantProps<typeof iconVariants> {
  children: ReactElement<{ className?: string }>
  className?: string
  spinning?: boolean
}

export function Icon({ children, size, className, spinning }: IconProps) {
  if (!isValidElement<{ className?: string }>(children)) return children
  const merged = cn(
    iconVariants({ size }),
    spinning ? 'animate-spin' : undefined,
    children.props.className,
    className,
  )
  return cloneElement(children, { className: merged })
}
