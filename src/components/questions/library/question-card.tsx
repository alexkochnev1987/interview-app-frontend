'use client'

import { type ComponentProps } from 'react'
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

// navigate: click opens the detail page.
// select:   click opens the detail page, checkbox toggles a delete selection.
// pick:      click toggles the pick selection, no navigation.
type QuestionCardMode = 'navigate' | 'select' | 'pick'

interface QuestionCardProps {
  question: Question
  listLocale: string
  mode?: QuestionCardMode
  selected?: boolean
  onToggleSelected?: (id: string) => void
  disabled?: boolean
  tourTarget?: string
}

type CardVariant = ComponentProps<typeof Card>['variant']
type CardState = ComponentProps<typeof Card>['state']

function getCardAppearance(
  question: Question,
  mode: QuestionCardMode,
  selected: boolean,
): { variant: CardVariant; state: CardState } {
  if (question.deleted) return { variant: 'danger-soft', state: 'deleted' }
  if (question.pendingDeletion)
    return { variant: 'scheduled-soft', state: 'scheduled' }
  if (selected && mode === 'pick') return { variant: 'surface', state: 'picked' }
  if (selected && mode === 'select')
    return { variant: 'surface', state: 'selected' }
  return { variant: 'surface', state: 'default' }
}

function CardSurface({
  question,
  listLocale,
  reserveCorner,
  variant,
  state,
  tourTarget,
}: {
  question: Question
  listLocale: string
  reserveCorner: boolean
  variant: CardVariant
  state: CardState
  tourTarget?: string
}) {
  const t = useTranslations('questions.library.card')
  const sharedLabels = useSharedLabels()

  return (
    <Card
      variant={variant}
      height="full"
      interaction="hover"
      state={state}
      data-tour={tourTarget}
    >
      <CardHeader spacing="md">
        <PillRow reserveCorner={reserveCorner}>
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
          {question.resolvedLocale && question.resolvedLocale !== listLocale ? (
            <StatusPill tone="neutral_meta" casing="chip">
              {t('resolvedLocaleBadge', {
                locale: question.resolvedLocale.toUpperCase(),
              })}
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
                  .map((item: { label: string }) => item.label)
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
  listLocale,
  mode = 'navigate',
  selected = false,
  onToggleSelected,
  disabled = false,
  tourTarget,
}: QuestionCardProps) {
  const t = useTranslations('questions.library.table')

  const { variant, state } = getCardAppearance(question, mode, selected)
  const isSelectable = mode === 'select' || mode === 'pick'

  const surface = (
    <CardSurface
      question={question}
      listLocale={listLocale}
      reserveCorner={isSelectable}
      variant={variant}
      state={state}
      tourTarget={tourTarget}
    />
  )

  if (mode === 'navigate') {
    return (
      <UnstyledLink href={routes.questions.detail(question.id)}>
        {surface}
      </UnstyledLink>
    )
  }

  const marker = (
    <Checkbox
      size="md"
      surface="card"
      checked={selected}
      onCheckedChange={() => onToggleSelected?.(question.id)}
      disabled={disabled}
      aria-label={t('selectQuestion')}
    />
  )

  if (mode === 'pick') {
    return (
      <SelectableOverlay
        interactive={!disabled}
        onToggle={() => onToggleSelected?.(question.id)}
        marker={marker}
      >
        {surface}
      </SelectableOverlay>
    )
  }

  return (
    <SelectableOverlay marker={marker}>
      <UnstyledLink href={routes.questions.detail(question.id)}>
        {surface}
      </UnstyledLink>
    </SelectableOverlay>
  )
}
