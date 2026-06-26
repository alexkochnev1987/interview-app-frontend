import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

type TableProps = React.ComponentProps<'table'> & {
  minRows?: number
  tabularWidth?: 'default' | 'wide'
  scrollbar?: 'bottom' | 'top'
}

const TABLE_HEADER_MIN_HEIGHT_REM = 2.5
const TABLE_BODY_ROW_MIN_HEIGHT_REM = 4

function Table({
  className,
  minRows,
  tabularWidth = 'default',
  scrollbar = 'bottom',
  ...props
}: TableProps) {
  const minHeightRem =
    minRows != null && minRows > 0
      ? TABLE_HEADER_MIN_HEIGHT_REM + minRows * TABLE_BODY_ROW_MIN_HEIGHT_REM
      : undefined

  const tableNode = (
    <table
      data-slot="table"
      className={cn(
        'w-full caption-bottom text-sm',
        tabularWidth === 'wide' && 'min-w-[42rem]',
        className,
      )}
      {...props}
    />
  )

  if (scrollbar === 'top') {
    // rotateX(180deg) on the outer div flips the element so the native scrollbar
    // renders at the top; the inner div counter-rotates to restore reading direction.
    // CSS transforms create a new stacking context — do not render portals or
    // position:absolute children inside this wrapper.
    return (
      <div
        data-slot="table-wrapper"
        data-scrollbar="top"
        className="w-full min-w-0 overflow-x-auto [transform:rotateX(180deg)]"
        style={
          minHeightRem != null ? { minHeight: `${minHeightRem}rem` } : undefined
        }
      >
        <div className="[transform:rotateX(180deg)]">{tableNode}</div>
      </div>
    )
  }

  return (
    <div
      data-slot="table-wrapper"
      className={cn('w-full min-w-0 overflow-x-auto')}
      style={
        minHeightRem != null ? { minHeight: `${minHeightRem}rem` } : undefined
      }
    >
      {tableNode}
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

const tableRowVariants = cva('transition-colors', {
  variants: {
    interactive: {
      false: 'hover:bg-muted/30',
      true: 'cursor-pointer hover:bg-muted/30',
      none: '',
    },
    state: {
      default: '',
      selected: 'bg-primary/5',
      deleted: 'opacity-60',
      scheduled:
        'bg-scheduled-soft text-scheduled-soft-foreground [&_.text-muted-foreground]:text-scheduled-soft-foreground/75 [&_.text-foreground]:text-scheduled-soft-foreground',
    },
  },
  defaultVariants: {
    interactive: false,
    state: 'default',
  },
})

type TableRowProps = React.ComponentProps<'tr'> &
  VariantProps<typeof tableRowVariants>

function TableRow({
  className,
  interactive,
  state,
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...props
}: TableRowProps) {
  const isInteractive = interactive === true

  function handleKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (!isInteractive || !onClick) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick(event as unknown as React.MouseEvent<HTMLTableRowElement>)
    }
  }

  return (
    <tr
      data-slot="table-row"
      data-state={state === 'default' ? undefined : state}
      className={cn(tableRowVariants({ interactive, state }), className)}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
      tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
      role={isInteractive ? (role ?? 'button') : role}
      {...props}
    />
  )
}

const tableCellShared = cva('', {
  variants: {
    width: {
      auto: '',
      fill: 'w-full min-w-[18rem]',
      tight: 'w-10',
    },
    align: {
      left: 'text-left',
      right: 'text-right',
    },
    visibility: {
      always: '',
      'md-up': 'hidden md:table-cell',
      'lg-up': 'hidden lg:table-cell',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
    nowrap: {
      true: 'whitespace-nowrap',
      false: '',
    },
  },
  defaultVariants: {
    width: 'auto',
    align: 'left',
    visibility: 'always',
    truncate: false,
    nowrap: false,
  },
})

type TableHeadProps = React.ComponentProps<'th'> &
  VariantProps<typeof tableCellShared>

function TableHead({
  className,
  width,
  align,
  visibility,
  nowrap,
  truncate,
  ...props
}: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-4 align-middle text-[0.68rem] font-bold uppercase tracking-widest text-foreground/70',
        tableCellShared({ width, align, visibility, nowrap, truncate }),
        align === undefined && 'text-left',
        className,
      )}
      {...props}
    />
  )
}

type TableCellProps = React.ComponentProps<'td'> &
  VariantProps<typeof tableCellShared>

function TableCell({
  className,
  width,
  align,
  visibility,
  nowrap,
  truncate,
  ...props
}: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-3 align-middle',
        tableCellShared({ width, align, visibility, nowrap, truncate }),
        className,
      )}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
