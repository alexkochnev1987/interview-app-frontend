'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DeletedQuestionBanner } from '@/components/questions/detail/deleted-question-banner'
import { QuestionDangerZone } from '@/components/questions/detail/question-danger-zone'
import { QuestionDeleteScheduledAlert } from '@/components/questions/detail/question-delete-scheduled-alert'
import {
  QuestionEditor,
  type QuestionSubmitCallbacks,
} from '@/components/questions/editor/question-editor'
import {
  useDeleteQuestion,
  useRestoreQuestion,
  useUpdateQuestion,
} from '@/components/questions/use-question-mutations'
import { Stack } from '@/components/ui/layout/stack'
import { useRouter } from '@/i18n/navigation'
import {
  type DeleteQuestionResult,
  type Question,
  type QuestionInput,
} from '@/lib/api'
import { questionToEditorInput } from '@/lib/question-editor/parsers'
import { runMutation } from '@/lib/run-mutation'
import { notifyInfo, notifySuccess } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'

type QuestionEditClientProps = {
  id: string
  initialQuestion: Question
  canUpdate: boolean
  canDelete: boolean
}

function isDeleteScheduled(
  result: DeleteQuestionResult,
): result is Extract<DeleteQuestionResult, { scheduled: true }> {
  return 'scheduled' in result && result.scheduled === true
}

export function QuestionEditClient({
  id,
  initialQuestion,
  canUpdate,
  canDelete,
}: QuestionEditClientProps) {
  const t = useTranslations('questions.editPage')
  const router = useRouter()
  const toastMessages = useToastMessages()
  const { mutate: updateQuestion, isPending: submitting } = useUpdateQuestion()
  const { mutateAsync: deleteQuestion, isPending: deleting } = useDeleteQuestion()
  const { mutateAsync: restoreQuestion, isPending: restoring } = useRestoreQuestion()
  const [question, setQuestion] = useState(initialQuestion)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [scheduledDelete, setScheduledDelete] = useState<
    Extract<DeleteQuestionResult, { scheduled: true }> | null
  >(null)

  function handleSubmit(value: QuestionInput, { onSuccess }: QuestionSubmitCallbacks) {
    updateQuestion(
      { id, value },
      {
        onSuccess: (updated) => {
          setQuestion(updated)
          router.refresh()
          onSuccess(questionToEditorInput(updated))
        },
      },
    )
  }

  async function performRestore() {
    if (restoring) return
    try {
      const restored = await runMutation(() => restoreQuestion(id), {
        successMessage: toastMessages.question.restoreSuccess,
        errorMessage: toastMessages.question.restoreError,
      })
      setQuestion(restored)
      setRestoreOpen(false)
      router.refresh()
    } catch {}
  }

  async function performDelete() {
    if (deleting) return
    try {
      const result = await runMutation(() => deleteQuestion(id), {
        showSuccessToast: false,
        errorMessage: toastMessages.question.deleteError,
      })
      setConfirmOpen(false)
      if (isDeleteScheduled(result)) {
        setScheduledDelete(result)
        notifyInfo(toastMessages.deleteQuestion.scheduledTitle, {
          description: toastMessages.deleteQuestion.scheduledIntro,
        })
        setQuestion((prev) => ({ ...prev, pendingDeletion: true }))
        return
      }
      notifySuccess(toastMessages.question.deleteSuccess)
      router.push('/questions')
      router.refresh()
    } catch {}
  }

  return (
    <>
      {question.deleted && canUpdate ? (
        <DeletedQuestionBanner
          restoring={restoring}
          onRestore={() => setRestoreOpen(true)}
        />
      ) : null}
      {!question.deleted && (question.pendingDeletion || scheduledDelete) ? (
          <QuestionDeleteScheduledAlert
            intro={toastMessages.deleteQuestion.scheduledIntro}
            blockingInterviews={scheduledDelete?.blockingInterviews ?? []}
          />
      ) : null}
      <QuestionEditor
        questionId={id}
        title={canUpdate ? t('title') : t('viewTitle')}
        readOnly={!canUpdate}
        initialValue={questionToEditorInput(question)}
        submitLabel={t('submit')}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
      {!question.deleted && canDelete ? (
        <Stack gap={4}>
          <QuestionDangerZone
            deleting={deleting}
            onRequestDelete={() => setConfirmOpen(true)}
          />
        </Stack>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        destructive
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        confirmLabel={deleting ? t('deleting') : t('confirmDelete')}
        cancelLabel={t('cancel')}
        loading={deleting}
        onConfirm={performDelete}
        onCancel={() => {
          if (!deleting) setConfirmOpen(false)
        }}
      />
      <ConfirmDialog
        open={restoreOpen}
        title={t('restoreTitle')}
        description={t('restoreDescription')}
        confirmLabel={restoring ? t('restoring') : t('restore')}
        cancelLabel={t('cancel')}
        loading={restoring}
        onConfirm={performRestore}
        onCancel={() => {
          if (!restoring) setRestoreOpen(false)
        }}
      />
    </>
  )
}
