'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { SurfaceTile } from '@/components/app/surface-tile'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type SimilarQuestionMatch } from '@/lib/api'
import {
  type SimilarStatus,
  type SimilaritySignalSummary,
} from '@/lib/question-editor/parsers'
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
  return (
    <Card variant="surface">
      <CardHeader spacing="lg">
        <div className="space-y-1.5">
          <CardTitle size="lg">Similar questions</CardTitle>
          <CardDescription>
            Check for duplicates and near-duplicates against the current library
            before you save a new prompt or update an old one.
          </CardDescription>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SignalTile label="Prompt" value={signalSummary.textTokenCount} />
          <SignalTile label="Tags" value={signalSummary.tagCount} />
          <SignalTile label="Rubric" value={signalSummary.conceptCount} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resultsStale ? <StatusPill tone="neutral">Needs refresh</StatusPill> : null}
          {isEditMode ? <StatusPill tone="neutral">Edit mode</StatusPill> : null}
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="sm"
            onClick={onRunSearch}
            disabled={disabled || status === 'loading' || !hasInput}
            className="ml-auto"
          >
            <Search className="size-3.5" />
            {status === 'loading' ? 'Searching...' : 'Run search'}
          </Button>
        </div>
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

        {status === 'error' && error ? (
          <Alert variant="danger">
            <AlertTitle>Similarity search failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {status === 'success' && matches.length === 0 ? (
          <PanelMessage>
            No close matches crossed the current similarity threshold.
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
      <p className="text-sm leading-6 text-muted-foreground">{children}</p>
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
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={match.question.difficulty}>
              {match.question.difficulty}
            </StatusPill>
            <StatusPill tone="neutral">
              {Math.round(match.score * 100)}% match
            </StatusPill>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold leading-6 text-foreground">
              {truncateText(match.question.questionText)}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {taxonomy || 'No taxonomy attached'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline-pill"
          shape="pill"
          size="sm"
          asChild
        >
          <Link href={`/questions/${match.question.id}`}>Open</Link>
        </Button>
      </div>

      {match.reasons.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {match.reasons.map((reason) => (
            <EyebrowBadge key={reason} tone="muted" casing="normal">
              {reason}
            </EyebrowBadge>
          ))}
        </div>
      ) : null}
    </SurfaceTile>
  )
}
