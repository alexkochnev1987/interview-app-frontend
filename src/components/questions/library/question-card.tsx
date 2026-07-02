'use client'

import { useTranslations } from 'next-intl'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { PillRow } from '@/components/ui/pill-row'
import { SelectableOverlay } from '@/components/ui/selectable-overlay'
import { BodyText } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type Question } from '@/lib/api'
import { truncateText } from '@/lib/text'

type QuestionCardInteraction = 'navigate' | 'select'

interface QuestionCardProps {
  question: Question
  selectable: boolean
  selected: boolean
  onToggleSelected: (id: string) => void
  interaction?: QuestionCardInteraction
  disabled?: boolean
}

function CardSurface({
  question,
  selectable,
  selected,
  selectionTone,
}: {
  question: Question
  selectable: boolean
  selected: boolean
  selectionTone: 'delete' | 'pick'
}) {
  const t = useTranslations('questions.library.card')
  const sharedLabels = useSharedLabels()

  const state = question.deleted
    ? 'deleted'
    : question.pendingDeletion
      ? 'scheduled'
      : selected && selectable
        ? selectionTone === 'pick'
          ? 'picked'
          : 'selected'
        : 'default'

  return (
    <Card
      variant={question.deleted ? 'danger-soft' : question.pendingDeletion ? 'scheduled-soft' : 'surface'}
      height="full"
      interaction="hover"
      state={state}
    >
      <CardHeader spacing="md">
        <PillRow reserveCorner={selectable}>
          {question.deleted ? (
            <StatusPill tone="failed">{t('deleted')}</StatusPill>
          ) : null}
          {question.pendingDeletion && !question.deleted ? (
            <StatusPill tone="scheduled">{t('scheduled')}</StatusPill>
          ) : null}
          <StatusPill tone={question.difficulty}>
            {sharedLabels.difficulty(question.difficulty)}
          </StatusPill>
          {question.category ? (
            <StatusPill tone="neutral" casing="chip">
              {question.category}
            </StatusPill>
          ) : null}
        </PillRow>
        <Stack gap={2}>
          <CardTitle size="list-clamp">
            {truncateText(question.questionText)}
          </CardTitle>
          <CardDescription>
            {question.role ? `${question.role} · ` : ''}
            {t('weightLabel', { weight: question.weight })}
          </CardDescription>
        </Stack>
      </CardHeader>
      <CardContent spacing="md">
        <Grid columns={2} gap={3}>
          <MetricPanel
            tone="compact"
            label={t('conceptsMetric')}
            value={question.expectedConcepts.length}
            valueSize="md"
          />
          <MetricPanel
            tone="compact"
            label={t('popularityMetric')}
            value={question.usageCount}
            valueSize="md"
          />
        </Grid>

        <Stack gap={2}>
          <EyebrowLabel>{t('expectedConcepts')}</EyebrowLabel>
          <BodyText size="sm">
            {question.expectedConcepts.length > 0
              ? question.expectedConcepts
                  .slice(0, 3)
                  .map((item) => item.label)
                  .join(', ')
              : t('notSpecified')}
          </BodyText>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function QuestionCard({
  question,
  selectable,
  selected,
  onToggleSelected,
  interaction = 'navigate',
  disabled = false,
}: QuestionCardProps) {
  const t = useTranslations('questions.library.table')

  if (interaction === 'select') {
    return (
      <SelectableOverlay
        interactive
        onClick={disabled ? undefined : () => onToggleSelected(question.id)}
        marker={
          <Checkbox
            size="md"
            surface="card"
            checked={selected}
            onCheckedChange={() => onToggleSelected(question.id)}
            disabled={disabled}
            aria-label={t('selectQuestion')}
          />
        }
      >
        <CardSurface
          question={question}
          selectable
          selected={selected}
          selectionTone="pick"
        />
      </SelectableOverlay>
    )
  }

  if (!selectable) {
    return (
      <UnstyledLink href={routes.questions.detail(question.id)}>
        <CardSurface
          question={question}
          selectable={false}
          selected={false}
          selectionTone="delete"
        />
      </UnstyledLink>
    )
  }

  return (
    <SelectableOverlay
      marker={
        <Checkbox
          size="md"
          surface="card"
          checked={selected}
          onCheckedChange={() => onToggleSelected(question.id)}
          aria-label={t('selectQuestion')}
        />
      }
    >
      <UnstyledLink href={routes.questions.detail(question.id)}>
        <CardSurface
          question={question}
          selectable
          selected={selected}
          selectionTone="delete"
        />
      </UnstyledLink>
    </SelectableOverlay>
  )
}
