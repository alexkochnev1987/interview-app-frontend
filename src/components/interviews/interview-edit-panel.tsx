'use client'

import { useState } from 'react'
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
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Input } from '@/components/ui/input'
import { BodyText } from '@/components/ui/text'
import { updateInterview, type Interview } from '@/lib/api'
import { AssignedHrSelect } from '@/components/interviews/assigned-hr-select'
import { useAuth } from '@/lib/auth-context'
import { canAssignInterviewHr } from '@/lib/auth-roles'
import { canEditInterviewDetails } from '@/lib/interview-management'
import {
  getSelectedQuestionIdsInEditOrder,
  isInterviewEditDirty,
  isInterviewHrAssignmentDirty,
} from '@/lib/interview-edit-dirty'
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

  const canEditDetails = canEditInterviewDetails(interview)
  const hrOnlyMode = !canEditDetails

  const [candidateName, setCandidateName] = useState(interview.candidateName)
  const [position, setPosition] = useState(interview.position)
  const initialAssignedHrId = interview.assignedHrId ?? interview.assignedHr?.id
  const [assignedHrId, setAssignedHrId] = useState<string | undefined>(initialAssignedHrId)
  const { user } = useAuth()
  const canAssign = canAssignInterviewHr(user?.role)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)

  const picker = useInterviewQuestionPicker({
    initialSelected: interview.questions,
    initialPrefetch,
    serverHydrated: Boolean(initialPrefetch),
  })
  const { selectedCount, selectedById } = picker

  const hrAssignmentDirty = isInterviewHrAssignmentDirty(interview, assignedHrId)
  const canSave = hrOnlyMode
    ? canAssign && hrAssignmentDirty
    : selectedCount > 0

  function isDirty() {
    if (hrOnlyMode) {
      return hrAssignmentDirty
    }
    return isInterviewEditDirty(
      interview,
      candidateName,
      position,
      selectedById,
      assignedHrId,
    )
  }

  function handleDiscardClick() {
    if (isDirty()) {
      setDiscardOpen(true)
      return
    }
    onExitEdit()
  }

  async function handleSave() {
    setError(null)

    if (hrOnlyMode) {
      if (!canAssign || !hrAssignmentDirty) {
        return
      }

      setSubmitting(true)

      try {
        const updated = await runMutation(
          () =>
            updateInterview(interview.id, {
              assignedHrId: assignedHrId ?? null,
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
      return
    }

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
            questionIds: getSelectedQuestionIdsInEditOrder(
              interview.questions,
              selectedById,
            ),
            ...(canAssign && assignedHrId !== initialAssignedHrId
              ? { assignedHrId: assignedHrId ?? null }
              : {}),
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

      {hrOnlyMode ? (
        <Card variant="surface">
          <CardHeader spacing="xs">
            <CardTitle size="lg">{tEdit('title')}</CardTitle>
          </CardHeader>
          <CardContent spacing="lg">
            <BodyText size="sm" tone="muted">
              {tEdit('hrOnlyEditNotice')}
            </BodyText>

            {canAssign ? (
              <FormField htmlFor="edit-assignedHr" label={tPicker('assignedHrLabel')}>
                <DemoWriteGuard width="full" disabled={submitting}>
                  <AssignedHrSelect
                    id="edit-assignedHr"
                    value={assignedHrId}
                    onValueChange={setAssignedHrId}
                    allowUnassigned
                    currentAssignee={interview.assignedHr}
                    enabled={canAssign}
                    disabled={submitting}
                  />
                </DemoWriteGuard>
              </FormField>
            ) : null}

            <Inline gap={2} wrap="wrap">
              <DemoWriteGuard disabled={submitting || !canSave}>
                <Button
                  type="button"
                  variant="gradient"
                  disabled={submitting || !canSave}
                  onClick={() => void handleSave()}
                >
                  {submitting ? tActions('saving') : tActions('saveChanges')}
                </Button>
              </DemoWriteGuard>
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
      ) : (
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

                {canAssign ? (
                  <FormField htmlFor="edit-assignedHr" label={tPicker('assignedHrLabel')}>
                    <DemoWriteGuard width="full" disabled={submitting}>
                      <AssignedHrSelect
                        id="edit-assignedHr"
                        value={assignedHrId}
                        onValueChange={setAssignedHrId}
                        allowUnassigned
                        currentAssignee={interview.assignedHr}
                        enabled={canAssign}
                        disabled={submitting}
                      />
                    </DemoWriteGuard>
                  </FormField>
                ) : null}

                <Inline gap={2} wrap="wrap">
                  <DemoWriteGuard disabled={submitting || !canSave}>
                    <Button
                      type="button"
                      variant="gradient"
                      disabled={submitting || !canSave}
                      onClick={() => void handleSave()}
                    >
                      {submitting ? tActions('saving') : tActions('saveChanges')}
                    </Button>
                  </DemoWriteGuard>
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
      )}

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
