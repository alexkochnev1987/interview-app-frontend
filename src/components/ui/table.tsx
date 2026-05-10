import * as React from 'react'

import { cn } from '@/lib/utils'

type TableProps = React.ComponentProps<'table'> & {
  minRows?: 4
  tabularWidth?: 'default' | 'wide'
}

function Table({ className, minRows, tabularWidth = 'default', ...props }: TableProps) {
  return (
    <div
      data-slot="table-wrapper"
      className={cn('w-full min-w-0 overflow-x-auto', minRows === 4 && 'min-h-[18.5rem]')}
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
