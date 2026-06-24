'use client'

import { useEffect, useState } from 'react'
import { BriefcaseBusiness, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  InterviewQuestionPickerAside,
  InterviewQuestionPickerMain,
} from '@/components/questions/picker/interview-question-picker-section'
import { useInterviewQuestionPicker } from '@/components/questions/picker/use-interview-question-picker'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { IconAffix } from '@/components/ui/icon-affix'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Input } from '@/components/ui/input'
import { updateInterview, type Interview } from '@/lib/api'
import { isInterviewEditDirty } from '@/lib/interview-edit-dirty'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

type InterviewEditPanelProps = {
  interview: Interview
  initialPrefetch?: QuestionsLibraryPrefetch
  onSaved: (updated: Interview) => void
  onExitEdit: () => void
}

export function InterviewEditPanel({
  interview,
  initialPrefetch,
  onSaved,
  onExitEdit,
}: InterviewEditPanelProps) {
  const tEdit = useTranslations('interviews.edit')
  const tActions = useTranslations('interviews.actions')
  const tPicker = useTranslations('questions.common')
  const toastMessages = useToastMessages()

  const [candidateName, setCandidateName] = useState(interview.candidateName)
  const [position, setPosition] = useState(interview.position)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)

  const picker = useInterviewQuestionPicker({
    initialSelected: interview.questions,
    initialPrefetch,
    serverHydrated: Boolean(initialPrefetch),
  })
  const { selectedCount, selectedById, replaceSelected } = picker

  useEffect(() => {
    setCandidateName(interview.candidateName)
    setPosition(interview.position)
    replaceSelected(interview.questions)
  }, [interview.id, interview.updatedAt, replaceSelected])

  function handleDiscardClick() {
    if (
      isInterviewEditDirty(
        interview,
        candidateName,
        position,
        selectedById,
      )
    ) {
      setDiscardOpen(true)
      return
    }
    onExitEdit()
  }

  async function handleSave() {
    setError(null)

    if (!candidateName.trim()) {
      setError(toastMessages.pageGate.interview.candidateNameRequired)
      return
    }
    if (!position.trim()) {
      setError(toastMessages.pageGate.interview.positionRequired)
      return
    }
    if (selectedCount === 0) {
      setError(toastMessages.pageGate.interview.questionsRequired)
      return
    }

    setSubmitting(true)

    try {
      const updated = await runMutation(
        () =>
          // candidateEmail omitted intentionally - not collected in create/edit UI yet
          updateInterview(interview.id, {
            candidateName: candidateName.trim(),
            position: position.trim(),
            questionIds: Array.from(selectedById.keys()),
          }),
        {
          successMessage: toastMessages.interview.updateSuccess,
          errorMessage: toastMessages.interview.updateError,
        },
      )
      onSaved(updated)
    } catch {
      /* toast handled by runMutation */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {error ? (
        <Alert variant="danger">
          <AlertTitle>{toastMessages.pageGate.interview.setupBlockedTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Grid columns="aside-22-left" gap={6}>
        <Stack gap={4}>
          <Card variant="surface">
            <CardHeader spacing="xs">
              <CardTitle size="lg">{tEdit('title')}</CardTitle>
            </CardHeader>
            <CardContent spacing="lg">
              <FormField htmlFor="edit-candidateName" label={tEdit('candidateName')}>
                <IconAffix icon={<Icon size="md"><UserRound /></Icon>}>
                  <Input
                    id="edit-candidateName"
                    iconAffix="leading"
                    value={candidateName}
                    onChange={(event) => setCandidateName(event.target.value)}
                    placeholder={tPicker('candidateNamePlaceholder')}
                    autoComplete="name"
                    disabled={submitting}
                  />
                </IconAffix>
              </FormField>

              <FormField htmlFor="edit-position" label={tEdit('position')}>
                <IconAffix icon={<Icon size="md"><BriefcaseBusiness /></Icon>}>
                  <Input
                    id="edit-position"
                    iconAffix="leading"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    placeholder={tPicker('positionPlaceholder')}
                    disabled={submitting}
                  />
                </IconAffix>
              </FormField>

              <Inline gap={2} wrap="wrap">
                <Button
                  type="button"
                  variant="gradient"
                  disabled={submitting || selectedCount === 0}
                  onClick={() => void handleSave()}
                >
                  {submitting ? tActions('saving') : tActions('saveChanges')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={handleDiscardClick}
                >
                  {tActions('discardEdit')}
                </Button>
              </Inline>
            </CardContent>
          </Card>

          <InterviewQuestionPickerAside picker={picker} />
        </Stack>

        <InterviewQuestionPickerMain
          picker={picker}
          title={tEdit('questionsTitle')}
          description={tPicker('selectionDescription')}
          disabled={submitting}
        />
      </Grid>

      <ConfirmDialog
        open={discardOpen}
        title={tEdit('discardTitle')}
        description={tEdit('discardDescription')}
        confirmLabel={tActions('discardEdit')}
        cancelLabel={tActions('keepEditing')}
        onConfirm={() => {
          setDiscardOpen(false)
          onExitEdit()
        }}
        onCancel={() => setDiscardOpen(false)}
      />
    </>
  )
}
