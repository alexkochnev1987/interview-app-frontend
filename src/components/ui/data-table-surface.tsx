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
  children,
}: DataTableSurfaceProps) {
  return (
    <Card variant="surface" ref={rootRef}>
      <LoadingBar visible={loading && hasItems} />
      <Table tabularWidth={tabularWidth} scrollbar={scrollbar} minRows={minRows}>
        {children}
      </Table>
    </Card>
  )
}
