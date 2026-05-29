'use client'

import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import { Link } from '@/i18n/navigation'
import type { Question } from '@/lib/api'
import type { QuestionView, QuestionsQueryState } from '@/lib/questions-query-state'
import { useToastMessages } from '@/lib/use-toast-messages'

import { isQuestionsBankFullyEmpty } from './is-questions-bank-fully-empty'

type StateCardTone = 'default' | 'ghost'

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
  copyVariant: 'library' | 'interview'
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
  const t = useTranslations('questions.picker.feed')
  const toastMessages = useToastMessages()
  const copyPath = copyVariant === 'library' ? 'library' : 'interview'
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
        title={toastMessages.questionFeed.unavailableTitle}
        description={error}
        action={
          <Button type="button" variant="outline-pill" shape="pill" onClick={onRetry}>
            {t('retry')}
          </Button>
        }
      />
    )
  }

  if (items.length === 0 && loading) {
    return <LoadingStateCard tone={tone} label={t(`${copyPath}.loading`)} />
  }

  if (items.length === 0) {
    return (
      <EmptyStateCard
        tone={tone}
        title={
          allEmpty ? t(`${copyPath}.emptyBankTitle`) : t(`${copyPath}.emptyFilteredTitle`)
        }
        description={
          allEmpty
            ? t(`${copyPath}.emptyBankDescription`)
            : t(`${copyPath}.emptyFilteredDescription`)
        }
        action={
          allEmpty ? (
            <Button asChild variant="gradient">
              <Link href="/questions/new">{t(`${copyPath}.createCta`)}</Link>
            </Button>
          ) : (
            <Button type="button" variant="outline-pill" shape="pill" onClick={onReset}>
              {t('resetFilters')}
            </Button>
          )
        }
      />
    )
  }

  return view === 'table' ? renderTable() : renderCards()
}
