'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
          <p className="mb-2">
            These questions are used in active interviews and were not deleted:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {result.blocked.map((item) => (
              <li key={item.id}>
                <span className="font-medium">
                  {truncateText(item.questionText, 80)}
                </span>
                {' — '}
                <span className="opacity-80">{item.reason}</span>
              </li>
            ))}
          </ul>
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
