'use client'

import { Save } from 'lucide-react'

import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

interface QuestionEditorSaveBarProps {
  isDirty: boolean
  dirtyFieldLabels: string[]
  submitting: boolean
  submitLabel: string
}

const formatter = new Intl.PluralRules('en-US')

function pluralize(count: number, singular: string, plural: string) {
  return formatter.select(count) === 'one' ? singular : plural
}

export function QuestionEditorSaveBar({
  isDirty,
  dirtyFieldLabels,
  submitting,
  submitLabel,
}: QuestionEditorSaveBarProps) {
  const fieldCount = dirtyFieldLabels.length
  return (
    <Card variant={isDirty ? 'warning' : 'surface'} size="lg">
      <CardContent layout="split-row" spacing="md">
        <Stack gap={2}>
          <Inline gap={2} align="center" wrap="wrap">
            <StatusPill tone={isDirty ? 'pending' : 'completed'}>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </StatusPill>
            {isDirty && (
              <BodyText as="span" size="xs" weight="medium">
                {fieldCount} {pluralize(fieldCount, 'field', 'fields')} changed
              </BodyText>
            )}
          </Inline>
          <SectionHeading size="sm" as="h3">
            {isDirty ? 'Save your edits' : 'Nothing to save right now'}
          </SectionHeading>
          <BodyText size="sm">
            {isDirty
              ? `Modified: ${dirtyFieldLabels.join(', ')}.`
              : 'Editor matches the saved version. Make a change to enable Save.'}
          </BodyText>
        </Stack>
        <Button
          type="submit"
          variant="gradient"
          size="xl"
          disabled={submitting || !isDirty}
        >
          <Save className="size-4" />
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
