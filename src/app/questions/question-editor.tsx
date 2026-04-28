'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { QuestionEditorAiDiffCard } from '@/components/questions/editor/question-editor-ai-diff-card'
import { QuestionEditorForm } from '@/components/questions/editor/question-editor-form'
import { QuestionEditorHeroCard } from '@/components/questions/editor/question-editor-hero-card'
import { QuestionEditorSimilarPanel } from '@/components/questions/editor/question-editor-similar-panel'
import { QuestionEditorMainGrid } from '@/components/layout/grid-layouts'
import { PageMainEditor } from '@/components/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  draftQuestion,
  findSimilarQuestions,
  type QuestionDraft,
  type QuestionInput,
  type SimilarQuestionMatch,
} from '@/lib/api'
import {
  areEqual,
  formatExpectedConcepts,
  formatMetadata,
  formatRedFlags,
  getDefaultQuestionInput,
  joinStringList,
  normalizeComparable,
  normalizeInitialValue,
  parseExpectedConcepts,
  parseMetadata,
  parseRedFlags,
  tokenize,
} from '@/features/questions/editor'

type AiStatus = 'idle' | 'loading' | 'error'
type SimilarStatus = 'idle' | 'loading' | 'success' | 'error'
type DraftFieldKey = keyof QuestionInput

interface QuestionEditorProps {
  questionId?: string
  title: string
  initialValue?: QuestionInput
  submitLabel: string
  onSubmit: (value: QuestionInput) => Promise<void>
}

const DEFAULT_VALUE: QuestionInput = getDefaultQuestionInput()

const DRAFT_FIELDS: Array<{ key: DraftFieldKey; label: string }> = [
  { key: 'questionText', label: 'Question Text' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'weight', label: 'Weight' },
  { key: 'followUpQuestions', label: 'Follow-up Questions' },
  { key: 'expectedConcepts', label: 'Expected Concepts' },
  { key: 'redFlags', label: 'Red Flags' },
  { key: 'sampleGoodAnswer', label: 'Sample Good Answer' },
  { key: 'minimumPassScore', label: 'Minimum Pass Score' },
  { key: 'tags', label: 'Tags' },
]


