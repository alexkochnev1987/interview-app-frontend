'use client'

import { useMemo, useState } from 'react'
import { BriefcaseBusiness, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
import { useQuestionChipLabels } from '@/i18n/use-question-chip-labels'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { updateInterview, type Interview, type Question } from '@/lib/api'
import { buildQuestionsInfiniteParams } from '@/lib/questions-query-state'
import { runMutation } from '@/lib/run-mutation'
import { useToastMessages } from '@/lib/use-toast-messages'

type InterviewEditPanelProps = {
  interview: Interview
  onSaved: (updated: Interview) => void
  onDiscard: () => void
}

const INTERVIEW_PICKER_FETCH_OPTIONS = { eligibleForInterview: true } as const

export function InterviewEditPanel({
  interview,
  onSaved,
  onDiscard,
}: InterviewEditPanelProps) {
  const tEdit = useTranslations('interviews.edit')
  const tActions = useTranslations('interviews.actions')
  const tPicker = useTranslations('questions.common')
  const getChipLabel = useQuestionChipLabels()
  const sharedLabels = useSharedLabels()
  const toastMessages = useToastMessages()

  const [candidateName, setCandidateName] = useState(interview.candidateName)
  const [position, setPosition] = useState(interview.position)
  const [selectedById, setSelectedById] = useState(
    () => new Map(interview.questions.map((q) => [q.id, q as Question])),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const query = useQuestionsQuery({
    syncUrl: false,
    lockStatus: 'active',
    disableFetchInCardsView: true,
    eligibleForInterview: true,
  })
  const isCardsView = query.state.view === 'cards'
  const cardsInfiniteParams = useMemo(
    () => buildQuestionsInfiniteParams(query.state, query.debouncedQ, INTERVIEW_PICKER_FETCH_OPTIONS),
    [query.state, query.debouncedQ],
  )
  const infinite = useQuestionsInfinite({
    params: cardsInfiniteParams,
    enabled: isCardsView,
    serverHydrated: false,
  })
  const view = pickQuestionsViewSource(isCardsView, query, infinite)
  const facetsResult = useQuestionFacets(query.state, query.debouncedQ, INTERVIEW_PICKER_FETCH_OPTIONS)
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
    getChipLabel,
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
                  onClick={onDiscard}
                >
                  {tActions('discardEdit')}
                </Button>
              </Inline>
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
                <CardTitle size="lg">{tEdit('questionsTitle')}</CardTitle>
                <CardDescription>{tPicker('selectionDescription')}</CardDescription>
              </Stack>
              <StatusPill tone="neutral">
                {tPicker('selectedCount', { count: selectedCount })}
              </StatusPill>
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
                              {sharedLabels.difficulty(question.difficulty)}
                            </StatusPill>
                            {question.category ? (
                              <StatusPill tone="neutral" casing="chip">
                                {question.category}
                              </StatusPill>
                            ) : null}
                          </Inline>

                          <Stack gap={1.5}>
                            <SectionHeading size="prompt" as="h3">
                              {question.questionText}
                            </SectionHeading>
                            <BodyText size="sm">
                              {tPicker('usageLine', {
                                rolePart: question.role ? `${question.role} · ` : '',
                                count: question.usageCount,
                                weight: question.weight,
                              })}
                            </BodyText>
                          </Stack>
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
    </>
  )
}
