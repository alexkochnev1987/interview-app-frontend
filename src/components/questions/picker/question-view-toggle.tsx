'use client'

import { useTranslations } from 'next-intl'

import { ViewToggle } from '@/components/ui/view-toggle'
import type { QuestionView } from '@/lib/questions-query-state'

export type QuestionViewToggleProps = {
  view: QuestionView
  onViewChange: (value: QuestionView) => void
}

export function QuestionViewToggle({ view, onViewChange }: QuestionViewToggleProps) {
  const t = useTranslations('questions.picker.viewToggle')

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