export function QuestionEditor({
  questionId,
  title,
  initialValue,
  submitLabel,
  onSubmit,
}: QuestionEditorProps) {
  const [value, setValue] = useState<QuestionInput>(normalizeInitialValue(initialValue))
  const [metadataText, setMetadataText] = useState(formatMetadata(initialValue?.metadata ?? {}))
  const [submitting, setSubmitting] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiDraft, setAiDraft] = useState<QuestionDraft | null>(null)
  const [dismissedDraftFields, setDismissedDraftFields] = useState<DraftFieldKey[]>([])
  const [similarStatus, setSimilarStatus] = useState<SimilarStatus>('idle')
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestionMatch[]>([])
  const [similarError, setSimilarError] = useState<string | null>(null)
  const [lastSimilaritySignature, setLastSimilaritySignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      setAiStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to generate question draft.')
    }
  }

  function applyDraftField(field: DraftFieldKey) {
    if (!aiDraft) {
      return
    }

    update({ [field]: aiDraft[field] } as Partial<QuestionInput>)
    setDismissedDraftFields((current) => current.filter((item) => item !== field))
  }

  function keepCurrentField(field: DraftFieldKey) {
    setDismissedDraftFields((current) =>
      current.includes(field) ? current : [...current, field]
    )
  }

  function applyAllAiFields() {
    if (!aiDraft) {
      return
    }

    setValue((current) => ({
      ...current,
      ...aiDraft,
      externalId: current.externalId,
      role: current.role,
      focus: current.focus,
      outputLanguage: current.outputLanguage,
    }))
    setDismissedDraftFields([])
  }

  const pendingDraftFields = useMemo(() => {
    if (!aiDraft) {
      return []
    }

    return DRAFT_FIELDS.filter(
      ({ key }) => !dismissedDraftFields.includes(key) && !areEqual(value[key], aiDraft[key])
    )
  }, [aiDraft, dismissedDraftFields, value])

  const similaritySignalSummary = useMemo(() => {
    const textTokens = tokenize(value.questionText)
    return {
      conceptCount: value.expectedConcepts.filter((item) => item.label || item.id).length,
      tagCount: value.tags.filter((item) => item.trim()).length,
      taxonomyCount: [value.category, value.subcategory, value.role, value.focus].filter((item) =>
        item?.trim()
      ).length,
      textTokenCount: textTokens.length,
    }
  }, [
    value.category,
    value.expectedConcepts,
    value.focus,
    value.questionText,
    value.role,
    value.subcategory,
    value.tags,
  ])

  const hasSimilarityInput =
    similaritySignalSummary.textTokenCount > 0 ||
    similaritySignalSummary.tagCount > 0 ||
    similaritySignalSummary.conceptCount > 0 ||
    similaritySignalSummary.taxonomyCount > 0

  const similaritySignature = useMemo(
    () =>
      JSON.stringify({
        category: normalizeComparable(value.category),
        concepts: value.expectedConcepts.map((item) => ({
          description: normalizeComparable(item.description),
          id: normalizeComparable(item.id),
          label: normalizeComparable(item.label),
        })),
        difficulty: value.difficulty,
        focus: normalizeComparable(value.focus),
        questionText: normalizeComparable(value.questionText),
        role: normalizeComparable(value.role),
        subcategory: normalizeComparable(value.subcategory),
        tags: value.tags.map((item) => normalizeComparable(item)).filter(Boolean),
      }),
    [
      value.category,
      value.difficulty,
      value.expectedConcepts,
      value.focus,
      value.questionText,
      value.role,
      value.subcategory,
      value.tags,
    ]
  )

  const similarResultsStale =
    lastSimilaritySignature !== null && lastSimilaritySignature !== similaritySignature

  async function handleFindSimilar() {
    if (!hasSimilarityInput) {
      setSimilarStatus('error')
      setSimilarError('Add prompt text, taxonomy, tags, or rubric concepts before searching.')
      return
    }

    setSimilarError(null)
    setSimilarStatus('loading')
    setLastSimilaritySignature(similaritySignature)

    try {
      const matches = await findSimilarQuestions(value, questionId)
      setSimilarQuestions(matches)
      setSimilarStatus('success')
    } catch (err) {
      setSimilarStatus('error')
      setSimilarError(err instanceof Error ? err.message : 'Failed to load similar questions.')
    }
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
      await onSubmit(payload)
      setSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question.')
      setSubmitting(false)
    }
  }

  return (
    <PageMainEditor>
      <QuestionEditorHeroCard
        title={title}
        difficulty={value.difficulty}
        weight={value.weight}
        pendingDraftFieldsCount={pendingDraftFields.length}
        submitting={submitting}
        aiLoading={aiStatus === 'loading'}
        onGenerate={handleGenerate}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Question editor issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <QuestionEditorAiDiffCard
        aiDraft={aiDraft}
        pendingDraftFields={pendingDraftFields}
        onApplyAll={applyAllAiFields}
        onApplyField={applyDraftField}
        onKeepField={keepCurrentField}
        value={value}
      />

      <QuestionEditorMainGrid>
        <QuestionEditorForm
          value={value}
          metadataText={metadataText}
          setMetadataText={setMetadataText}
          submitting={submitting}
          submitLabel={submitLabel}
          onUpdate={update}
          onSubmit={handleSubmit}
        />

        <aside className="space-y-6">
          <QuestionEditorSimilarPanel
            summary={similaritySignalSummary}
            similarResultsStale={similarResultsStale}
            questionId={questionId}
            handleFindSimilar={handleFindSimilar}
            submitting={submitting}
            similarStatus={similarStatus}
            hasSimilarityInput={hasSimilarityInput}
            similarError={similarError}
            similarQuestions={similarQuestions}
          />
        </aside>
      </QuestionEditorMainGrid>
    </PageMainEditor>
  )
}
