import type { ReactNode } from 'react'

import { BodyText } from '@/components/ui/text'

const EMPTY = '—'

export function TableCellValue({
  value,
}: {
  value: string | number | undefined | null
}): ReactNode {
  if (value === undefined || value === null || value === '') {
    return (
      <BodyText as="span" size="sm" tone="muted">
        {EMPTY}
      </BodyText>
    )
  }
  return (
    <BodyText as="span" size="sm" tone="foreground">
      {value}
    </BodyText>
  )
}
