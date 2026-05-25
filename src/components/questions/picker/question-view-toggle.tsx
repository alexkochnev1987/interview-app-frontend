'use client'

import { type KeyboardEvent } from 'react'
import { LayoutGrid, Rows3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SegmentedGroup } from '@/components/ui/segmented-group'

import type { QuestionView } from '@/lib/questions-query-state'

export type QuestionViewToggleProps = {
  view: QuestionView
  onViewChange: (value: QuestionView) => void
}

export function QuestionViewToggle({ view, onViewChange }: QuestionViewToggleProps) {
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
    const label = next === 'cards' ? 'Card view' : 'Table view'
    event.currentTarget.querySelector<HTMLElement>(`[aria-label="${label}"]`)?.focus()
  }

  return (
    <SegmentedGroup ariaLabel="View mode" onKeyDown={handleKeyDown}>
      <Button
        type="button"
        variant={view === 'cards' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        role="radio"
        aria-checked={view === 'cards'}
        aria-label="Card view"
        tabIndex={view === 'cards' ? 0 : -1}
        onClick={() => onViewChange('cards')}
      >
        <LayoutGrid />
        Cards
      </Button>
      <Button
        type="button"
        variant={view === 'table' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        role="radio"
        aria-checked={view === 'table'}
        aria-label="Table view"
        tabIndex={view === 'table' ? 0 : -1}
        onClick={() => onViewChange('table')}
      >
        <Rows3 />
        Table
      </Button>
    </SegmentedGroup>
  )
}
