'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DeletedQuestionBanner } from '@/components/questions/detail/deleted-question-banner'
import { QuestionDangerZone } from '@/components/questions/detail/question-danger-zone'
import { QuestionEditor } from '@/components/questions/editor/question-editor'
import { useRouter } from '@/i18n/navigation'
import {
  deleteQuestion,
  QuestionInUseError,
  restoreQuestion,
  updateQuestion,
  type Question,
  type QuestionInput,
} from '@/lib/api'
import { questionToEditorInput } from '@/lib/question-editor/parsers'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

type QuestionEditClientProps = {
  id: string
  initialQuestion: Question
  canUpdate: boolean
  canDelete: boolean
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
  const [question, setQuestion] = useState(initialQuestion)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  async function handleSubmit(value: QuestionInput) {
    const updated = await updateQuestion(id, value)
    setQuestion(updated)
    router.refresh()
    return updated
  }

  async function performRestore() {
    if (restoring) return
    setRestoring(true)
    try {
      const restored = await runMutation(() => restoreQuestion(id), {
        successMessage: toastMessages.question.restoreSuccess,
        errorMessage: toastMessages.question.restoreError,
      })
      setQuestion(restored)
      setRestoreOpen(false)
      router.refresh()
    } finally {
      setRestoring(false)
    }
  }

  async function performDelete() {
    if (deleting) return
    setDeleting(true)
    try {
      await runMutation(() => deleteQuestion(id), {
        successMessage: toastMessages.question.deleteSuccess,
        errorMessage: toastMessages.question.deleteError,
        getErrorTitle: (err) =>
          err instanceof QuestionInUseError
            ? toastMessages.deleteQuestion.cannotDeleteTitle
            : toastMessages.question.deleteError,
      })
      setConfirmOpen(false)
      router.push('/questions')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {question.deleted && canUpdate ? (
        <DeletedQuestionBanner
          restoring={restoring}
          onRestore={() => setRestoreOpen(true)}
        />
      ) : null}
      <QuestionEditor
        questionId={id}
        title={canUpdate ? t('title') : t('viewTitle')}
        readOnly={!canUpdate}
        initialValue={questionToEditorInput(question)}
        submitLabel={t('submit')}
        onSubmit={handleSubmit}
      />
      {!question.deleted && canDelete ? (
        <QuestionDangerZone
          deleting={deleting}
          onRequestDelete={() => setConfirmOpen(true)}
        />
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
