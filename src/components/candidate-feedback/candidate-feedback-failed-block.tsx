'use client'

import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'

interface CandidateFeedbackFailedBlockProps {
  errorMessage?: string | null
  retrying: boolean
  retryDisabled: boolean
  onRetry: () => Promise<void>
  showRetry?: boolean
  showAlert?: boolean
}

export function CandidateFeedbackFailedBlock({
  errorMessage,
  retrying,
  retryDisabled,
  onRetry,
  showRetry = true,
  showAlert = true,
}: CandidateFeedbackFailedBlockProps) {
  const t = useTranslations('interviews.candidateFeedback')

  if (!showAlert && !showRetry) {
    return null
  }

  return (
    <Stack gap={4}>
      {showAlert ? (
        <Alert variant="danger">
          <AlertTitle>{t('failedTitle')}</AlertTitle>
          <AlertDescription>
            {errorMessage?.trim() ? errorMessage : t('failedDescription')}
          </AlertDescription>
        </Alert>
      ) : null}
      {showRetry ? (
        <Inline gap={2} wrap="wrap">
          <DemoWriteGuard disabled={retrying || retryDisabled}>
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              loading={retrying}
              onClick={() => void onRetry()}
            >
              <Icon size="sm">
                <RefreshCw />
              </Icon>
              {t('retry')}
            </Button>
          </DemoWriteGuard>
        </Inline>
      ) : null}
    </Stack>
  )
}
