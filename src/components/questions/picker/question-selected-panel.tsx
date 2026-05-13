'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { type Question } from '@/lib/api'

export type QuestionSelectedPanelProps = {
  selected: Question[]
  onRemove: (id: string) => void
  emptyHint?: string
}

export function QuestionSelectedPanel({
  selected,
  onRemove,
  emptyHint = 'Picked questions appear here so you can find them while filtering.',
}: QuestionSelectedPanelProps) {
  return (
    <Card variant="tinted">
      <CardHeader spacing="xs">
        <Inline gap={3} align="center" justify="between">
          <CardTitle size="md">Selected ({selected.length})</CardTitle>
          {selected.length > 0 ? (
            <StatusPill tone="neutral">{selected.length} in packet</StatusPill>
          ) : null}
        </Inline>
        <CardDescription>{emptyHint}</CardDescription>
      </CardHeader>
      <CardContent>
        {selected.length === 0 ? (
          <BodyText size="sm" tone="muted">
            No questions picked yet.
          </BodyText>
        ) : (
          <Stack gap={2}>
            {selected.map((question) => (
              <Inline key={question.id} gap={2} align="start" justify="between">
                <Stack gap={1} grow="fill">
                  <BodyText size="sm">
                    <strong>{question.questionText}</strong>
                  </BodyText>
                  <Inline gap={2} wrap="wrap">
                    <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                    {question.category ? (
                      <StatusPill tone="neutral" casing="chip">
                        {question.category}
                      </StatusPill>
                    ) : null}
                  </Inline>
                </Stack>
                <Button
                  type="button"
                  variant="outline"
                  shape="pill"
                  size="icon-xs"
                  aria-label={`Remove ${question.questionText} from selection`}
                  onClick={() => onRemove(question.id)}
                >
                  <X className="size-3" />
                </Button>
              </Inline>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
