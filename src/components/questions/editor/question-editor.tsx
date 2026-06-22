'use client'
import { useState, type FormEvent } from 'react'
import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { TwoColumnLayout } from '@/components/ui/layout/two-column-layout'
import { AiAgreesPill } from '@/components/questions/editor/ai-agrees-pill'
import { AiDraftPanel } from '@/components/questions/editor/ai-draft-panel'
import { AiSuggestionRow } from '@/components/questions/editor/ai-suggestion-row'
import { EditorIdentitySection } from '@/components/questions/editor/editor-identity-section'
import { EditorPromptSection } from '@/components/questions/editor/editor-prompt-section'
import { EditorReferenceSection } from '@/components/questions/editor/editor-reference-section'
import { EditorRubricSection } from '@/components/questions/editor/editor-rubric-section'
import { QuestionEditorHeader } from '@/components/questions/editor/question-editor-header'
import { QuestionEditorSaveBar } from '@/components/questions/editor/question-editor-save-bar'
import { SimilarityPanel } from '@/components/questions/editor/similarity-panel'
import { useDirtyTracking } from '@/components/questions/editor/use-dirty-tracking'
import { useSimilaritySearch } from '@/components/questions/editor/use-similarity-search'
import {
  type QuestionDraft,
  type QuestionInput,
} from '@/lib/api'
import { clearFieldError, type FieldErrors } from '@/lib/clear-field-error'
import { validateQuestionForm } from '@/lib/question-editor/validate-question-form'
import { validateEnglishOnly } from '@/lib/question-editor/english-check-fields'
import {
  areEqual,
  formatMetadata,
  normalizeInitialValue,
} from '@/lib/question-editor/parsers'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { useDraftQuestion } from '@/components/questions/use-question-mutations'

type QuestionFormField = 'questionText' | 'metadata'

export type QuestionSubmitCallbacks = {
  /** Save errors are surfaced by question mutation hooks (toast), not this callback. */
  onSuccess: (persisted: QuestionInput) => void
}

interface QuestionEditorProps {
  questionId?: string
  title: string
  initialValue?: QuestionInput
  submitLabel: string
  onSubmit: (value: QuestionInput, callbacks: QuestionSubmitCallbacks) => void
  submitting?: boolean
  readOnly?: boolean
}

