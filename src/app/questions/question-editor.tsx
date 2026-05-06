'use client'

import { useState, type FormEvent } from 'react'

import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { TwoColumnLayout } from '@/components/ui/layout/two-column-layout'
import { AiDraftPanel } from '@/components/questions/editor/ai-draft-panel'
import { AiSuggestionRow } from '@/components/questions/editor/ai-suggestion-row'
import { EditorIdentitySection } from '@/components/questions/editor/editor-identity-section'
import { EditorPromptSection } from '@/components/questions/editor/editor-prompt-section'
import { EditorReferenceSection } from '@/components/questions/editor/editor-reference-section'
import { EditorRubricSection } from '@/components/questions/editor/editor-rubric-section'
import { QuestionEditorHeader } from '@/components/questions/editor/question-editor-header'
import { QuestionEditorSaveBar } from '@/components/questions/editor/question-editor-save-bar'
import { SimilarityPanel } from '@/components/questions/editor/similarity-panel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  draftQuestion,
  type QuestionDraft,
  type QuestionInput,
} from '@/lib/api'
import {
  DRAFT_FIELDS,
  areEqual,
  formatMetadata,
  normalizeInitialValue,
  parseMetadata,
  type DraftFieldKey,
} from '@/lib/question-editor/parsers'
import { FEEDBACK_POLICY } from '@/lib/feedback-policy'
import { runMutation } from '@/lib/run-mutation'
import { TOAST_MESSAGES } from '@/lib/toast-messages'
import { useDirtyTracking } from './use-dirty-tracking'
import { useSimilaritySearch } from './use-similarity-search'

type AiStatus = 'idle' | 'loading' | 'error'

interface QuestionEditorProps {
  questionId?: string
  title: string
  initialValue?: QuestionInput
  submitLabel: string
  onSubmit: (value: QuestionInput) => Promise<QuestionInput>
  saveToastOptions?: {
    enabled?: boolean
    successMessage?: string
    errorMessage?: string
  }
}

