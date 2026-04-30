'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BulletList } from '@/components/ui/bullet-list'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { type BulkDeleteResult } from '@/lib/api'
import { truncateText } from '@/lib/text'

interface BulkDeleteResultAlertsProps {
  result: BulkDeleteResult | null
  error: string | null
}

export function BulkDeleteResultAlerts({
  result,
  error,
}: BulkDeleteResultAlertsProps) {
  if (error) {
    return (
      <Alert variant="danger">
        <AlertTitle>Bulk delete failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!result) return null

  if (result.blocked.length > 0) {
    return (
      <Alert variant="warning">
        <AlertTitle>
          Deleted {result.deleted.length}, blocked {result.blocked.length}
        </AlertTitle>
        <AlertDescription>
          <Stack gap={2}>
            <BodyText size="sm">
              These questions are used in active interviews and were not deleted:
            </BodyText>
            <BulletList>
              {result.blocked.map((item) => (
                <li key={item.id}>
                  <BodyText as="span" size="sm" weight="medium" tone="foreground">
                    {truncateText(item.questionText, 80)}
                  </BodyText>
                  {' — '}
                  <BodyText as="span" size="sm">
                    {item.reason}
                  </BodyText>
                </li>
              ))}
            </BulletList>
          </Stack>
        </AlertDescription>
      </Alert>
    )
  }

  if (result.deleted.length > 0) {
    return (
      <Alert variant="success">
        <AlertTitle>Deleted {result.deleted.length} question(s)</AlertTitle>
        <AlertDescription>The library is up to date.</AlertDescription>
      </Alert>
    )
  }

  return null
}
