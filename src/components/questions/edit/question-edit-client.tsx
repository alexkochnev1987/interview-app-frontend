'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DeletedQuestionBanner } from '@/components/questions/detail/deleted-question-banner'
import { QuestionDangerZone } from '@/components/questions/detail/question-danger-zone'
import { QuestionEditor } from '@/components/questions/editor/question-editor'
import {
  useDeleteQuestion,
  useRestoreQuestion,
  useUpdateQuestion,
} from '@/components/questions/use-question-mutations'
import { useRouter } from '@/i18n/navigation'
import { type Question, type QuestionInput } from '@/lib/api'
import { questionToEditorInput } from '@/lib/question-editor/parsers'

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
  const { mutateAsync: updateQuestion } = useUpdateQuestion()
  const { mutate: deleteQuestion, isPending: deleting } = useDeleteQuestion()
  const { mutate: restoreQuestion, isPending: restoring } = useRestoreQuestion()
  const [question, setQuestion] = useState(initialQuestion)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

  async function handleSubmit(value: QuestionInput) {
    const updated = await updateQuestion({ id, value })
    setQuestion(updated)
    router.refresh()
    return updated
  }

  function performRestore() {
    if (restoring) return

    restoreQuestion(id, {
      onSuccess: (restored)=>{
        setQuestion(restored)
        setRestoreOpen(false)
        router.refresh()
      }
    })
  }

  function performDelete() {
    if (deleting) return

    deleteQuestion(id,{
      onSuccess:()=>{
        setConfirmOpen(false)
        router.push('/questions')
        router.refresh()
      }
    })
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
