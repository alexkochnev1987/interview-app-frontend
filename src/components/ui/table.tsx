import * as React from 'react'

import { cn } from '@/lib/utils'

type TableProps = React.ComponentProps<'table'> & {
  minRows?: number
  tabularWidth?: 'default' | 'wide'
}

const TABLE_HEADER_MIN_HEIGHT_REM = 2.5
const TABLE_BODY_ROW_MIN_HEIGHT_REM = 4

function Table({ className, minRows, tabularWidth = 'default', ...props }: TableProps) {
  const minHeightRem =
    minRows != null && minRows > 0
      ? TABLE_HEADER_MIN_HEIGHT_REM + minRows * TABLE_BODY_ROW_MIN_HEIGHT_REM
      : undefined

  return (
    <div
      data-slot="table-wrapper"
      className={cn('w-full min-w-0 overflow-x-auto')}
      style={
        minHeightRem != null ? { minHeight: `${minHeightRem}rem` } : undefined
      }
    >
      <table
        data-slot="table"
        className={cn(
          'w-full caption-bottom text-sm',
          tabularWidth === 'wide' && 'min-w-[42rem]',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('border-b border-border/30', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('divide-y divide-border/30', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('transition-colors hover:bg-muted/30', className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-4 text-left align-middle text-[0.68rem] font-bold uppercase tracking-widest text-foreground/70',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-4 py-3 align-middle', className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
