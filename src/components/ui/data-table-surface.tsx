import type { ComponentProps, ReactNode, RefObject } from 'react'

import { Card } from '@/components/ui/card'
import { LoadingBar } from '@/components/ui/loading-bar'
import { Table } from '@/components/ui/table'

type TableProps = ComponentProps<typeof Table>

export type DataTableSurfaceProps = {
  rootRef?: RefObject<HTMLDivElement | null>
  loading?: boolean
  hasItems: boolean
  tabularWidth?: TableProps['tabularWidth']
  scrollbar?: TableProps['scrollbar']
  minRows?: TableProps['minRows']
  /** `card` wraps the table in a surface card; `plain` renders the table only. */
  variant?: 'card' | 'plain'
  children: ReactNode
}

/** Shared Card + loading indicator + scrollable Table shell used by feature list tables. */
export function DataTableSurface({
  rootRef,
  loading = false,
  hasItems,
  tabularWidth = 'wide',
  scrollbar = 'top',
  minRows,
  variant = 'card',
  children,
}: DataTableSurfaceProps) {
  const content = (
    <>
      <LoadingBar visible={loading && hasItems} />
      <Table tabularWidth={tabularWidth} scrollbar={scrollbar} minRows={minRows}>
        {children}
      </Table>
    </>
  )

  if (variant === 'plain') {
    return <div ref={rootRef}>{content}</div>
  }

  return (
    <Card variant="surface" ref={rootRef}>
      {content}
    </Card>
  )
}
