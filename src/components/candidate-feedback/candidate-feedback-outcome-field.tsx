'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { DisabledHintTooltip } from '@/components/ui/disabled-hint-tooltip'
import { FormField } from '@/components/ui/form-field'
import { Inline } from '@/components/ui/layout/inline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import { BodyText } from '@/components/ui/text'
import {
  CANDIDATE_FEEDBACK_OUTCOMES,
  type CandidateFeedbackOutcome,
} from '@/lib/candidate-feedback'

const OUTCOME_CLEAR_VALUE = '__clear__'

export type CandidateFeedbackOutcomeChange = {
  outcome: CandidateFeedbackOutcome | null
  outcomeMessage?: string | null
}

interface CandidateFeedbackOutcomeFieldProps {
  value?: CandidateFeedbackOutcome | null
  message?: string | null
  disabled?: boolean
  onChange: (next: CandidateFeedbackOutcomeChange) => void
}

function getPersistedOutcomeKey(
  value?: CandidateFeedbackOutcome | null,
  message?: string | null,
): string {
  return `${value ?? ''}:${message ?? ''}`
}

export function CandidateFeedbackOutcomeField({
  value,
  message,
  disabled,
  onChange,
}: CandidateFeedbackOutcomeFieldProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const persistedOutcomeKey = getPersistedOutcomeKey(value, message)
  const lastPersistedOutcomeKeyRef = useRef(persistedOutcomeKey)
  const [draftCustom, setDraftCustom] = useState(value === 'custom')
  const [draftMessage, setDraftMessage] = useState(message ?? '')

  useEffect(() => {
    if (persistedOutcomeKey === lastPersistedOutcomeKeyRef.current) return
    lastPersistedOutcomeKeyRef.current = persistedOutcomeKey
    /* eslint-disable react-hooks/set-state-in-effect -- sync drafts when saved outcome changes from server */
    setDraftCustom(value === 'custom')
    if (value === 'custom') {
      setDraftMessage(message ?? '')
    }
    if (value == null || value === 'next_stage' || value === 'keep_in_touch') {
      setDraftMessage('')
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [persistedOutcomeKey, value, message])

  const showingCustom = draftCustom || value === 'custom'
  const trimmedDraft = draftMessage.trim()
  const savedMessage = message?.trim() ?? ''
  const customDirty =
    showingCustom &&
    (value !== 'custom' || trimmedDraft !== savedMessage)
  const customSaveLocked = !trimmedDraft

  function handleSelectChange(next: string) {
    if (next === OUTCOME_CLEAR_VALUE) {
      setDraftCustom(false)
      setDraftMessage('')
      onChange({ outcome: null })
      return
    }

    if (next === 'custom') {
      setDraftCustom(true)
      setDraftMessage(value === 'custom' ? (message ?? '') : '')
      return
    }

    setDraftCustom(false)
    setDraftMessage('')
    onChange({ outcome: next as CandidateFeedbackOutcome })
  }

  function handleSaveCustom() {
    if (customSaveLocked) return
    onChange({
      outcome: 'custom',
      outcomeMessage: trimmedDraft,
    })
  }

  const selectValue = showingCustom
    ? 'custom'
    : (value ?? OUTCOME_CLEAR_VALUE)

  return (
    <Stack gap={3}>
      <FormField
        htmlFor="candidate-feedback-outcome"
        label={t('outcomeLabel')}
        labelTooltip={t('outcomeHint')}
      >
        <Select
          value={selectValue}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="candidate-feedback-outcome"
            variant="surface"
            size="md"
            shape="rounded"
            width="full"
          >
            <SelectValue placeholder={t('outcomePlaceholder')} />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value={OUTCOME_CLEAR_VALUE}>
              {t('outcomeClear')}
            </SelectItem>
            {CANDIDATE_FEEDBACK_OUTCOMES.map((outcome) => (
              <SelectItem key={outcome} value={outcome}>
                {t(`outcome.${outcome}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {showingCustom ? (
        <Stack gap={2}>
          <FormField
            htmlFor="candidate-feedback-outcome-message"
            label={t('outcomeMessageLabel')}
          >
            <Textarea
              id="candidate-feedback-outcome-message"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder={t('outcomeMessagePlaceholder')}
              disabled={disabled}
              size="sm"
            />
          </FormField>

          {customDirty ? (
            <Inline gap={2} wrap="wrap">
              <DisabledHintTooltip
                active={customSaveLocked}
                hint={t('outcomeMessageSaveLockedHint')}
              >
                <DemoWriteGuard disabled={disabled || customSaveLocked}>
                  <Button
                    type="button"
                    variant="gradient"
                    shape="pill"
                    loading={disabled}
                    onClick={handleSaveCustom}
                  >
                    {t('saveChanges')}
                  </Button>
                </DemoWriteGuard>
              </DisabledHintTooltip>
            </Inline>
          ) : null}

          {trimmedDraft ? (
            <BodyText size="xs" tone="muted">
              {t('outcomeCustomPreview', { message: trimmedDraft })}
            </BodyText>
          ) : null}
        </Stack>
      ) : value ? (
        <BodyText size="xs" tone="muted">
          {t(`outcomePreview.${value}`)}
        </BodyText>
      ) : null}
    </Stack>
  )
}
