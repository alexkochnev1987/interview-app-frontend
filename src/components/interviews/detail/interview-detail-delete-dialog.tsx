'use client'

import { useTranslations } from 'next-intl'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type InterviewDetailDeleteDialogProps = {
    open: boolean
    loading: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function InterviewDetailDeleteDialog({
    open,
    loading,
    onConfirm,
    onCancel
                                            }: InterviewDetailDeleteDialogProps){

    const tActions = useTranslations('interviews.actions')

    return (
        <ConfirmDialog
            open={open}
            destructive
            title={tActions('deleteTitle')}
            description={tActions('deleteDescription')}
            confirmLabel={loading ? tActions('deleting') : tActions('confirmDelete')}
            cancelLabel={tActions('dismissDelete')}
            loading={loading}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    )
}
