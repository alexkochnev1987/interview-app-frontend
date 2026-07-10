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
  retrying: boolean
  retryDisabled: boolean
  onRetry: () => Promise<void>
}

export function CandidateFeedbackFailedBlock({
  retrying,
  retryDisabled,
  onRetry,
}: CandidateFeedbackFailedBlockProps) {
  const t = useTranslations('interviews.candidateFeedback')

  return (
    <Stack gap={4}>
      <Alert variant="danger">
        <AlertTitle>{t('failedTitle')}</AlertTitle>
        <AlertDescription>{t('failedDescription')}</AlertDescription>
      </Alert>
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
    </Stack>
  )
}
