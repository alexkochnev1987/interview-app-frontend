'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import type { RecruiterAssistantPendingAction } from '@/lib/api'
import { useAuth, useIsDemo } from '@/lib/auth-context'

import {
  getPendingActionConfirmDetails,
  getPendingActionConfirmMessage,
  getPendingActionQuestions,
} from './assistant-confirm-copy'
import { canConfirmAssistantPendingAction } from './assistant-pending-action-auth'
import {
  isEditableInterviewPendingAction,
  removePendingActionQuestion,
} from './assistant-pending-action-questions'
import { AssistantQuestionPlan } from './assistant-question-plan'

type AssistantPendingActionContentProps = {
  pendingAction: RecruiterAssistantPendingAction
  loading?: boolean
  onConfirm: (pendingAction: RecruiterAssistantPendingAction) => void
  onCancel: () => void
}

export function AssistantPendingActionContent({
  pendingAction,
  loading = false,
  onConfirm,
  onCancel,
}: AssistantPendingActionContentProps) {
  const { user } = useAuth()
  const isDemo = useIsDemo()
  const t = useTranslations('assistant')
  const tCommon = useTranslations('common')
  const tLocales = useTranslations('languageSwitcher.locales')
  const editable = isEditableInterviewPendingAction(pendingAction)
  const [draftAction, setDraftAction] = useState(pendingAction)

  useEffect(() => {
    setDraftAction(pendingAction)
  }, [pendingAction])

  const actionForConfirm = editable ? draftAction : pendingAction
  const canConfirm = canConfirmAssistantPendingAction(actionForConfirm, user?.role)
  const details = getPendingActionConfirmDetails(actionForConfirm, t, {
    formatInterviewLocale: (locale) => (tLocales.has(locale) ? tLocales(locale) : locale),
  })
  const questions = getPendingActionQuestions(actionForConfirm)
  const confirmDisabled = loading || (editable && questions.length === 0)

  function handleRemoveQuestion(questionKey: string) {
    if (!isEditableInterviewPendingAction(draftAction)) return
    setDraftAction(removePendingActionQuestion(draftAction, questionKey))
  }

  return (
    <Stack gap={3}>
      <BodyText>{getPendingActionConfirmMessage(actionForConfirm, t)}</BodyText>

      {isDemo ? (
        <Alert variant="warning">
          <AlertDescription>{tCommon('demoMode.readOnlyHint')}</AlertDescription>
        </Alert>
      ) : null}

      {details.length > 0 ? (
        <Stack gap={2}>
          {details.map((row) => (
            <Stack key={row.label} gap={0}>
              <EyebrowLabel>{row.label}</EyebrowLabel>
              <BodyText weight="medium">{row.value}</BodyText>
            </Stack>
          ))}
        </Stack>
      ) : null}

      {questions.length > 0 || editable ? (
        <AssistantQuestionPlan
          questions={questions}
          onRemoveQuestion={editable ? handleRemoveQuestion : undefined}
          removeDisabled={loading || isDemo}
        />
      ) : null}

      <Stack gap={2}>
        {canConfirm ? (
          <DemoWriteGuard width="full" disabled={confirmDisabled}>
            <Button
              variant="gradient"
              width="full"
              loading={loading}
              disabled={confirmDisabled}
              onClick={() => onConfirm(actionForConfirm)}
            >
              {t('confirm.action')}
            </Button>
          </DemoWriteGuard>
        ) : (
          <BodyText size="sm" tone="muted">
            {t('confirm.noPermission')}
          </BodyText>
        )}
        <Button type="button" variant="outline" width="full" disabled={loading} onClick={onCancel}>
          {t('confirm.cancel')}
        </Button>
      </Stack>
    </Stack>
  )
}
