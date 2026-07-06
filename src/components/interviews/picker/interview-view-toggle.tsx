'use client'

import { type KeyboardEvent } from 'react'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { SegmentedGroup } from '@/components/ui/segmented-group'
import type { InterviewView } from '@/lib/interviews-query-state'

export type InterviewViewToggleProps = {
  view: InterviewView
  onViewChange: (value: InterviewView) => void
}

export function InterviewViewToggle({
  view,
  onViewChange,
}: InterviewViewToggleProps) {
  const t = useTranslations('interviews.library.viewToggle')

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const isHorizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft'
    const isVertical = event.key === 'ArrowDown' || event.key === 'ArrowUp'
    if (!isHorizontal && !isVertical) return
    event.preventDefault()
    const next: InterviewView =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? view === 'cards'
          ? 'table'
          : 'cards'
        : view === 'table'
          ? 'cards'
          : 'table'
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
        <Icon size="md">
          <LayoutGrid />
        </Icon>
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
        <Icon size="md">
          <Rows3 />
        </Icon>
        {t('table')}
      </Button>
    </SegmentedGroup>
  )
}
