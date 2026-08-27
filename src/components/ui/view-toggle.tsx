'use client'

import { LayoutGrid, Rows3 } from 'lucide-react'
import { type KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { SegmentedGroup } from '@/components/ui/segmented-group'

export type ViewToggleView = 'cards' | 'table'

export type ViewToggleLabels = {
  viewModeAria: string
  cards: string
  table: string
  switchToCards: string
  switchToTable: string
}

export type ViewToggleProps = {
  view: ViewToggleView
  onViewChange: (value: ViewToggleView) => void
  labels: ViewToggleLabels
}

export function ViewToggle({ view, onViewChange, labels }: ViewToggleProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const isHorizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft'
    const isVertical = event.key === 'ArrowDown' || event.key === 'ArrowUp'
    if (!isHorizontal && !isVertical) return
    event.preventDefault()
    const next: ViewToggleView =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? view === 'cards'
          ? 'table'
          : 'cards'
        : view === 'table'
          ? 'cards'
          : 'table'
    onViewChange(next)
    const label = next === 'cards' ? labels.switchToCards : labels.switchToTable
    event.currentTarget.querySelector<HTMLElement>(`[aria-label="${label}"]`)?.focus()
  }

  return (
    <SegmentedGroup ariaLabel={labels.viewModeAria} onKeyDown={handleKeyDown}>
      <Button
        type="button"
        variant={view === 'cards' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="radio"
        aria-checked={view === 'cards'}
        aria-label={labels.switchToCards}
        tabIndex={view === 'cards' ? 0 : -1}
        onClick={() => onViewChange('cards')}
      >
        <Icon size="md">
          <LayoutGrid />
        </Icon>
        {labels.cards}
      </Button>
      <Button
        type="button"
        variant={view === 'table' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="radio"
        aria-checked={view === 'table'}
        aria-label={labels.switchToTable}
        tabIndex={view === 'table' ? 0 : -1}
        onClick={() => onViewChange('table')}
      >
        <Icon size="md">
          <Rows3 />
        </Icon>
        {labels.table}
      </Button>
    </SegmentedGroup>
  )
}
