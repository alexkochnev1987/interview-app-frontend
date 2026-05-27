'use client'

import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('questions.picker')
  const tFeed = useTranslations('questions.picker.feed')

  if (!error) return null

  return (
    <Alert variant="danger">
      <AlertTitle>{t('refetch.genericTitle')}</AlertTitle>
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
            {tFeed('retry')}
          </Button>
        </Inline>
      </AlertDescription>
    </Alert>
  )
}
