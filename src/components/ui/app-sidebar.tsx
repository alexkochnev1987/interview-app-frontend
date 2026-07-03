import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface AppSidebarProps extends ComponentProps<'aside'> {
  brand: ReactNode
  nav: ReactNode
  actions: ReactNode
  // Force the rail open regardless of hover (e.g. while a popover is open).
  expanded?: boolean
}

export function AppSidebar({
  brand,
  nav,
  actions,
  expanded,
  className,
  ...props
}: AppSidebarProps) {
  return (
    <>
      {/* In-flow spacer reserves the collapsed width so expanding overlays content instead of reflowing it. */}
      <div aria-hidden className="w-16 shrink-0" />
      <aside
        data-expanded={expanded ? 'true' : undefined}
        className={cn(
          'group fixed left-0 top-0 z-40 flex h-screen w-16 flex-col gap-4 overflow-hidden border-r border-border/50 bg-background px-3 pb-4 pt-7 transition-[width,box-shadow] duration-200 hover:w-64 hover:shadow-xl data-[expanded=true]:w-64 data-[expanded=true]:shadow-xl',
          className,
        )}
        {...props}
      >
        <div className="flex shrink-0 flex-col pb-4">{brand}</div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {nav}
        </nav>
        <div className="flex shrink-0 flex-col gap-2">{actions}</div>
      </aside>
    </>
  )
}
