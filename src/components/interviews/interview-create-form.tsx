'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  InterviewQuestionPickerAside,
  InterviewQuestionPickerMain,
} from '@/components/questions/picker/interview-question-picker-section'
import { useInterviewQuestionPicker } from '@/components/questions/picker/use-interview-question-picker'
import { FormField } from '@/components/ui/form-field'
import { IconAffix } from '@/components/ui/icon-affix'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/navigation'
import { createInterview } from '@/lib/api'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

type InterviewCreateFormProps = {
  initialPrefetch: QuestionsLibraryPrefetch
}

export function InterviewCreateForm({ initialPrefetch }: InterviewCreateFormProps) {
  const t = useTranslations('questions.common')
  const router = useRouter()
  const toastMessages = useToastMessages()
  const [candidateName, setCandidateName] = useState('')
  const [position, setPosition] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const picker = useInterviewQuestionPicker({
    initialPrefetch,
    serverHydrated: true,
  })
  const { selectedCount, selectedById } = picker

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
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
      const interview = await runMutation(
        () =>
          createInterview({
            candidateName: candidateName.trim(),
            position: position.trim(),
            questionIds: Array.from(selectedById.keys()),
          }),
        {
          successMessage: toastMessages.interview.createSuccess,
          errorMessage: toastMessages.interview.createError,
        },
      )
      router.push(`/interviews/${interview.id}`)
    } catch {
      return
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

      <form onSubmit={handleSubmit}>
        <Grid columns="aside-22-left" gap={6}>
          <Stack gap={4}>
            <Card variant="surface">
              <CardHeader spacing="xs">
                <CardTitle size="lg">{t('candidateBriefTitle')}</CardTitle>
                <CardDescription>{t('candidateBriefDescription')}</CardDescription>
              </CardHeader>
              <CardContent spacing="lg">
                <FormField htmlFor="candidateName" label={t('candidateNameLabel')}>
                  <IconAffix icon={<Icon size="md"><UserRound /></Icon>}>
                    <Input
                      id="candidateName"
                      iconAffix="leading"
                      value={candidateName}
                      onChange={(event) => setCandidateName(event.target.value)}
                      placeholder={t('candidateNamePlaceholder')}
                      autoComplete="name"
                      disabled={submitting}
                    />
                  </IconAffix>
                </FormField>

                <FormField htmlFor="position" label={t('positionLabel')}>
                  <IconAffix icon={<Icon size="md"><BriefcaseBusiness /></Icon>}>
                    <Input
                      id="position"
                      iconAffix="leading"
                      value={position}
                      onChange={(event) => setPosition(event.target.value)}
                      placeholder={t('positionPlaceholder')}
                      disabled={submitting}
                    />
                  </IconAffix>
                </FormField>

                <Button
                  type="submit"
                  variant="gradient"
                  width="full"
                  disabled={submitting || selectedCount === 0}
                >
                  {submitting
                    ? toastMessages.pageGate.interview.creatingLabel
                    : t(
                        selectedCount > 0
                          ? 'createInterviewCtaWithCount'
                          : 'createInterviewCta',
                        { count: selectedCount },
                      )}
                  <Icon size="md">
                    <ArrowRight />
                  </Icon>
                </Button>
              </CardContent>
            </Card>

            <InterviewQuestionPickerAside picker={picker} />
          </Stack>

          <InterviewQuestionPickerMain
            picker={picker}
            title={t('selectionTitle')}
            description={t('selectionDescription')}
            disabled={submitting}
          />
        </Grid>
      </form>
    </>
  )
}
