'use client'

import { RefreshCw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'

export type QuestionPickerRefetchAlertProps = {
  error: string | null
  onRetry: () => void
}

export function QuestionPickerRefetchAlert({
  error,
  onRetry,
}: QuestionPickerRefetchAlertProps) {
  if (!error) return null

  return (
    <Alert variant="danger">
      <AlertTitle>Couldn&apos;t refresh questions</AlertTitle>
      <AlertDescription>
        <Inline gap={3} align="center" wrap="wrap">
          <span>{error}</span>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={onRetry}
          >
            <Icon size="sm">
              <RefreshCw />
            </Icon>
            Retry
          </Button>
        </Inline>
      </AlertDescription>
    </Alert>
  )
}
