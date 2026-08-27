'use client'

import { useTranslations } from 'next-intl'

import { ViewToggle } from '@/components/ui/view-toggle'
import type { InterviewView } from '@/lib/interviews-query-state'

export type InterviewViewToggleProps = {
  view: InterviewView
  onViewChange: (value: InterviewView) => void
}

export function InterviewViewToggle({ view, onViewChange }: InterviewViewToggleProps) {
  const t = useTranslations('interviews.library.viewToggle')

  return (
    <ViewToggle
      view={view}
      onViewChange={onViewChange}
      labels={{
        viewModeAria: t('viewModeAria'),
        cards: t('cards'),
        table: t('table'),
        switchToCards: t('switchToCards'),
        switchToTable: t('switchToTable'),
      }}
    />
  )
}
