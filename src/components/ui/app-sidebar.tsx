'use client'

import { Menu, X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface AppSidebarProps extends ComponentProps<'aside'> {
  brand: ReactNode
  nav: ReactNode
  actions: ReactNode
  toggleOpen?: boolean
  onToggle?: () => void
  onClose?: () => void
  expandLabel?: string
  collapseLabel?: string
  expanded?: boolean
}

export function AppSidebar({
  brand,
  nav,
  actions,
  toggleOpen = false,
  onToggle,
  onClose,
  expandLabel = '',
  collapseLabel = '',
  expanded,
  className,
  ...props
}: AppSidebarProps) {
  useEffect(() => {
    if (!toggleOpen || !onClose) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleOpen, onClose])

  return (
    <>
      <div aria-hidden className="hidden w-16 shrink-0 lg:block" />
      {toggleOpen ? (
        <div
          aria-hidden
          onClick={onClose}
          className="fixed inset-0 z-30 bg-scrim/55 backdrop-blur-sm"
        />
      ) : null}
      <aside
        data-expanded={expanded ? 'true' : undefined}
        className={cn(
          'group fixed left-0 top-0 z-40 flex h-screen w-16 flex-col gap-4 overflow-hidden bg-transparent px-3 pb-4 pt-7 transition-[width,box-shadow,background-color] duration-200 lg:border-r lg:border-border/50 lg:bg-background lg:hover:w-64 lg:hover:shadow-xl data-[expanded=true]:w-72 data-[expanded=true]:border-r data-[expanded=true]:border-border/50 data-[expanded=true]:bg-background data-[expanded=true]:shadow-xl',
          className,
        )}
        {...props}
      >
        <div className="hidden shrink-0 flex-col pb-4 group-data-[expanded=true]:flex group-data-[expanded=true]:pr-8 lg:flex">
          {brand}
        </div>
        <Button
          type="button"
          variant="default"
          shape="pill"
          size="icon-sm"
          onClick={onToggle}
          aria-pressed={toggleOpen}
          aria-label={toggleOpen ? collapseLabel : expandLabel}
          className={cn('fixed right-4 top-4 z-50 shadow-sm lg:hidden', !toggleOpen && 'size-10')}
        >
          <Icon size="md">{toggleOpen ? <X /> : <Menu />}</Icon>
        </Button>
        <nav className="hidden flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden group-data-[expanded=true]:flex lg:flex">
          {nav}
        </nav>
        <div className="hidden shrink-0 flex-col gap-2 group-data-[expanded=true]:flex lg:flex">
          {actions}
        </div>
      </aside>
    </>
  )
}
