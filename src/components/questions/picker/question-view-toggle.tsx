'use client'

import { LayoutGrid, Rows3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SegmentedGroup } from '@/components/ui/segmented-group'

import type { QuestionView } from './use-questions-query'

export type QuestionViewToggleProps = {
  view: QuestionView
  onViewChange: (value: QuestionView) => void
}

export function QuestionViewToggle({ view, onViewChange }: QuestionViewToggleProps) {
  return (
    <SegmentedGroup ariaLabel="View mode">
      <Button
        type="button"
        variant={view === 'cards' ? 'secondary' : 'ghost'}
        shape="pill"
        size="sm"
        role="radio"
        aria-checked={view === 'cards'}
        aria-label="Card view"
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
        onClick={() => onViewChange('table')}
      >
        <Rows3 />
        Table
      </Button>
    </SegmentedGroup>
  )
}
