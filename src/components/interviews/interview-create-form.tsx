'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react'

import { InfiniteCardsLoader } from '@/components/questions/library/infinite-cards-loader'
import { QuestionTable } from '@/components/questions/library/question-table'
import {
  buildActiveFilterChips,
  pickQuestionsViewSource,
  QuestionFacetSidebar,
  QuestionPickerFeed,
  QuestionPickerRefetchAlert,
  QuestionPickerToolbar,
  QuestionSelectedPanel,
  QuestionViewToggle,
  useQuestionFacets,
  useQuestionsInfinite,
  useQuestionsQuery,
} from '@/components/questions/picker'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FormField } from '@/components/ui/form-field'
import { IconAffix } from '@/components/ui/icon-affix'
import { SelectableTile } from '@/components/ui/selectable-tile'
import { StatusPill } from '@/components/ui/status-pill'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { createInterview, type Question } from '@/lib/api'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { runMutation } from '@/lib/run-mutation'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

const INTERVIEW_GATE = TOAST_MESSAGES.pageGate.interview

type InterviewCreateFormProps = {
  initialPrefetch: QuestionsLibraryPrefetch
}

export function InterviewCreateForm({ initialPrefetch }: InterviewCreateFormProps) {
  const router = useRouter()
  const [candidateName, setCandidateName] = useState('')
  const [position, setPosition] = useState('')
  const [selectedById, setSelectedById] = useState<Map<string, Question>>(new Map())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const query = useQuestionsQuery({
    initial: initialPrefetch.queryState,
    serverHydrated: true,
    syncUrl: false,
    lockStatus: 'active',
    disableFetchInCardsView: true,
  })
  const isCardsView = query.state.view === 'cards'
  const cardsInfiniteParams = useMemo(
    () => ({
      q: query.debouncedQ || undefined,
      difficulty: query.state.difficulty,
      category: query.state.category,
      subcategory: query.state.subcategory,
      tags: query.state.tags.length > 0 ? query.state.tags : undefined,
      role: query.state.role,
      status: query.state.status,
      sortBy: query.state.sortBy,
      sortOrder: query.state.sortOrder,
      limit: query.state.limit,
    }),
    [query.debouncedQ, query.state],
  )
  const infinite = useQuestionsInfinite({
    params: cardsInfiniteParams,
    enabled: isCardsView,
    serverHydrated: true,
  })
  const view = pickQuestionsViewSource(isCardsView, query, infinite)
  const facetsResult = useQuestionFacets(query.state, query.debouncedQ)
  const facets = facetsResult.facets

  const activeChips = buildActiveFilterChips(
    query.state,
    {
      setDifficulty: query.setDifficulty,
      setCategory: query.setCategory,
      setSubcategory: query.setSubcategory,
      setRole: query.setRole,
      setTags: query.setTags,
      setStatus: query.setStatus,
    },
    { showStatusFilter: false },
  )

  const selectedCount = selectedById.size
  const selectedQuestions = Array.from(selectedById.values())
  const selectedIds = useMemo(
    () => new Set(selectedById.keys()),
    [selectedById],
  )

  function toggleQuestion(question: Question) {
    setSelectedById((prev) => {
      const next = new Map(prev)
      if (next.has(question.id)) {
        next.delete(question.id)
      } else {
        next.set(question.id, question)
      }
      return next
    })
  }

  function toggleQuestionsBulk(questions: Question[], select: boolean) {
    setSelectedById((prev) => {
      const next = new Map(prev)
      if (select) {
        questions.forEach((q) => next.set(q.id, q))
      } else {
        questions.forEach((q) => next.delete(q.id))
      }
      return next
    })
  }

  function removeSelected(id: string) {
    setSelectedById((prev) => {
      if (!prev.has(id)) return prev
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!candidateName.trim()) {
      setError(INTERVIEW_GATE.candidateNameRequired)
      return
    }
    if (!position.trim()) {
      setError(INTERVIEW_GATE.positionRequired)
      return
    }
    if (selectedCount === 0) {
      setError(INTERVIEW_GATE.questionsRequired)
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
          successMessage: TOAST_MESSAGES.interview.createSuccess,
          errorMessage: TOAST_MESSAGES.interview.createError,
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
          <AlertTitle>{INTERVIEW_GATE.setupBlockedTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Grid columns="aside-22-left" gap={6}>
          <Stack gap={4}>
            <Card variant="surface">
              <CardHeader spacing="xs">
                <CardTitle size="lg">Candidate brief</CardTitle>
                <CardDescription>
                  This metadata will anchor the scoring context once answers arrive.
                </CardDescription>
              </CardHeader>
              <CardContent spacing="lg">
                <FormField htmlFor="candidateName" label="Candidate name">
                  <IconAffix icon={<UserRound className="size-4" />}>
                    <Input
                      id="candidateName"
                      iconAffix="leading"
                      value={candidateName}
                      onChange={(event) => setCandidateName(event.target.value)}
                      placeholder="e.g. Jane Doe"
                      autoComplete="name"
                      disabled={submitting}
                    />
                  </IconAffix>
                </FormField>

                <FormField htmlFor="position" label="Position">
                  <IconAffix icon={<BriefcaseBusiness className="size-4" />}>
                    <Input
                      id="position"
                      iconAffix="leading"
                      value={position}
                      onChange={(event) => setPosition(event.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
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
                    ? INTERVIEW_GATE.creatingLabel
                    : `Create Interview${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>

            <QuestionFacetSidebar
              difficulties={facets.difficulties}
              categories={facets.categories}
              subcategories={facets.subcategories}
              roles={facets.roles}
              tags={facets.tags}
              selected={{
                difficulty: query.state.difficulty,
                category: query.state.category,
                subcategory: query.state.subcategory,
                role: query.state.role,
                tags: query.state.tags,
                status: query.state.status,
              }}
              onDifficultyChange={query.setDifficulty}
              onCategoryChange={query.setCategory}
              onSubcategoryChange={query.setSubcategory}
              onRoleChange={query.setRole}
              onTagsChange={query.setTags}
              onStatusChange={query.setStatus}
              onReset={query.reset}
              canReset={query.canReset}
              showStatusFilter={false}
              loading={facetsResult.loading}
              error={facetsResult.error}
              onRetry={facetsResult.refetch}
            />

            <QuestionSelectedPanel selected={selectedQuestions} onRemove={removeSelected} />
          </Stack>

          <Card variant="surface">
            <CardHeader spacing="xs">
              <Inline gap={4} align="start" justify="between">
                <Stack gap={1.5}>
                  <CardTitle size="lg">Question selection</CardTitle>
                  <CardDescription>
                    Pick the prompts that actually differentiate the candidate. Your selection is
                    kept even when filters hide a question from the list.
                  </CardDescription>
                </Stack>
                <StatusPill tone="neutral">{selectedCount} selected</StatusPill>
              </Inline>
            </CardHeader>
            <CardContent spacing="md">
              <QuestionPickerToolbar
                q={query.state.q}
                onQChange={query.setQ}
                sortBy={query.state.sortBy}
                sortOrder={query.state.sortOrder}
                onSortChange={query.setSort}
                activeChips={activeChips}
                resultCount={view.total}
                loading={view.toolbarLoading}
                viewToggle={
                  <QuestionViewToggle
                    view={query.state.view}
                    onViewChange={query.setView}
                  />
                }
              />

              <QuestionPickerFeed
                items={view.items}
                total={view.total}
                loading={view.loading}
                error={view.error}
                onRetry={view.retry}
                view={query.state.view}
                debouncedQ={query.debouncedQ}
                filterState={query.state}
                onReset={query.reset}
                tone="ghost"
                copyVariant="interview"
                renderTable={() => (
                  <QuestionTable
                    items={query.items}
                    selectable
                    selectedIds={selectedIds}
                    onToggleSelected={toggleQuestion}
                    onToggleSelectAll={toggleQuestionsBulk}
                    onRowClick={toggleQuestion}
                    sortBy={query.state.sortBy}
                    sortOrder={query.state.sortOrder}
                    onSortChange={query.setSort}
                    page={query.state.page}
                    loading={query.loading}
                  />
                )}
                renderCards={() => (
                  <Stack gap={3}>
                    {view.items.map((question) => {
                    const selected = selectedById.has(question.id)
                    return (
                      <SelectableTile key={question.id} selected={selected}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleQuestion(question)}
                          disabled={submitting}
                          align="top"
                        />

                        <Stack gap={3} grow="fill">
                          <Inline gap={2} align="center" wrap="wrap">
                            <StatusPill tone={question.difficulty}>
                              {question.difficulty}
                            </StatusPill>
                            {question.category ? (
                              <StatusPill tone="neutral" casing="chip">
                                {question.category}
                              </StatusPill>
                            ) : null}
                            {question.subcategory ? (
                              <StatusPill tone="neutral" casing="chip">
                                {question.subcategory}
                              </StatusPill>
                            ) : null}
                          </Inline>

                          <Stack gap={1.5}>
                            <SectionHeading size="prompt" as="h3">
                              {question.questionText}
                            </SectionHeading>
                            <BodyText size="sm">
                              {question.role ? `${question.role} · ` : ''}
                              used {question.usageCount}× · weight {question.weight}
                            </BodyText>
                          </Stack>

                          <Grid columns="metrics-2-md" gap={3}>
                            <Stack gap={2}>
                              <EyebrowLabel>Concepts</EyebrowLabel>
                              <BodyText size="sm">
                                {question.expectedConcepts.length > 0
                                  ? question.expectedConcepts
                                      .map((item) => item.label)
                                      .join(', ')
                                  : 'Not specified'}
                              </BodyText>
                            </Stack>
                            <Stack gap={2}>
                              <EyebrowLabel>Red flags</EyebrowLabel>
                              <BodyText size="sm">
                                {question.redFlags.length > 0
                                  ? question.redFlags.map((item) => item.label).join(', ')
                                  : 'Not specified'}
                              </BodyText>
                            </Stack>
                          </Grid>
                        </Stack>
                      </SelectableTile>
                    )
                    })}
                  </Stack>
                )}
              />

              {!isCardsView ? (
                <QuestionPickerRefetchAlert
                  error={query.paginationError}
                  onRetry={query.refetch}
                />
              ) : null}

              {isCardsView && view.items.length > 0 ? (
                <InfiniteCardsLoader
                  hasNextPage={infinite.hasNextPage}
                  isFetchingNextPage={infinite.isFetchingNextPage}
                  totalLoaded={infinite.items.length}
                  total={infinite.total}
                  error={infinite.paginationError}
                  onLoadMore={infinite.fetchNextPage}
                />
              ) : null}

              {!isCardsView && !view.error ? (
                <Pagination
                  page={query.state.page}
                  totalPages={query.totalPages}
                  total={query.total}
                  limit={query.state.limit}
                  onPageChange={query.setPage}
                />
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </form>
    </>
  )
}
