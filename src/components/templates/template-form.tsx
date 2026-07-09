'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  InterviewQuestionPickerAside,
  InterviewQuestionPickerMain,
} from '@/components/questions/picker/interview-question-picker-section'
import { useInterviewQuestionPicker } from '@/components/questions/picker/use-interview-question-picker'
import { templatesListQueryKey } from '@/components/templates/query-keys'
import {
  useCreateTemplate,
  useUpdateTemplate,
} from '@/components/templates/use-template-mutations'
import { FormField } from '@/components/ui/form-field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { getTemplates, type Question, type Template } from '@/lib/api'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { useLocale, useTranslations } from 'next-intl'

type TemplateFormProps = {
  initialPrefetch: QuestionsLibraryPrefetch
  // Editing an existing template.
  template?: Template
  // Prefill for a new template (e.g. save-as-template); ignored when `template` is set.
  initialName?: string
  initialPosition?: string
  initialQuestions?: Question[]
}

export function TemplateForm({
  initialPrefetch,
  template,
  initialName,
  initialPosition,
  initialQuestions,
}: TemplateFormProps) {
  const t = useTranslations('templates')
  const tGate = useTranslations('toast.pageGate.templates')
  const locale = useLocale()
  const router = useRouter()
  const isEdit = Boolean(template)
  // On edit, a template whose stored questions have all been deleted resolves to
  // an empty set; warn explicitly instead of only blocking submit with a generic error.
  const templateQuestionsUnavailable =
    isEdit && (template?.questions?.length ?? 0) === 0

  const [name, setName] = useState(template?.name ?? initialName ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [position, setPosition] = useState(template?.position ?? initialPosition ?? '')
  const [error, setError] = useState<string | null>(null)

  const picker = useInterviewQuestionPicker({
    initialSelected: template?.questions ?? initialQuestions ?? [],
    initialPrefetch,
    serverHydrated: true,
  })
  const { selectedCount, selectedById } = picker

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const submitting = createTemplate.isPending || updateTemplate.isPending

  // Existing positions power the datalist so authors reuse a section instead of retyping it.
  const { data: templates = [] } = useQuery({
    queryKey: templatesListQueryKey(locale),
    queryFn: getTemplates,
  })
  const positionOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const existing of templates) {
      const value = existing.position?.trim()
      if (value) seen.add(value)
    }
    if (template?.position?.trim()) seen.add(template.position.trim())
    return Array.from(seen).sort((a, b) => a.localeCompare(b))
  }, [templates, template])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError(tGate('nameRequired'))
      return
    }
    if (selectedCount === 0) {
      setError(tGate('questionsRequired'))
      return
    }

    const value = {
      name: name.trim(),
      description: description.trim() || undefined,
      position: position.trim() || undefined,
      questionIds: Array.from(selectedById.keys()),
    }

    const onSuccess = () => router.push(routes.templates.list)
    if (template) {
      updateTemplate.mutate({ id: template.id, value }, { onSuccess })
    } else {
      createTemplate.mutate(value, { onSuccess })
    }
  }

  return (
    <>
      {templateQuestionsUnavailable ? (
        <Alert variant="warning">
          <AlertTitle>{t('form.questionsUnavailableTitle')}</AlertTitle>
          <AlertDescription>
            {t('form.questionsUnavailableDescription')}
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger">
          <AlertTitle>
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Grid columns="aside-22-left" gap={6}>
          <Stack gap={4}>
            <Card variant="surface">
              <CardHeader spacing="xs">
                <CardTitle size="lg">
                  {isEdit ? t('form.editTitle') : t('form.createTitle')}
                </CardTitle>
                <CardDescription>{t('description')}</CardDescription>
              </CardHeader>
              <CardContent spacing="lg">
                <FormField htmlFor="templateName" label={t('form.nameLabel')}>
                  <Input
                    id="templateName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t('form.namePlaceholder')}
                    disabled={submitting}
                  />
                </FormField>

                <FormField htmlFor="templateDescription" label={t('form.descriptionLabel')}>
                  <Textarea
                    id="templateDescription"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={t('form.descriptionPlaceholder')}
                    disabled={submitting}
                  />
                </FormField>

                <FormField htmlFor="templatePosition" label={t('form.positionLabel')}>
                  <Input
                    id="templatePosition"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    placeholder={t('form.positionPlaceholder')}
                    disabled={submitting}
                    list="template-position-options"
                    autoComplete="off"
                  />
                  <datalist id="template-position-options">
                    {positionOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </FormField>

                <Stack gap={2}>
                  <DemoWriteGuard width="full">
                    <Button
                      type="submit"
                      variant="gradient"
                      width="full"
                      disabled={submitting || selectedCount === 0 || !name.trim()}
                    >
                      {submitting
                        ? tGate('savingLabel')
                        : isEdit
                          ? t('form.saveButton')
                          : t('form.createButton')}
                    </Button>
                  </DemoWriteGuard>
                  <Button
                    type="button"
                    variant="outline"
                    width="full"
                    disabled={submitting}
                    onClick={() => router.push(routes.templates.list)}
                  >
                    {t('form.cancelButton')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <InterviewQuestionPickerAside picker={picker} />
          </Stack>

          <InterviewQuestionPickerMain
            picker={picker}
            title={t('form.questionsTitle')}
            description={t('form.questionsDescription')}
            disabled={submitting}
          />
        </Grid>
      </form>
    </>
  )
}
