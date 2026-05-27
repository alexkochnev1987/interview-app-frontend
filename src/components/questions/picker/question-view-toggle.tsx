'use client'

import { type KeyboardEvent } from 'react'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { SegmentedGroup } from '@/components/ui/segmented-group'

import type { QuestionView } from '@/lib/questions-query-state'

export type QuestionViewToggleProps = {
  view: QuestionView
  onViewChange: (value: QuestionView) => void
}

export function QuestionViewToggle({ view, onViewChange }: QuestionViewToggleProps) {
  const t = useTranslations('questions.picker.viewToggle')

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const isHorizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft'
    const isVertical = event.key === 'ArrowDown' || event.key === 'ArrowUp'
    if (!isHorizontal && !isVertical) return
    event.preventDefault()
    const next: QuestionView =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? view === 'cards' ? 'table' : 'cards'
        : view === 'table' ? 'cards' : 'table'
    onViewChange(next)
    const label = next === 'cards' ? t('switchToCards') : t('switchToTable')
    event.currentTarget.querySelector<HTMLElement>(`[aria-label="${label}"]`)?.focus()
  }

  return (
    <SegmentedGroup ariaLabel={t('viewModeAria')} onKeyDown={handleKeyDown}>
      <Button
        type="button"
        variant={view === 'cards' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        role="radio"
        aria-checked={view === 'cards'}
        aria-label={t('switchToCards')}
        tabIndex={view === 'cards' ? 0 : -1}
        onClick={() => onViewChange('cards')}
      >
        <LayoutGrid />
        {t('cards')}
      </Button>
      <Button
        type="button"
        variant={view === 'table' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        role="radio"
        aria-checked={view === 'table'}
        aria-label={t('switchToTable')}
        tabIndex={view === 'table' ? 0 : -1}
        onClick={() => onViewChange('table')}
      >
        <Rows3 />
        {t('table')}
      </Button>
    </SegmentedGroup>
  )
}
