'use client'

import { useTranslations } from 'next-intl'

import { InfiniteCardsLoader } from '@/components/questions/library/infinite-cards-loader'
import { QuestionTable } from '@/components/questions/library/question-table'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { SelectableTile } from '@/components/ui/selectable-tile'
import { StatusPill } from '@/components/ui/status-pill'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type Question } from '@/lib/api'

import { QuestionFacetSidebar } from './question-facet-sidebar'
import { QuestionPickerFeed } from './question-picker-feed'
import { QuestionPickerRefetchAlert } from './question-picker-refetch-alert'
import { QuestionPickerToolbar } from './question-picker-toolbar'
import { QuestionSelectedPanel } from './question-selected-panel'
import { QuestionViewToggle } from './question-view-toggle'
import { type useInterviewQuestionPicker } from './use-interview-question-picker'

type InterviewQuestionPicker = ReturnType<typeof useInterviewQuestionPicker>

type InterviewQuestionPickerAsideProps = {
  picker: InterviewQuestionPicker
}

export function InterviewQuestionPickerAside({
  picker,
}: InterviewQuestionPickerAsideProps) {
  const { facetsResult, facets, query, selectedQuestions, removeSelected } = picker

  return (
    <>
      <QuestionFacetSidebar
        difficulties={facets.difficulties}
        categories={facets.categories}
        subcategories={facets.subcategories}
        roles={facets.roles}
        tags={facets.tags}
        selected={{
          locale: query.state.locale,
          difficulty: query.state.difficulty,
          category: query.state.category,
          subcategory: query.state.subcategory,
          role: query.state.role,
          tags: query.state.tags,
          status: query.state.status,
        }}
        onLocaleChange={query.setLocale}
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

      <QuestionSelectedPanel
        selected={selectedQuestions}
        onRemove={removeSelected}
      />
    </>
  )
}

type InterviewQuestionPickerMainProps = {
  picker: InterviewQuestionPicker
  title: string
  description: string
  disabled?: boolean
}

export function InterviewQuestionPickerMain({
  picker,
  title,
  description,
  disabled = false,
}: InterviewQuestionPickerMainProps) {
  const t = useTranslations('questions.common')
  const sharedLabels = useSharedLabels()

  const {
    query,
    infinite,
    view,
    activeChips,
    isCardsView,
    selectedById,
    selectedCount,
    selectedIds,
    toggleQuestion,
    toggleQuestionsBulk,
  } = picker

  return (
    <Card variant="surface">
      <CardHeader spacing="xs">
        <Inline gap={4} align="start" justify="between">
          <Stack gap={1.5}>
            <CardTitle size="lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </Stack>
          <StatusPill tone="neutral">
            {t('selectedCount', { count: selectedCount })}
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
              listLocale={query.state.locale ?? 'en'}
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
              disabled={disabled}
            />
          )}
          renderCards={() => (
            <Stack gap={3}>
              {view.items.map((question) => {
                const selected = selectedById.has(question.id)
                return (
                  <InterviewQuestionPickerCard
                    key={question.id}
                    question={question}
                    selected={selected}
                    disabled={disabled}
                    onToggle={() => toggleQuestion(question)}
                  />
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
  )
}

type InterviewQuestionPickerCardProps = {
  question: Question
  selected: boolean
  disabled: boolean
  onToggle: () => void
}

function InterviewQuestionPickerCard({
  question,
  selected,
  disabled,
  onToggle,
}: InterviewQuestionPickerCardProps) {
  const t = useTranslations('questions.common')
  const sharedLabels = useSharedLabels()

  return (
    <SelectableTile selected={selected}>
      <Checkbox
        checked={selected}
        onCheckedChange={onToggle}
        disabled={disabled}
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
            {t('usageLine', {
              rolePart: question.role ? `${question.role} · ` : '',
              count: question.usageCount,
              weight: question.weight,
            })}
          </BodyText>
        </Stack>

        <Grid columns="metrics-2-md" gap={3}>
          <Stack gap={2}>
            <EyebrowLabel>{t('conceptsEyebrow')}</EyebrowLabel>
            <BodyText size="sm">
              {question.expectedConcepts.length > 0
                ? question.expectedConcepts.map((item) => item.label).join(', ')
                : t('notSpecified')}
            </BodyText>
          </Stack>
          <Stack gap={2}>
            <EyebrowLabel>{t('redFlagsLabel')}</EyebrowLabel>
            <BodyText size="sm">
              {question.redFlags.length > 0
                ? question.redFlags.map((item) => item.label).join(', ')
                : t('notSpecified')}
            </BodyText>
          </Stack>
        </Grid>
      </Stack>
    </SelectableTile>
  )
}