export function QuestionEditor({
  questionId,
  title,
  initialValue,
  submitLabel,
  onSubmit,
  saveToastOptions,
}: QuestionEditorProps) {
  const [value, setValue] = useState<QuestionInput>(normalizeInitialValue(initialValue))
  const [metadataText, setMetadataText] = useState(
    formatMetadata(initialValue?.metadata ?? {}),
  )
  const [submitting, setSubmitting] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiDraft, setAiDraft] = useState<QuestionDraft | null>(null)
  const [dismissedDraftFields, setDismissedDraftFields] = useState<DraftFieldKey[]>([])
  const [error, setError] = useState<string | null>(null)

  const { dirtyFields, isDirty, markSaved } = useDirtyTracking({
    value,
    metadataText,
    initialValue,
  })

  const similarity = useSimilaritySearch({ value, questionId })

  function update(patch: Partial<QuestionInput>) {
    setValue((current) => ({ ...current, ...patch }))
  }

  async function handleGenerate() {
    if (!value.questionText.trim()) {
      setError('Question text is required before AI generation.')
      return
    }

    setError(null)
    setAiStatus('loading')

    try {
      const draft = await draftQuestion(value)
      setAiDraft(draft)
      setDismissedDraftFields([])
      setAiStatus('idle')
    } catch (err) {
      setAiDraft(null)
      setDismissedDraftFields([])
      setAiStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : FEEDBACK_POLICY.draftQuestion.inlineErrorFallback,
      )
    }
  }

  function applyDraftField(field: DraftFieldKey) {
    if (!aiDraft) return
    update({ [field]: aiDraft[field] } as Partial<QuestionInput>)
    setDismissedDraftFields((current) => current.filter((item) => item !== field))
  }

  function keepCurrentField(field: DraftFieldKey) {
    setDismissedDraftFields((current) =>
      current.includes(field) ? current : [...current, field],
    )
  }

  function applyAllAiFields() {
    if (!aiDraft || pendingDraftFields.length === 0) return
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
    : DRAFT_FIELDS.filter(
        ({ key }) =>
          !dismissedDraftFields.includes(key) && !areEqual(value[key], aiDraft[key]),
      )

  function renderAiSuggestion(field: DraftFieldKey) {
    if (!aiDraft || !pendingDraftFields.some((p) => p.key === field)) return null
    return (
      <AiSuggestionRow
        value={aiDraft[field]}
        onApply={() => applyDraftField(field)}
        onKeep={() => keepCurrentField(field)}
      />
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    let metadata: Record<string, unknown>
    try {
      metadata = parseMetadata(metadataText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid metadata JSON.')
      return
    }

    const payload: QuestionInput = {
      externalId: value.externalId?.trim() || undefined,
      role: value.role?.trim() || undefined,
      focus: value.focus?.trim() || undefined,
      outputLanguage: value.outputLanguage.trim() || 'English',
      category: value.category?.trim() || undefined,
      subcategory: value.subcategory?.trim() || undefined,
      questionText: value.questionText.trim(),
      followUpQuestions: value.followUpQuestions.map((item) => item.trim()).filter(Boolean),
      expectedConcepts: value.expectedConcepts,
      redFlags: value.redFlags,
      difficulty: value.difficulty,
      weight: Math.max(0.1, Number(value.weight) || 1),
      sampleGoodAnswer: value.sampleGoodAnswer?.trim() || undefined,
      minimumPassScore: Math.max(0, Math.min(5, Number(value.minimumPassScore) || 0)),
      tags: value.tags.map((item) => item.trim()).filter(Boolean),
      metadata,
    }

    if (!payload.questionText) {
      setError('Question text is required.')
      return
    }

    setSubmitting(true)

    try {
      const persisted = normalizeInitialValue(
        await runMutation(() => onSubmit(payload), {
          showSuccessToast: saveToastOptions?.enabled ?? true,
          successMessage: saveToastOptions?.successMessage ?? TOAST_MESSAGES.question.saveSuccess,
          errorMessage: saveToastOptions?.errorMessage ?? TOAST_MESSAGES.question.saveError,
        }),
      )
      const normalizedMetadataText = formatMetadata(persisted.metadata)
      setValue(persisted)
      setMetadataText(normalizedMetadataText)
      markSaved(persisted, normalizedMetadataText)
    } catch {
      return
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell spacing="tight">
      <QuestionEditorHeader
        title={title}
        difficulty={value.difficulty}
        weight={value.weight}
        pendingDraftCount={pendingDraftFields.length}
      />

      {error ? (
        <Alert variant="danger">
          <AlertTitle>Question editor issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <TwoColumnLayout
        main={(
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
            <EditorPromptSection
              value={value}
              submitting={submitting}
              onUpdate={update}
              renderAiSuggestion={renderAiSuggestion}
            />
            <EditorIdentitySection
              value={value}
              submitting={submitting}
              onUpdate={update}
              renderAiSuggestion={renderAiSuggestion}
            />
            <EditorRubricSection
              value={value}
              submitting={submitting}
              onUpdate={update}
              renderAiSuggestion={renderAiSuggestion}
            />
            <EditorReferenceSection
              value={value}
              metadataText={metadataText}
              submitting={submitting}
              onUpdate={update}
              onMetadataTextChange={setMetadataText}
              renderAiSuggestion={renderAiSuggestion}
            />
            <QuestionEditorSaveBar
              isDirty={isDirty}
              dirtyFieldLabels={dirtyFields.map((f) => f.label)}
              submitting={submitting}
              submitLabel={submitLabel}
            />
            </Stack>
          </form>
        )}
        aside={(
          <>
            <AiDraftPanel
              hasPendingDraft={Boolean(aiDraft) && pendingDraftFields.length > 0}
              pendingCount={pendingDraftFields.length}
              loading={aiStatus === 'loading'}
              disabled={submitting}
              onGenerate={handleGenerate}
              onApplyAll={applyAllAiFields}
            />
            <SimilarityPanel
              status={similarity.status}
              matches={similarity.matches}
              error={similarity.error}
              signalSummary={similarity.signalSummary}
              hasInput={similarity.hasInput}
              resultsStale={similarity.resultsStale}
              isEditMode={Boolean(questionId)}
              disabled={submitting}
              onRunSearch={similarity.runManualSearch}
            />
          </>
        )}
      />
    </PageShell>
  )
}
