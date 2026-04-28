import Link from 'next/link';
import { Search } from 'lucide-react';

import { SurfaceCard } from '@/components/app/surface-card';
import { SectionCardTitle } from '@/components/layout/content-presets';
import { StatusPill } from '@/components/app/status-pill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import type { SimilarQuestionMatch } from '@/lib/api';
import { truncateText } from '@/lib/text';

interface SimilaritySignalSummary {
  conceptCount: number;
  tagCount: number;
  taxonomyCount: number;
  textTokenCount: number;
}

interface QuestionEditorSimilarPanelProps {
  summary: SimilaritySignalSummary;
  similarResultsStale: boolean;
  questionId?: string;
  handleFindSimilar: () => void;
  submitting: boolean;
  similarStatus: 'idle' | 'loading' | 'success' | 'error';
  hasSimilarityInput: boolean;
  similarError: string | null;
  similarQuestions: SimilarQuestionMatch[];
}

export function QuestionEditorSimilarPanel({
  summary,
  similarResultsStale,
  questionId,
  handleFindSimilar,
  submitting,
  similarStatus,
  hasSimilarityInput,
  similarError,
  similarQuestions,
}: QuestionEditorSimilarPanelProps) {
  return (
    <SurfaceCard tone="glassSoft">
      <CardHeader className="space-y-5">
        <div className="space-y-1.5">
          <SectionCardTitle>Similar questions</SectionCardTitle>
          <CardDescription className="text-sm leading-6">
            Check for duplicates and near-duplicates against the current library before you save a
            new prompt or update an old one.
          </CardDescription>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.2rem] bg-[hsl(var(--surface-low)/0.9)] p-3 ring-1 ring-border/45">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Prompt
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              {summary.textTokenCount}
            </div>
          </div>
          <div className="rounded-[1.2rem] bg-[hsl(var(--surface-low)/0.9)] p-3 ring-1 ring-border/45">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tags
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              {summary.tagCount}
            </div>
          </div>
          <div className="rounded-[1.2rem] bg-[hsl(var(--surface-low)/0.9)] p-3 ring-1 ring-border/45">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Rubric
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
              {summary.conceptCount}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {similarResultsStale ? <StatusPill tone="neutral">Needs refresh</StatusPill> : null}
          {questionId ? <StatusPill tone="neutral">Edit mode</StatusPill> : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFindSimilar}
            disabled={submitting || similarStatus === 'loading' || !hasSimilarityInput}
            className="ml-auto rounded-full bg-white/80"
          >
            <Search className="size-3.5" />
            {similarStatus === 'loading' ? 'Searching...' : 'Run search'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {similarStatus === 'idle' ? (
          <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-5 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
            Search uses prompt text, taxonomy, tags, and rubric concepts. Keep the heuristic
            lightweight for now; we can swap it to embeddings later when the backend endpoint lands.
          </div>
        ) : null}

        {similarStatus === 'loading' ? (
          <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-5 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
            Comparing the current draft with the stored question library.
          </div>
        ) : null}

        {similarStatus === 'error' && similarError ? (
          <Alert variant="destructive">
            <AlertTitle>Similarity search failed</AlertTitle>
            <AlertDescription>{similarError}</AlertDescription>
          </Alert>
        ) : null}

        {similarStatus === 'success' && similarQuestions.length === 0 ? (
          <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-5 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
            No close matches crossed the current similarity threshold.
          </div>
        ) : null}

        {similarQuestions.map((match) => (
          <div
            key={match.question.id}
            className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.82)] p-4 ring-1 ring-border/45"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={match.question.difficulty}>{match.question.difficulty}</StatusPill>
                  <StatusPill tone="neutral">{Math.round(match.score * 100)}% match</StatusPill>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-semibold leading-6 text-foreground">
                    {truncateText(match.question.questionText)}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {[match.question.role, match.question.category, match.question.subcategory]
                      .filter(Boolean)
                      .join(' / ') || 'No taxonomy attached'}
                  </p>
                </div>
              </div>

              <Button type="button" variant="outline" size="sm" asChild className="rounded-full bg-white/80">
                <Link href={`/questions/${match.question.id}`}>Open</Link>
              </Button>
            </div>

            {match.reasons.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {match.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="inline-flex rounded-full bg-white/85 px-3 py-1 text-[0.72rem] font-medium leading-5 text-muted-foreground ring-1 ring-border/50"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </SurfaceCard>
  );
}
