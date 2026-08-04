'use client'

import { useTranslations } from 'next-intl'

import { AssistantPendingActionContent } from '@/components/assistant/assistant-pending-action-panel'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalShell } from '@/components/ui/modal-shell'
import type { RecruiterAssistantPendingAction } from '@/lib/api'

type AssistantPendingActionModalProps = {
  pendingAction: RecruiterAssistantPendingAction
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function AssistantPendingActionModal({
  pendingAction,
  loading = false,
  onConfirm,
  onCancel,
}: AssistantPendingActionModalProps) {
  const t = useTranslations('assistant')

  return (
    <ModalShell
      size="lg"
      dismissDisabled={loading}
      onDismiss={onCancel}
      accessibilityTitle={t('confirm.title')}
    >
      <CardHeader spacing="sm">
        <CardTitle size="lg">{t('confirm.title')}</CardTitle>
      </CardHeader>
      <CardContent spacing="lg">
        <AssistantPendingActionContent
          pendingAction={pendingAction}
          loading={loading}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </CardContent>
    </ModalShell>
  )
}
