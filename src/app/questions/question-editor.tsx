'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { BrainCircuit, Save, Search, Sparkles, WandSparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { QuestionEditorField } from '@/components/questions/question-editor-field'
import { QuestionEditorSectionIntro } from '@/components/questions/question-editor-section-intro'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  draftQuestion,
  findSimilarQuestions,
  type QuestionDraft,
  type QuestionDifficulty,
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
  type SimilarQuestionMatch,
} from '@/lib/api'
import { truncateText } from '@/lib/text'

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

const DEFAULT_VALUE: QuestionInput = {
  externalId: '',
  role: 'frontend intern',
  focus: 'fundamentals',
  outputLanguage: 'English',
  category: '',
  subcategory: '',
  questionText: '',
  followUpQuestions: [],
  expectedConcepts: [],
  redFlags: [],
  difficulty: 'medium',
  weight: 1,
  sampleGoodAnswer: '',
  minimumPassScore: 2.5,
  tags: [],
  metadata: {},
}

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

function normalizeComparable(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

function tokenize(value: string): string[] {
  const matches = value.toLowerCase().match(/[a-z0-9]+/g) ?? []

  return Array.from(new Set(matches.filter((item) => item.length > 2)))
}

function parseStringList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinStringList(items: string[]): string {
  return items.join('\n')
}

function formatExpectedConcepts(items: QuestionExpectedConcept[]): string {
  return items
    .map((item) =>
      [item.id, item.label, item.weight.toFixed(4), item.description].join(' | ')
    )
    .join('\n')
}

function parseExpectedConcepts(value: string): QuestionExpectedConcept[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, weight, ...descriptionParts] = line.split('|').map((part) => part.trim())
      const safeLabel = label || id || `concept_${index + 1}`
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      const numericWeight = Number(weight)
      return {
        id: safeId,
        label: safeLabel,
        weight: Number.isFinite(numericWeight) && numericWeight > 0 ? numericWeight : 1,
        description:
          descriptionParts.join(' | ') || `${safeLabel} should be covered in the answer.`,
      }
    })
}

function formatRedFlags(items: QuestionRedFlag[]): string {
  return items.map((item) => [item.id, item.label, item.severity].join(' | ')).join('\n')
}

function parseRedFlags(value: string): QuestionRedFlag[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, severity] = line.split('|').map((part) => part.trim())
      const safeLabel = label || id || `red_flag_${index + 1}`
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      return {
        id: safeId,
        label: safeLabel,
        severity:
          severity === 'low' || severity === 'medium' || severity === 'high' ? severity : 'medium',
      }
    })
}

function formatMetadata(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2)
}

function parseMetadata(value: string): Record<string, unknown> {
  if (!value.trim()) {
    return {}
  }

  const parsed = JSON.parse(value) as unknown
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Metadata must be a JSON object')
  }

  return parsed as Record<string, unknown>
}

function normalizeInitialValue(initialValue?: QuestionInput): QuestionInput {
  return {
    ...DEFAULT_VALUE,
    ...initialValue,
    externalId: initialValue?.externalId ?? '',
    role: initialValue?.role ?? DEFAULT_VALUE.role,
    focus: initialValue?.focus ?? DEFAULT_VALUE.focus,
    outputLanguage: initialValue?.outputLanguage ?? DEFAULT_VALUE.outputLanguage,
    category: initialValue?.category ?? '',
    subcategory: initialValue?.subcategory ?? '',
    sampleGoodAnswer: initialValue?.sampleGoodAnswer ?? '',
    metadata: initialValue?.metadata ?? {},
  }
}

function areEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function previewValue(value: unknown): string {
  if (typeof value === 'string') {
    return value || 'Empty'
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Empty'
    }
    return JSON.stringify(value, null, 2)
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return 'Empty'
}

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

  function renderAiSuggestion(field: DraftFieldKey) {
    if (!aiDraft || !pendingDraftFields.some((p) => p.key === field)) {
      return null
    }

    return (
      <div className="mt-3 rounded-[1.25rem] bg-[hsl(var(--primary-fixed)/0.55)] p-4 ring-1 ring-[hsl(var(--primary)/0.15)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
            AI suggestion
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => applyDraftField(field)}
              className="rounded-full bg-primary-gradient shadow-soft hover:brightness-105"
            >
              Use AI value
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => keepCurrentField(field)}
              className="rounded-full bg-white/80"
            >
              Keep current
            </Button>
          </div>
        </div>
        <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-foreground">
          {previewValue(aiDraft[field])}
        </pre>
      </div>
    )
  }

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
    <main className="container space-y-6 py-10 md:space-y-8 md:py-12">
      <Card className="border-white/65 bg-white/88 shadow-float">
        <CardContent className="flex flex-col gap-6 px-8 py-8">
          <div className="space-y-4">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Unified Question Editor
            </EyebrowBadge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Shape the prompt, define the rubric, and keep AI-generated draft suggestions
                visible as explicit diffs instead of invisible background mutations.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricPanel
              label="Difficulty"
              value={<StatusPill tone={value.difficulty}>{value.difficulty}</StatusPill>}
              unstyledValue
            />
            <MetricPanel label="Weight" value={value.weight} />
            <MetricPanel label="Pending AI diffs" value={pendingDraftFields.length} />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Question editor issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardContent className="space-y-6 px-8 py-8">
              <QuestionEditorSectionIntro
                title="Prompt and follow-up"
                description="Write the core question clearly, then capture the follow-up probes that interviewers should keep ready."
                icon={<Sparkles className="size-4" />}
              />

              <QuestionEditorField htmlFor="questionText" label="Question text">
                <Textarea
                  id="questionText"
                  value={value.questionText}
                  onChange={(event) => update({ questionText: event.target.value })}
                  placeholder="e.g. What is a closure in JavaScript?"
                  disabled={submitting}
                  className="min-h-[150px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 text-base leading-7"
                />
                {renderAiSuggestion('questionText')}
              </QuestionEditorField>

              <QuestionEditorField
                htmlFor="followUpQuestions"
                label="Follow-up questions"
                hint="Use one line per probe so the interviewer can keep cadence during the session."
              >
                <Textarea
                  id="followUpQuestions"
                  value={joinStringList(value.followUpQuestions)}
                  onChange={(event) =>
                    update({ followUpQuestions: parseStringList(event.target.value) })
                  }
                  placeholder="One question per line"
                  disabled={submitting}
                  className="min-h-[140px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
                />
                {renderAiSuggestion('followUpQuestions')}
              </QuestionEditorField>
            </CardContent>
          </Card>

          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardContent className="space-y-6 px-8 py-8">
              <QuestionEditorSectionIntro
                title="Question identity"
                description="Anchor the prompt in the role and taxonomy you expect recruiters to search later."
                icon={<BrainCircuit className="size-4" />}
              />

              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                <QuestionEditorField
                  htmlFor="externalId"
                  label="External ID"
                  hint="Optional stable identifier for imports."
                >
                  <Input
                    id="externalId"
                    value={value.externalId ?? ''}
                    onChange={(event) => update({ externalId: event.target.value })}
                    placeholder="frontend_closure_v1"
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                </QuestionEditorField>

                <QuestionEditorField htmlFor="role" label="Role">
                  <Input
                    id="role"
                    value={value.role ?? ''}
                    onChange={(event) => update({ role: event.target.value })}
                    placeholder="frontend intern"
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                </QuestionEditorField>

                <QuestionEditorField htmlFor="focus" label="Focus">
                  <Input
                    id="focus"
                    value={value.focus ?? ''}
                    onChange={(event) => update({ focus: event.target.value })}
                    placeholder="fundamentals"
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                </QuestionEditorField>

                <QuestionEditorField htmlFor="outputLanguage" label="Output language">
                  <Input
                    id="outputLanguage"
                    value={value.outputLanguage}
                    onChange={(event) => update({ outputLanguage: event.target.value })}
                    placeholder="English"
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                </QuestionEditorField>
              </div>

              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
                <QuestionEditorField htmlFor="category" label="Category">
                  <Input
                    id="category"
                    value={value.category ?? ''}
                    onChange={(event) => update({ category: event.target.value })}
                    placeholder="javascript"
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                  {renderAiSuggestion('category')}
                </QuestionEditorField>

                <QuestionEditorField htmlFor="subcategory" label="Subcategory">
                  <Input
                    id="subcategory"
                    value={value.subcategory ?? ''}
                    onChange={(event) => update({ subcategory: event.target.value })}
                    placeholder="closures"
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                  {renderAiSuggestion('subcategory')}
                </QuestionEditorField>

                <QuestionEditorField htmlFor="difficulty" label="Difficulty">
                  <Select
                    value={value.difficulty}
                    onValueChange={(next) => update({ difficulty: next as QuestionDifficulty })}
                    disabled={submitting}
                  >
                    <SelectTrigger className="h-11 w-full rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">easy</SelectItem>
                      <SelectItem value="medium">medium</SelectItem>
                      <SelectItem value="hard">hard</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderAiSuggestion('difficulty')}
                </QuestionEditorField>

                <QuestionEditorField htmlFor="weight" label="Weight">
                  <Input
                    id="weight"
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={value.weight}
                    onChange={(event) =>
                      update({ weight: Math.max(0.1, Number(event.target.value) || 1) })
                    }
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                  {renderAiSuggestion('weight')}
                </QuestionEditorField>

                <QuestionEditorField htmlFor="minimumPassScore" label="Minimum pass score">
                  <Input
                    id="minimumPassScore"
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={value.minimumPassScore}
                    onChange={(event) =>
                      update({
                        minimumPassScore: Math.max(
                          0,
                          Math.min(5, Number(event.target.value) || 0)
                        ),
                      })
                    }
                    disabled={submitting}
                    className="h-11 rounded-2xl border-white/70 bg-[hsl(var(--surface-low)/0.8)]"
                  />
                  {renderAiSuggestion('minimumPassScore')}
                </QuestionEditorField>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardContent className="space-y-6 px-8 py-8">
              <QuestionEditorSectionIntro
                title="Evaluation rubric"
                description="Define what a good answer must cover and which signals should reduce confidence."
                icon={<WandSparkles className="size-4" />}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <QuestionEditorField
                  htmlFor="expectedConcepts"
                  label="Expected concepts"
                  hint="Format: id | label | weight | description"
                >
                  <Textarea
                    id="expectedConcepts"
                    value={formatExpectedConcepts(value.expectedConcepts)}
                    onChange={(event) =>
                      update({ expectedConcepts: parseExpectedConcepts(event.target.value) })
                    }
                    placeholder="id | label | weight | description"
                    disabled={submitting}
                    className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
                  />
                  {renderAiSuggestion('expectedConcepts')}
                </QuestionEditorField>

                <QuestionEditorField
                  htmlFor="redFlags"
                  label="Red flags"
                  hint="Format: id | label | severity"
                >
                  <Textarea
                    id="redFlags"
                    value={formatRedFlags(value.redFlags)}
                    onChange={(event) => update({ redFlags: parseRedFlags(event.target.value) })}
                    placeholder="id | label | severity"
                    disabled={submitting}
                    className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
                  />
                  {renderAiSuggestion('redFlags')}
                </QuestionEditorField>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardContent className="space-y-6 px-8 py-8">
              <QuestionEditorSectionIntro
                title="Reference material"
                description="Store extra context for future reviewers, exports, and scoring experiments."
                icon={<Save className="size-4" />}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                <QuestionEditorField
                  htmlFor="sampleGoodAnswer"
                  label="Sample good answer"
                  hint="Target depth reference for evaluation."
                >
                  <Textarea
                    id="sampleGoodAnswer"
                    value={value.sampleGoodAnswer ?? ''}
                    onChange={(event) => update({ sampleGoodAnswer: event.target.value })}
                    placeholder="Target depth reference for evaluation"
                    disabled={submitting}
                    className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
                  />
                  {renderAiSuggestion('sampleGoodAnswer')}
                </QuestionEditorField>

                <div className="space-y-6">
                  <QuestionEditorField
                    htmlFor="tags"
                    label="Tags"
                    hint="Comma or newline separated tags used for filtering and imports."
                  >
                    <Textarea
                      id="tags"
                      value={joinStringList(value.tags)}
                      onChange={(event) => update({ tags: parseStringList(event.target.value) })}
                      placeholder="Comma or newline separated"
                      disabled={submitting}
                      className="min-h-[120px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
                    />
                    {renderAiSuggestion('tags')}
                  </QuestionEditorField>

                  <QuestionEditorField
                    htmlFor="metadata"
                    label="Additional metadata"
                    hint="Valid JSON object that can carry rubric or source information."
                  >
                    <Textarea
                      id="metadata"
                      value={metadataText}
                      onChange={(event) => setMetadataText(event.target.value)}
                      placeholder='{"rubricVersion":"v1"}'
                      disabled={submitting}
                      className="min-h-[180px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
                    />
                  </QuestionEditorField>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardContent className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                  Ready to save?
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Only values shown in the fields above will be persisted. Pending AI
                  suggestions are ignored until you apply them.
                </p>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 shrink-0 rounded-full bg-primary-gradient px-6 font-semibold shadow-soft hover:brightness-105"
              >
                <Save className="size-4" />
                {submitting ? 'Saving...' : submitLabel}
              </Button>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-6">
          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardHeader className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-2xl tracking-[-0.03em]">AI draft</CardTitle>
                  {aiDraft && pendingDraftFields.length > 0 ? (
                    <StatusPill tone="neutral">
                      {pendingDraftFields.length} pending
                    </StatusPill>
                  ) : null}
                </div>
                <CardDescription className="text-sm leading-6">
                  Let AI propose category, follow-up probes, expected concepts, red flags, and
                  tags based on your question text. Each change shows up as a reviewable diff
                  before anything is applied.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {aiDraft && pendingDraftFields.length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyAllAiFields}
                    className="rounded-full bg-white/80"
                  >
                    Apply all
                  </Button>
                ) : null}
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={submitting || aiStatus === 'loading'}
                  className="rounded-full bg-primary-gradient shadow-soft hover:brightness-105"
                >
                  <WandSparkles className="size-4" />
                  {aiStatus === 'loading' ? 'Generating...' : 'Generate AI Draft'}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-white/65 bg-white/88 shadow-soft">
            <CardHeader className="space-y-5">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl tracking-[-0.03em]">Similar questions</CardTitle>
                <CardDescription className="text-sm leading-6">
                  Check for duplicates and near-duplicates against the current library before you
                  save a new prompt or update an old one.
                </CardDescription>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[1.2rem] bg-[hsl(var(--surface-low)/0.9)] p-3 ring-1 ring-border/45">
                  <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Prompt
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    {similaritySignalSummary.textTokenCount}
                  </div>
                </div>
                <div className="rounded-[1.2rem] bg-[hsl(var(--surface-low)/0.9)] p-3 ring-1 ring-border/45">
                  <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Tags
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    {similaritySignalSummary.tagCount}
                  </div>
                </div>
                <div className="rounded-[1.2rem] bg-[hsl(var(--surface-low)/0.9)] p-3 ring-1 ring-border/45">
                  <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Rubric
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    {similaritySignalSummary.conceptCount}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {similarResultsStale ? <StatusPill tone="neutral">Needs refresh</StatusPill> : null}
                {questionId ? <StatusPill tone="neutral">Edit mode</StatusPill> : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFindSimilar}
                  disabled={submitting || similarStatus === 'loading' || !hasSimilarityInput}
                  className="ml-auto rounded-full bg-white/80"
                >
                  <Search className="size-3.5" />
                  {similarStatus === 'loading' ? 'Searching...' : 'Run search'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {similarStatus === 'idle' ? (
                <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-5 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
                  Search uses prompt text, taxonomy, tags, and rubric concepts. Keep the heuristic
                  lightweight for now; we can swap it to embeddings later when the backend endpoint
                  lands.
                </div>
              ) : null}

              {similarStatus === 'loading' ? (
                <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-5 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
                  Comparing the current draft with the stored question library.
                </div>
              ) : null}

              {similarStatus === 'error' && similarError ? (
                <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
                  <AlertTitle>Similarity search failed</AlertTitle>
                  <AlertDescription>{similarError}</AlertDescription>
                </Alert>
              ) : null}

              {similarStatus === 'success' && similarQuestions.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-5 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
                  No close matches crossed the current similarity threshold.
                </div>
              ) : null}

              {similarQuestions.map((match) => (
                <div
                  key={match.question.id}
                  className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-4 ring-1 ring-border/45"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusPill tone={match.question.difficulty}>
                          {match.question.difficulty}
                        </StatusPill>
                        <StatusPill tone="neutral">{Math.round(match.score * 100)}% match</StatusPill>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold leading-6 text-foreground">
                          {truncateText(match.question.questionText)}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {[
                            match.question.role,
                            match.question.category,
                            match.question.subcategory,
                          ]
                            .filter(Boolean)
                            .join(' / ') || 'No taxonomy attached'}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-full bg-white/80"
                    >
                      <Link href={`/questions/${match.question.id}`}>Open</Link>
                    </Button>
                  </div>

                  {match.reasons.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {match.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="inline-flex rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-medium leading-5 text-muted-foreground ring-1 ring-border/50"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
