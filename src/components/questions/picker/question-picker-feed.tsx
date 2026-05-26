'use client'

import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import { Link } from '@/i18n/navigation'
import type { Question } from '@/lib/api'
import type { QuestionView, QuestionsQueryState } from '@/lib/questions-query-state'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

import { isQuestionsBankFullyEmpty } from './is-questions-bank-fully-empty'

type StateCardTone = 'default' | 'ghost'

const COPY = {
  library: {
    loading: 'Loading questions...',
    emptyBankTitle: 'No saved questions yet',
    emptyBankDescription:
      'Create your first reusable prompt and start building a structured question bank.',
    emptyFilteredTitle: 'No questions match the current filters',
    emptyFilteredDescription:
      'Try widening the search, clearing a filter, or resetting back to defaults.',
    createCta: 'Create Question',
  },
  interview: {
    loading: 'Loading question bank...',
    emptyBankTitle: 'No saved questions yet',
    emptyBankDescription:
      'Create the first reusable prompt before you assemble an interview packet.',
    emptyFilteredTitle: 'No questions match the current filters',
    emptyFilteredDescription:
      'Try clearing some filters or searching with a different term.',
    createCta: 'Create your first question',
  },
} as const

export type QuestionPickerFeedProps = {
  items: Question[]
  total: number
  loading: boolean
  error: string | null
  onRetry: () => void
  view: QuestionView
  debouncedQ: string
  filterState: Pick<
    QuestionsQueryState,
    'difficulty' | 'category' | 'subcategory' | 'role' | 'tags' | 'status'
  >
  onReset: () => void
  tone?: StateCardTone
  copyVariant: keyof typeof COPY
  requireActiveStatusForEmptyBank?: boolean
  renderTable: () => ReactNode
  renderCards: () => ReactNode
}

export function QuestionPickerFeed({
  items,
  total,
  loading,
  error,
  onRetry,
  view,
  debouncedQ,
  filterState,
  onReset,
  tone = 'default',
  copyVariant,
  requireActiveStatusForEmptyBank,
  renderTable,
  renderCards,
}: QuestionPickerFeedProps) {
  const copy = COPY[copyVariant]
  const allEmpty = isQuestionsBankFullyEmpty({
    items,
    loading,
    total,
    debouncedQ,
    filterState,
    requireActiveStatus: requireActiveStatusForEmptyBank,
  })

  if (error) {
    return (
      <EmptyStateCard
        tone={tone}
        icon={
          <Icon size="lg">
            <AlertCircle />
          </Icon>
        }
        title={TOAST_MESSAGES.questionFeed.unavailableTitle}
        description={error}
        action={
          <Button type="button" variant="outline-pill" shape="pill" onClick={onRetry}>
            Retry
          </Button>
        }
      />
    )
  }

  if (items.length === 0 && loading) {
    return <LoadingStateCard tone={tone} label={copy.loading} />
  }

  if (items.length === 0) {
    return (
      <EmptyStateCard
        tone={tone}
        title={allEmpty ? copy.emptyBankTitle : copy.emptyFilteredTitle}
        description={allEmpty ? copy.emptyBankDescription : copy.emptyFilteredDescription}
        action={
          allEmpty ? (
            <Button asChild variant="gradient">
              <Link href="/questions/new">{copy.createCta}</Link>
            </Button>
          ) : (
            <Button type="button" variant="outline-pill" shape="pill" onClick={onReset}>
              Reset filters
            </Button>
          )
        }
      />
    )
  }

  return view === 'table' ? renderTable() : renderCards()
}