export function QuestionEditor({
  questionId,
  title,
  initialValue,
  submitLabel,
  onSubmit,
  readOnly = false,
  submitting = false,
}: QuestionEditorProps) {
  const editorLabels = useQuestionEditorLabels()
  const [value, setValue] = useState<QuestionInput>(normalizeInitialValue(initialValue))
  const [metadataText, setMetadataText] = useState(
    formatMetadata(initialValue?.metadata ?? {}),
  )
  const [aiDraft, setAiDraft] = useState<QuestionDraft | null>(null)
  const [dismissedDraftFields, setDismissedDraftFields] = useState<DraftFieldKey[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<QuestionFormField>>({})
  const [englishOnlyError, setEnglishOnlyError] = useState<string | null>(null)
  const fieldsDisabled = submitting || readOnly

  const { dirtyFieldKeys, isDirty, markSaved } = useDirtyTracking({
    value,
    metadataText,
    initialValue,
  })

  const similarity = useSimilaritySearch({ value, questionId })
  const draft = useDraftQuestion()

  function update(patch: Partial<QuestionInput>) {
    if (readOnly) return
    if ('questionText' in patch) {
      clearFieldError('questionText', setFieldErrors)
    }
    setEnglishOnlyError(null)
    setValue((current) => ({ ...current, ...patch }))
    if (aiDraft) {
      const dismissKeys = (Object.keys(patch) as DraftFieldKey[]).filter(
        (key) => !areEqual(patch[key], aiDraft[key]),
      )
      if (dismissKeys.length > 0) {
        setDismissedDraftFields((current) => {
          const additions = dismissKeys.filter((k) => !current.includes(k))
          return additions.length === 0 ? current : [...current, ...additions]
        })
      }
    }
  }

  function handleMetadataTextChange(next: string) {
    clearFieldError('metadata', setFieldErrors)
    setEnglishOnlyError(null)
    setMetadataText(next)
  }

  function handleGenerate() {
    if (readOnly) return
    if (!value.questionText.trim()) {
      draft.reset()
      setFieldErrors(prev=>({
        ...prev,
        questionText: editorLabels.validation.questionTextRequiredForAi
      }))
      return
    }

    const nonEnglishFieldForGeneration = validateEnglishOnly(value, editorLabels)
    if (nonEnglishFieldForGeneration) {
      draft.reset()
      setEnglishOnlyError(
          editorLabels.validation.englishOnlyField({ field: nonEnglishFieldForGeneration }),
      )
      setFieldErrors((prev) => ({
        ...prev,
        questionText:
            nonEnglishFieldForGeneration === editorLabels.fieldLabel('questionText')
                ? editorLabels.validation.questionTextEnglishOnlyForAi
                : prev.questionText,
      }))
      return
    }

    clearFieldError('questionText', setFieldErrors)
    setEnglishOnlyError(null)

    draft.reset()
    draft.mutate(value, {
      onSuccess: draft=>{
        setAiDraft(draft)
        setDismissedDraftFields([])
      },
      onError:()=>{
        setAiDraft(null)
        setDismissedDraftFields([])
      }
    })

  }

  function applyDraftField(field: DraftFieldKey) {
    if (!aiDraft || readOnly) return
    update({ [field]: aiDraft[field] } as Partial<QuestionInput>)
  }

  function keepCurrentField(field: DraftFieldKey) {
    setDismissedDraftFields((current) =>
      current.includes(field) ? current : [...current, field],
    )
  }

  function applyAllAiFields() {
    if (!aiDraft || pendingDraftFields.length === 0 || readOnly) return
    setValue((current) => {
      let next = current
      for (const { key } of pendingDraftFields) {
        next = { ...next, [key]: aiDraft[key] }
      }
      return next
    })
  }

  const pendingDraftFields = !aiDraft
    ? []
    : editorLabels.draftFields.filter(
        ({ key }) =>
          !dismissedDraftFields.includes(key) &&
          aiDraft[key] !== undefined &&
          !areEqual(value[key], aiDraft[key]),
      )

  function renderAiSuggestion(field: DraftFieldKey) {
    if (readOnly || !aiDraft) return null
    if (pendingDraftFields.some((p) => p.key === field)) {
      return (
        <AiSuggestionRow
          value={aiDraft[field]}
          onApply={() => applyDraftField(field)}
          onKeep={() => keepCurrentField(field)}
        />
      )
    }
    if (areEqual(value[field], aiDraft[field])) {
      return <AiAgreesPill />
    }
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (readOnly) return

    const { errors, metadata } = validateQuestionForm(
      {
        questionText: value.questionText,
        metadataText,
      },
      editorLabels.validation,
    )

    const nonEnglishField = validateEnglishOnly(value, editorLabels)
    if (nonEnglishField) {
      setEnglishOnlyError(
        editorLabels.validation.englishOnlyField({ field: nonEnglishField }),
      )
      return
    }

    if (Object.keys(errors).length > 0) {
      setEnglishOnlyError(null)
      setFieldErrors(errors)
      return
    }

    if (!metadata) {
      return
    }

    const payload: QuestionInput = {
      externalId: value.externalId?.trim() || undefined,
      role: value.role?.trim() || undefined,
      focus: value.focus?.trim() || undefined,
      outputLanguage: value.outputLanguage?.trim() || 'English',
      category: value.category?.trim() || undefined,
      subcategory: value.subcategory?.trim() || undefined,
      questionText: value.questionText.trim(),
      followUpQuestions: (value.followUpQuestions || []).map((item) => item.trim()).filter(Boolean),
      expectedConcepts: value.expectedConcepts,
      redFlags: value.redFlags,
      difficulty: value.difficulty,
      weight: Math.max(0.1, Number(value.weight) || 1),
      sampleGoodAnswer: value.sampleGoodAnswer?.trim() || undefined,
      minimumPassScore: Math.max(0, Math.min(5, Number(value.minimumPassScore) || 0)),
      tags: (value.tags || []).map((item) => item.trim()).filter(Boolean),
      metadata,
    }

    setFieldErrors({})
    setEnglishOnlyError(null)

    onSubmit(payload, {
      onSuccess: (persisted) => {
        const normalized = normalizeInitialValue(persisted)
        const normalizedMetadataText = formatMetadata(normalized.metadata ?? {})
        setValue(normalized)
        setMetadataText(normalizedMetadataText)
        markSaved(normalized, normalizedMetadataText)
      },
    })
  }

  return (
    <PageShell spacing="tight">
      <QuestionEditorHeader
        title={title}
        difficulty={value.difficulty}
        weight={value.weight || 1}
        pendingDraftCount={readOnly ? 0 : pendingDraftFields.length}
      />

      <TwoColumnLayout
        main={(
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Alert>
                <AlertTitle>{editorLabels.authoringNotice.title}</AlertTitle>
                <AlertDescription>{editorLabels.authoringNotice.description}</AlertDescription>
              </Alert>
              {englishOnlyError ? (
                <Alert variant="warning">
                  <AlertTitle>{editorLabels.validation.englishOnlyTitle}</AlertTitle>
                  <AlertDescription>{englishOnlyError}</AlertDescription>
                </Alert>
              ) : null}
              <EditorPromptSection
                value={value}
                submitting={fieldsDisabled}
                onUpdate={update}
                renderAiSuggestion={renderAiSuggestion}
                questionTextError={fieldErrors.questionText}
              />
              <EditorIdentitySection
                value={value}
                submitting={fieldsDisabled}
                onUpdate={update}
                renderAiSuggestion={renderAiSuggestion}
              />
              <EditorRubricSection
                value={value}
                submitting={fieldsDisabled}
                onUpdate={update}
                renderAiSuggestion={renderAiSuggestion}
              />
              <EditorReferenceSection
                value={value}
                metadataText={metadataText}
                submitting={fieldsDisabled}
                onUpdate={update}
                onMetadataTextChange={
                  readOnly ? () => {} : handleMetadataTextChange
                }
                renderAiSuggestion={renderAiSuggestion}
                metadataError={fieldErrors.metadata}
              />
              {!readOnly ? (
                <QuestionEditorSaveBar
                  isDirty={isDirty}
                  dirtyFieldLabels={dirtyFieldKeys.map((key) =>
                    editorLabels.fieldLabel(key),
                  )}
                  submitting={submitting}
                  submitLabel={submitLabel}
                />
              ) : null}
            </Stack>
          </form>
        )}
        aside={(
          <>
            {!readOnly ? (
              <AiDraftPanel
                hasPendingDraft={Boolean(aiDraft) && pendingDraftFields.length > 0}
                pendingCount={pendingDraftFields.length}
                loading={draft.status === 'loading'}
                disabled={fieldsDisabled}
                error={draft.error ?? undefined}
                onGenerate={handleGenerate}
                onApplyAll={applyAllAiFields}
              />
            ) : null}
            <SimilarityPanel
              status={similarity.status}
              matches={similarity.matches}
              error={similarity.error}
              signalSummary={similarity.signalSummary}
              canSearch={similarity.canSearch}
              resultsStale={similarity.resultsStale}
              isEditMode={Boolean(questionId)}
              disabled={fieldsDisabled}
              onRunSearch={similarity.runManualSearch}
            />
          </>
        )}
      />
    </PageShell>
  )
}
