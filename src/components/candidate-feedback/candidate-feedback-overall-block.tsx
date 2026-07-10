'use client'

import { useEffect, useId, useState } from 'react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { CandidateFeedbackBlockStatePill } from '@/components/candidate-feedback/candidate-feedback-block-state-pill'
import { CandidateFeedbackFailedBlock } from '@/components/candidate-feedback/candidate-feedback-failed-block'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { LoadingStateCard } from '@/components/ui/state-card'
import { Textarea } from '@/components/ui/textarea'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { type CandidateFeedbackBlockState } from '@/lib/candidate-feedback'

interface CandidateFeedbackOverallBlockProps {
  state: CandidateFeedbackBlockState
  text: string | null | undefined
  saving: boolean
  retrying: boolean
  retryDisabled: boolean
  onRetry: () => Promise<void>
  onAccept: () => Promise<void>
  onSave: (text: string) => Promise<void>
}

export function CandidateFeedbackOverallBlock({
  state,
  text,
  saving,
  retrying,
  retryDisabled,
  onRetry,
  onAccept,
  onSave,
}: CandidateFeedbackOverallBlockProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const textareaId = useId()
  const [draftText, setDraftText] = useState(text ?? '')

  useEffect(() => {
    setDraftText(text ?? '')
  }, [text, state])

  return (
    <Card variant="surface" size="lg">
      <CardContent spacing="lg">
        <Stack gap={4}>
          <Inline gap={2} align="center" justify="between" wrap="wrap">
            <SectionHeading as="h3">{t('overallBlockTitle')}</SectionHeading>
            <CandidateFeedbackBlockStatePill state={state} />
          </Inline>

          {state === 'not_generated' ? (
            <BodyText tone="muted">{t('notGeneratedHint')}</BodyText>
          ) : null}

          {state === 'generating' ? (
            <LoadingStateCard label={t('generatingHint')} tone="ghost" />
          ) : null}

          {state === 'failed' ? (
            <CandidateFeedbackFailedBlock
              retrying={retrying}
              retryDisabled={retryDisabled}
              onRetry={onRetry}
            />
          ) : null}

          {state === 'generated' ? (
            <Stack gap={4}>
              <BodyText tone="muted">{t('suggestionLead')}</BodyText>
              <BodyText>{text?.trim() ? text : t('noTextYet')}</BodyText>
              <Inline gap={2} wrap="wrap">
                <DemoWriteGuard disabled={saving}>
                  <Button
                    type="button"
                    variant="gradient"
                    shape="pill"
                    loading={saving}
                    onClick={() => void onAccept()}
                  >
                    {t('acceptSuggestion')}
                  </Button>
                </DemoWriteGuard>
              </Inline>
            </Stack>
          ) : null}

          {state === 'accepted' || state === 'edited' ? (
            <Stack gap={4}>
              <FormField htmlFor={textareaId} label={t('overallBlockTitle')}>
                <Textarea
                  id={textareaId}
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  disabled={saving}
                  size="md"
                />
              </FormField>
              <Inline gap={2} wrap="wrap">
                <DemoWriteGuard disabled={saving}>
                  <Button
                    type="button"
                    variant="gradient"
                    shape="pill"
                    loading={saving}
                    onClick={() => void onSave(draftText)}
                  >
                    {t('saveChanges')}
                  </Button>
                </DemoWriteGuard>
              </Inline>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
