'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
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
import {
  type SimilarStatus,
  type SimilaritySignalSummary,
} from '@/lib/question-editor/parsers'
import { useNotifyErrorOnce } from '@/hooks/use-notify-once'
import { TOAST_MESSAGES } from '@/lib/toast-messages'
import { truncateText } from '@/lib/text'

interface SimilarityPanelProps {
  status: SimilarStatus
  matches: SimilarQuestionMatch[]
  error: string | null
  signalSummary: SimilaritySignalSummary
  hasInput: boolean
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
  hasInput,
  resultsStale,
  isEditMode,
  disabled,
  onRunSearch,
}: SimilarityPanelProps) {
  useNotifyErrorOnce({
    value: status === 'error' ? error : null,
    toastId: 'similarity-search-error',
    message: TOAST_MESSAGES.similarity.searchFailedTitle,
    description: error ?? undefined,
  })

  return (
    <Card variant="surface">
      <CardHeader spacing="lg">
        <Stack gap={1.5}>
          <CardTitle size="lg">Similar questions</CardTitle>
          <CardDescription>
            Check for duplicates and near-duplicates against the current library
            before you save a new prompt or update an old one.
          </CardDescription>
        </Stack>

        <Grid columns={3} gap={3}>
          <SignalTile label="Prompt" value={signalSummary.textTokenCount} />
          <SignalTile label="Tags" value={signalSummary.tagCount} />
          <SignalTile label="Rubric" value={signalSummary.conceptCount} />
        </Grid>

        <Inline gap={2} align="center" justify="between" wrap="wrap">
          <Inline gap={2} align="center" wrap="wrap">
            {resultsStale ? <StatusPill tone="neutral">Needs refresh</StatusPill> : null}
            {isEditMode ? <StatusPill tone="neutral">Edit mode</StatusPill> : null}
          </Inline>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={onRunSearch}
            disabled={disabled || status === 'loading' || !hasInput}
          >
            <Search className="size-3.5" />
            {status === 'loading' ? 'Searching...' : 'Run search'}
          </Button>
        </Inline>
      </CardHeader>
      <CardContent spacing="md">
        {status === 'idle' ? (
          <PanelMessage>
            Search uses prompt text, taxonomy, tags, and rubric concepts. The library
            is queried via embeddings on the backend.
          </PanelMessage>
        ) : null}

        {status === 'loading' ? (
          <PanelMessage>
            Comparing the current draft with the stored question library.
          </PanelMessage>
        ) : null}

        {status === 'success' && matches.length === 0 ? (
          <PanelMessage>
            {TOAST_MESSAGES.similarity.noMatches}
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
                {match.question.difficulty}
              </StatusPill>
              <StatusPill tone="neutral">
                {Math.round(match.score * 100)}% match
              </StatusPill>
            </Inline>

            <Stack gap={1.5}>
              <BodyText size="sm" weight="semibold" tone="foreground">
                {truncateText(match.question.questionText)}
              </BodyText>
              <BodyText size="sm">{taxonomy || 'No taxonomy attached'}</BodyText>
            </Stack>
          </Stack>

          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            asChild
          >
            <Link href={`/questions/${match.question.id}`}>Open</Link>
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
