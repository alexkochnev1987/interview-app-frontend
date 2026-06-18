'use client'

import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import type { ComponentProps } from 'react'

import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | 'none'

type TableHeadProps = ComponentProps<typeof TableHead>

export type SortableTableHeadProps = Omit<TableHeadProps, 'children'> & {
  label: string
  direction: SortDirection
  onSortClick: () => void
}

export function SortableTableHead({
  label,
  direction,
  onSortClick,
  align,
  className,
  ...rest
}: SortableTableHeadProps) {
  const isActive = direction !== 'none'
  const Icon = !isActive
    ? ChevronsUpDown
    : direction === 'desc'
      ? ChevronDown
      : ChevronUp
  const ariaSort =
    direction === 'desc'
      ? 'descending'
      : direction === 'asc'
        ? 'ascending'
        : 'none'

  return (
    <TableHead
      align={align}
      className={className}
      aria-sort={ariaSort}
      {...rest}
    >
      <button
        type="button"
        onClick={onSortClick}
        className={cn(
          'group/sort inline-flex w-full items-center gap-1 text-[0.68rem] font-bold uppercase tracking-widest text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none',
          align === 'right' && 'justify-end',
        )}
      >
        <span>{label}</span>
        <Icon
          className={cn(
            'size-3',
            isActive ? 'opacity-100' : 'opacity-30 group-hover/sort:opacity-60',
          )}
        />
      </button>
    </TableHead>
  )
}
