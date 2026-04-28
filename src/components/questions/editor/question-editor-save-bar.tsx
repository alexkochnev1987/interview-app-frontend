'use client'

import { Save } from 'lucide-react'

import { StatusPill } from '@/components/app/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuestionEditorSaveBarProps {
  isDirty: boolean
  dirtyFieldLabels: string[]
  submitting: boolean
  submitLabel: string
}

export function QuestionEditorSaveBar({
  isDirty,
  dirtyFieldLabels,
  submitting,
  submitLabel,
}: QuestionEditorSaveBarProps) {
  return (
    <Card
      className={cn(
        'border-white/65 bg-white/88 shadow-soft',
        isDirty && 'border-warning-soft-border bg-warning-soft',
      )}
    >
      <CardContent className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={isDirty ? 'pending' : 'completed'}>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </StatusPill>
            {isDirty && (
              <span className="text-xs font-medium text-muted-foreground">
                {dirtyFieldLabels.length} field
                {dirtyFieldLabels.length === 1 ? '' : 's'} changed
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
            {isDirty ? 'Save your edits' : 'Nothing to save right now'}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {isDirty
              ? `Modified: ${dirtyFieldLabels.join(', ')}.`
              : 'Editor matches the saved version. Make a change to enable Save.'}
          </p>
        </div>
        <Button
          type="submit"
          variant="gradient"
          disabled={submitting || !isDirty}
          className="h-11 shrink-0 px-6 font-semibold"
        >
          <Save className="size-4" />
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
