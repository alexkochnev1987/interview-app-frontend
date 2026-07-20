'use client'

import { WandSparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'
import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface AiDraftPanelProps {
  hasPendingDraft: boolean
  pendingCount: number
  loading: boolean
  disabled: boolean
  error?: string
  onGenerate: () => void
  onApplyAll: () => void
}

export function AiDraftPanel({
  hasPendingDraft,
  pendingCount,
  loading,
  disabled,
  error,
  onGenerate,
  onApplyAll,
}: AiDraftPanelProps) {
  const t = useTranslations('questions.aiDraft')
  const labels = useQuestionEditorLabels()

  return (
    <Card variant="surface" data-tour="ai-draft-panel">
      <CardHeader spacing="lg">
        <Stack gap={1.5}>
          <Inline gap={3} align="start" justify="between">
            <CardTitle size="lg">{t('title')}</CardTitle>
            {hasPendingDraft ? (
              <StatusPill tone="neutral">{t('pending', { count: pendingCount })}</StatusPill>
            ) : null}
          </Inline>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </Stack>

        <Stack gap={2}>
          {error ? (
            <BodyText role="alert" size="sm" tone="danger">
              {error}
            </BodyText>
          ) : null}
          <Inline gap={2} align="center" justify="end" wrap="wrap">
            {hasPendingDraft ? (
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                onClick={onApplyAll}
              >
                {labels.applyAll}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="gradient"
              onClick={onGenerate}
              disabled={disabled}
              loading={loading}
            >
              <WandSparkles className="size-4" />
              {loading ? t('generating') : t('generate')}
            </Button>
          </Inline>
        </Stack>
      </CardHeader>
    </Card>
  )
}
