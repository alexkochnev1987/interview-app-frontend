'use client'

import { useTranslations } from 'next-intl'

import { InfiniteCardsLoader } from '@/components/questions/library/infinite-cards-loader'
import { QuestionCard } from '@/components/questions/library/question-card'
import { QuestionTable } from '@/components/questions/library/question-table'
import { StatusPill } from '@/components/ui/status-pill'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'

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
  const tToolbar = useTranslations('questions.picker.toolbar')

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
    <Stack gap={4}>
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
        <CardContent>
          <SearchInput
            value={query.state.q}
            onChange={(event) => query.setQ(event.target.value)}
            placeholder={tToolbar('searchPlaceholder')}
          />
        </CardContent>
      </Card>

      <QuestionPickerToolbar
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
          <CardGrid>
            {view.items.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                listLocale={query.state.locale ?? 'en'}
                mode="pick"
                selected={selectedById.has(question.id)}
                onToggleSelected={() => toggleQuestion(question)}
                disabled={disabled}
              />
            ))}
          </CardGrid>
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
    </Stack>
  )
}
