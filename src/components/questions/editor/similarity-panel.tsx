'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Icon } from '@/components/ui/icon'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { type SimilarQuestionMatch } from '@/lib/api'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import {
  type SimilarStatus,
  type SimilaritySignalSummary,
} from '@/lib/question-editor/parsers'
import { truncateText } from '@/lib/text'
import { useToastMessages } from '@/lib/use-toast-messages'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { SIMILARITY_MIN_QUESTION_TEXT_LENGTH } from './use-similarity-search'

interface SimilarityPanelProps {
  status: SimilarStatus
  matches: SimilarQuestionMatch[]
  error: string | null
  signalSummary: SimilaritySignalSummary
  canSearch: boolean
  resultsStale: boolean
  isEditMode: boolean
  disabled: boolean
  onRunSearch: () => void
}

export function SimilarityPanel({
  status,
  matches,
  error,
  signalSummary,
  canSearch,
  resultsStale,
  isEditMode,
  disabled,
  onRunSearch,
}: SimilarityPanelProps) {
  const toastMessages = useToastMessages()
  const t = useTranslations('questions.similarity')

  return (
    <Card variant="surface">
      <CardHeader spacing="lg">
        <Stack gap={1.5}>
          <CardTitle size="lg">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </Stack>

        <Grid columns={3} gap={3}>
          <SignalTile label={t('signalPrompt')} value={signalSummary.textTokenCount} />
          <SignalTile label={t('signalTags')} value={signalSummary.tagCount} />
          <SignalTile label={t('signalRubric')} value={signalSummary.conceptCount} />
        </Grid>

        <Inline gap={2} align="center" justify="between" wrap="wrap">
          <Inline gap={2} align="center" wrap="wrap">
            {resultsStale ? <StatusPill tone="neutral">{t('needsRefresh')}</StatusPill> : null}
            {isEditMode ? <StatusPill tone="neutral">{t('editMode')}</StatusPill> : null}
          </Inline>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={onRunSearch}
            disabled={disabled || status === 'loading' || !canSearch}
          >
            <Icon size="sm">
              <Search />
            </Icon>
            {status === 'loading' ? t('searching') : t('runSearch')}
          </Button>
        </Inline>
      </CardHeader>
      <CardContent spacing="md">
        {status === 'idle' ? (
          <PanelMessage>
            {t('idleHint', { min: SIMILARITY_MIN_QUESTION_TEXT_LENGTH })}
          </PanelMessage>
        ) : null}

        {status === 'loading' ? (
          <PanelMessage>
            {t('loadingHint')}
          </PanelMessage>
        ) : null}

        {status === 'error' ? (
          <Stack gap={2}>
            <BodyText size="sm" weight="semibold">
              {toastMessages.similarity.searchFailedTitle}
            </BodyText>
            {error ? (
              <BodyText size="sm" tone="muted">
                {error}
              </BodyText>
            ) : null}
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="sm"
              onClick={onRunSearch}
              disabled={disabled || !canSearch}
            >
              <Icon size="sm">
                <Search />
              </Icon>
              {t('rerunSearch')}
            </Button>
          </Stack>
        ) : null}

        {status === 'success' && matches.length === 0 ? (
          <PanelMessage>
            {toastMessages.similarity.noMatches}
          </PanelMessage>
        ) : null}

        {status === 'success'
          ? matches.map((match) => (
              <SimilarMatchRow key={match.question.id} match={match} />
            ))
          : null}
      </CardContent>
    </Card>
  )
}

function SignalTile({ label, value }: { label: string; value: number }) {
  return (
    <MetricPanel tone="elevated" label={label} value={value} valueSize="default" />
  )
}

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <SurfaceTile padding="lg">
      <BodyText size="sm">{children}</BodyText>
    </SurfaceTile>
  )
}

function SimilarMatchRow({ match }: { match: SimilarQuestionMatch }) {
  const t = useTranslations('questions.similarity')
  const sharedLabels = useSharedLabels()
  const taxonomy = [
    match.question.role,
    match.question.category,
    match.question.subcategory,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <SurfaceTile>
      <Stack gap={4}>
        <Inline gap={3} align="start" justify="between">
          <Stack gap={3}>
            <Inline gap={2} wrap="wrap">
              <StatusPill tone={match.question.difficulty}>
                {sharedLabels.difficulty(match.question.difficulty)}
              </StatusPill>
              <StatusPill tone="neutral">
                {t('matchScore', { score: `${Math.round(match.score * 100)}%` })}
              </StatusPill>
            </Inline>

            <Stack gap={1.5}>
              <BodyText size="sm" weight="semibold" tone="foreground">
                {truncateText(match.question.questionText)}
              </BodyText>
              <BodyText size="sm">{taxonomy || t('noTaxonomy')}</BodyText>
            </Stack>
          </Stack>

          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            asChild
          >
            <Link href={routes.questions.detail(match.question.id)}>{t('openQuestion')}</Link>
          </Button>
        </Inline>

        {match.reasons.length > 0 ? (
          <Inline gap={2} wrap="wrap">
            {match.reasons.map((reason) => (
              <EyebrowBadge key={reason} tone="muted" casing="normal">
                {reason}
              </EyebrowBadge>
            ))}
          </Inline>
        ) : null}
      </Stack>
    </SurfaceTile>
  )
}
