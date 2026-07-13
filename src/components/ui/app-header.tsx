import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function AppHeader({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}

interface AppHeaderInnerProps {
  brand: ReactNode
  nav: ReactNode
  actions: ReactNode
}

export function AppHeaderInner({ brand, nav, actions }: AppHeaderInnerProps) {
  return (
    <div className="container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex shrink-0 items-center">{brand}</div>
      <nav className="order-3 flex w-full flex-wrap items-center gap-2 md:order-2 md:w-auto md:justify-center">
        {nav}
      </nav>
      <div className="order-2 flex items-center gap-2 md:order-3">
        {actions}
      </div>
    </div>
  )
}
