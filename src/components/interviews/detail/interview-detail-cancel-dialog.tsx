'use client'

import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type InterviewDetailCancelDialogProps = {
  open: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function InterviewDetailCancelDialog({
  open,
  loading,
  onConfirm,
  onCancel,
}: InterviewDetailCancelDialogProps) {
  const tActions = useTranslations('interviews.actions')

  return (
    <ConfirmDialog
      open={open}
      destructive
      title={tActions('cancelTitle')}
      description={tActions('cancelDescription')}
      confirmLabel={loading ? tActions('canceling') : tActions('confirmCancel')}
      cancelLabel={tActions('dismiss')}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
