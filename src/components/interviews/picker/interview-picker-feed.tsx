'use client'

import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import type { InterviewListItem } from '@/lib/api'
import type { InterviewView } from '@/lib/interviews-query-state'

export type InterviewPickerFeedProps = {
  items: InterviewListItem[]
  total: number
  loading: boolean
  error: string | null
  onRetry: () => void
  view: InterviewView
  debouncedQ: string
  hasActiveFilters: boolean
  onReset: () => void
  renderTable: () => ReactNode
  renderCards: () => ReactNode
}

export function InterviewPickerFeed({
  items,
  total,
  loading,
  error,
  onRetry,
  view,
  debouncedQ,
  hasActiveFilters,
  onReset,
  renderTable,
  renderCards,
}: InterviewPickerFeedProps) {
  const t = useTranslations('interviews.library.feed')
  const tEmpty = useTranslations('interviews.library.empty')
  const tRefetch = useTranslations('interviews.library.refetch')

  const isEmptyBank = total === 0 && !debouncedQ && !hasActiveFilters

  if (error) {
    return (
      <EmptyStateCard
        icon={
          <Icon size="lg">
            <AlertCircle />
          </Icon>
        }
        title={tRefetch('genericTitle')}
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
    return <LoadingStateCard label={t('loading')} />
  }

  if (items.length === 0) {
    return (
      <EmptyStateCard
        title={isEmptyBank ? tEmpty('title') : tEmpty('filteredTitle')}
        description={
          isEmptyBank ? tEmpty('description') : tEmpty('filteredDescription')
        }
        action={
          isEmptyBank ? (
            <Button asChild variant="gradient">
              <Link href={routes.interviews.new}>{tEmpty('createCta')}</Link>
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
