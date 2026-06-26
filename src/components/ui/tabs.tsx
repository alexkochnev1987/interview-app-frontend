'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type TabItem = {
  id: string
  label: string
  badge?: string
  disabled?: boolean
}

const tabsListVariants = cva(
  'inline-flex flex-wrap items-center gap-1 rounded-full border border-border bg-surface-glass-soft p-0.5',
)

const tabTriggerVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      active: {
        true: 'bg-secondary text-secondary-foreground shadow-sm',
        false: 'text-muted-foreground hover:bg-muted hover:text-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

export type TabsProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
  ariaLabel?: string
  disabled?: boolean
}

function isTabItemEnabled(item: TabItem, listDisabled: boolean): boolean {
  return !listDisabled && !item.disabled
}

export function Tabs({
  items,
  activeId,
  onChange,
  ariaLabel = 'Tabs',
  disabled = false,
  className,
  ...props
}: TabsProps) {
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>())

  const enabledItems = React.useMemo(
    () => items.filter((item) => isTabItemEnabled(item, disabled)),
    [items, disabled],
  )

  function focusTab(id: string) {
    requestAnimationFrame(() => {
      tabRefs.current.get(id)?.focus()
    })
  }

  function activateTab(id: string) {
    if (!enabledItems.some((item) => item.id === id)) {
      return
    }
    onChange(id)
    focusTab(id)
  }

  function handleTabListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (enabledItems.length === 0) {
      return
    }

    const currentIndex = enabledItems.findIndex((item) => item.id === activeId)
    const resolvedIndex = currentIndex === -1 ? 0 : currentIndex
    let nextIndex = resolvedIndex

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (resolvedIndex + 1) % enabledItems.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (resolvedIndex - 1 + enabledItems.length) % enabledItems.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = enabledItems.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    activateTab(enabledItems[nextIndex].id)
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      data-slot="tabs"
      className={cn(tabsListVariants(), className)}
      onKeyDown={handleTabListKeyDown}
      {...props}
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        const isDisabled = disabled || item.disabled

        return (
          <button
            key={item.id}
            ref={(node) => {
              if (node) {
                tabRefs.current.set(item.id, node)
              } else {
                tabRefs.current.delete(item.id)
              }
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            data-slot="tabs-trigger"
            data-state={isActive ? 'active' : 'inactive'}
            className={cn(tabTriggerVariants({ active: isActive }))}
            onClick={() => onChange(item.id)}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <Badge variant="capsLabelPrimary" size="capsLabelSm">
                {item.badge}
              </Badge>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export type TabPanelProps = {
  id: string
  activeId: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ id, activeId, children, className }: TabPanelProps) {
  if (id !== activeId) return null

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      data-slot="tabs-panel"
      className={className}
    >
      {children}
    </div>
  )
}
