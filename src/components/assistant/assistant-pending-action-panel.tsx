'use client'

import { useTranslations } from 'next-intl'

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
import { AssistantQuestionPlan } from './assistant-question-plan'

type AssistantPendingActionContentProps = {
  pendingAction: RecruiterAssistantPendingAction
  loading?: boolean
  onConfirm: () => void
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
  const canConfirm = canConfirmAssistantPendingAction(pendingAction, user?.role)
  const details = getPendingActionConfirmDetails(pendingAction, t, {
    formatInterviewLocale: (locale) => (tLocales.has(locale) ? tLocales(locale) : locale),
  })
  const questions = getPendingActionQuestions(pendingAction)

  return (
    <Stack gap={3}>
      <BodyText>{getPendingActionConfirmMessage(pendingAction, t)}</BodyText>

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

      {questions.length > 0 ? <AssistantQuestionPlan questions={questions} /> : null}

      <Stack gap={2}>
        {canConfirm ? (
          <DemoWriteGuard width="full" disabled={loading}>
            <Button variant="gradient" width="full" loading={loading} onClick={onConfirm}>
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
