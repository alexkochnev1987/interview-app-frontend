'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from '@/i18n/navigation'
import { LOCALES, type Locale } from '@/i18n/locales'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { useIsDemo } from '@/lib/auth-context'
import { createInterview, type Question } from '@/lib/api'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

type InterviewCreateFormProps = {
  initialPrefetch: QuestionsLibraryPrefetch
}

function questionSupportsInterviewLocale(question: Question, locale: Locale): boolean {
  const translatedQuestionText = question.translations?.[locale]?.questionText?.trim()
  if (translatedQuestionText) {
    return true
  }

  const available = question.availableLocales
  if (!available || available.length === 0) return false
  return available.includes(locale)
}

export function InterviewCreateForm({ initialPrefetch }: InterviewCreateFormProps) {
  const t = useTranslations('questions.common')
  const uiLocale = useLocale() as Locale
  const router = useRouter()
  const toastMessages = useToastMessages()
  const isDemo = useIsDemo()
  const [candidateName, setCandidateName] = useState('')
  const [position, setPosition] = useState('')
  const [interviewLocale, setInterviewLocale] = useState<Locale>(uiLocale)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const picker = useInterviewQuestionPicker({
    initialPrefetch,
    serverHydrated: true,
  })
  const { selectedCount, selectedById } = picker

  const questionsMissingInterviewLocale = useMemo(
    () =>
      Array.from(selectedById.values()).filter(
        (question) => !questionSupportsInterviewLocale(question, interviewLocale),
      ),
    [selectedById, interviewLocale],
  )

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
            interviewLocale,
            questionIds: Array.from(selectedById.keys()),
          }),
        {
          successMessage: toastMessages.interview.createSuccess,
          errorMessage: toastMessages.interview.createError,
          getErrorMessage: (error) =>
            toastMessages.apiError.message(error) ?? toastMessages.interview.createError,
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
                      disabled={submitting || isDemo}
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
                      disabled={submitting || isDemo}
                    />
                  </IconAffix>
                </FormField>

                <FormField htmlFor="interviewLocale" label={t('interviewLocaleLabel')}>
                  <Select
                    value={interviewLocale}
                    onValueChange={(value) => setInterviewLocale(value as Locale)}
                    disabled={submitting || isDemo}
                  >
                    <SelectTrigger
                      id="interviewLocale"
                      variant="surface"
                      size="md"
                      shape="rounded"
                      width="full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCALES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {t('interviewLocaleOption', { locale: code.toUpperCase() })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                {questionsMissingInterviewLocale.length > 0 ? (
                  <Alert variant="warning">
                    <AlertTitle>
                      {t('missingTranslationWarningTitle', {
                        count: questionsMissingInterviewLocale.length,
                      })}
                    </AlertTitle>
                    <AlertDescription>
                      {t('missingTranslationWarningDescription', {
                        locale: interviewLocale.toUpperCase(),
                        count: questionsMissingInterviewLocale.length,
                      })}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <DemoWriteGuard width="full" disabled={submitting || selectedCount === 0}>
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
                </DemoWriteGuard>
              </CardContent>
            </Card>

            <InterviewQuestionPickerAside picker={picker} />
          </Stack>

          <InterviewQuestionPickerMain
            picker={picker}
            title={t('selectionTitle')}
            description={t('selectionDescription')}
            disabled={submitting || isDemo}
          />
        </Grid>
      </form>
    </>
  )
}
