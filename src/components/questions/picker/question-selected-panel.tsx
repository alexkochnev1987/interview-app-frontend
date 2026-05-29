'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type Question } from '@/lib/api'

export type QuestionSelectedPanelProps = {
  selected: Question[]
  onRemove: (id: string) => void
}

export function QuestionSelectedPanel({
  selected,
  onRemove,
}: QuestionSelectedPanelProps) {
  const t = useTranslations('questions.picker.selected')
  const sharedLabels = useSharedLabels()

  return (
    <Card variant="tinted">
      <CardHeader spacing="xs">
        <Inline gap={3} align="center" justify="between">
          <CardTitle size="md">{t('titleWithCount', { count: selected.length })}</CardTitle>
          {selected.length > 0 ? (
            <StatusPill tone="neutral">{t('inPacket', { count: selected.length })}</StatusPill>
          ) : null}
        </Inline>
        <CardDescription>{t('emptyHint')}</CardDescription>
      </CardHeader>
      <CardContent>
        {selected.length === 0 ? (
          <BodyText size="sm" tone="muted">
            {t('emptyPicked')}
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
                    <StatusPill tone={question.difficulty}>
                      {sharedLabels.difficulty(question.difficulty)}
                    </StatusPill>
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
                  aria-label={t('removeAria', { title: question.questionText })}
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
