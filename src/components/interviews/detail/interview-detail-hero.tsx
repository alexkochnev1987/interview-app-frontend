import { ArrowLeft, CheckCircle2, CircleDashed, Layers3, Sparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { SurfaceCard } from '@/components/app/surface-card';
import { InterviewDetailHeroGrid } from '@/components/layout/grid-layouts';
import { ActionRow, SectionCardTitle } from '@/components/layout/content-presets';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatWorkflowStage } from '@/features/interviews/detail-formatters';
import type { Interview, InterviewResult } from '@/lib/api';
import { formatInterviewDate, formatInterviewStatusLabel, getCandidateInitials } from '@/lib/interview-formatters';

interface InterviewDetailHeroProps {
  interview: Interview;
  results: InterviewResult | null;
  completing: boolean;
  isTerminal: boolean;
  canComplete: boolean;
  onComplete: () => void;
  answeredCount: number;
  totalQuestions: number;
  progressValue: number;
}

export function InterviewDetailHero({
  interview,
  results,
  completing,
  isTerminal,
  canComplete,
  onComplete,
  answeredCount,
  totalQuestions,
  progressValue,
}: InterviewDetailHeroProps) {
  return (
    <InterviewDetailHeroGrid>
      <SurfaceCard tone="glassFloat">
        <CardContent className="space-y-8 px-8 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--surface-low)/0.9)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground ring-1 ring-border/50"
              >
                <ArrowLeft className="size-3.5" />
                Back to dashboard
              </a>

              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-[1.4rem] bg-[hsl(var(--primary-fixed)/0.9)] text-lg font-semibold text-[hsl(var(--primary))]">
                  {getCandidateInitials(interview.candidateName)}
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                    {interview.candidateName}
                  </h1>
                  <p className="text-base text-muted-foreground md:text-lg">{interview.position}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusPill tone={interview.status}>{formatInterviewStatusLabel(interview.status)}</StatusPill>
                <StatusPill tone="neutral">Created {formatInterviewDate(interview.createdAt)}</StatusPill>
              </div>
            </div>

            <ActionRow>
              {!isTerminal ? (
                <Button
                  type="button"
                  onClick={onComplete}
                  disabled={!canComplete || completing}
                  variant="gradient"
                >
                  {completing
                    ? 'Completing...'
                    : interview.status === 'processing'
                      ? 'Processing...'
                      : 'Complete Interview'}
                </Button>
              ) : null}
            </ActionRow>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricPanel
              label="Questions"
              value={totalQuestions}
              valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground"
            />
            <MetricPanel
              label="Uploaded"
              value={answeredCount}
              valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground"
            />
            <MetricPanel
              label="Overall score"
              value={results ? results.overallScore : '--'}
              valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground"
            />
          </div>
        </CardContent>
      </SurfaceCard>

      <SurfaceCard tone="mutedSoft">
        <CardHeader>
          <EyebrowBadge icon={<Sparkles className="size-3.5" />} tone="muted">
            Interview progress
          </EyebrowBadge>
          <SectionCardTitle>Answer packet status</SectionCardTitle>
          <CardDescription className="text-sm leading-6">
            Recruiter-side review stays anchored to upload completion first, then shifts into
            scoring once the packet is fully assembled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-[1.5rem] bg-white/80 p-5 ring-1 ring-border/45">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">Completion</span>
              <StatusPill tone="neutral">{progressValue}%</StatusPill>
            </div>
            <Progress value={progressValue} className="h-2.5 rounded-full bg-white" />
            <p className="text-sm leading-6 text-muted-foreground">
              {answeredCount} of {totalQuestions} answers uploaded.
            </p>
          </div>

          <div className="space-y-3 rounded-[1.5rem] bg-white/80 p-5 ring-1 ring-border/45">
            <div className="flex items-center gap-2 text-foreground">
              {canComplete ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <CircleDashed className="size-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">Ready state</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {canComplete
                ? 'All answers are in place. You can send the packet for scoring now.'
                : 'Scoring stays locked until every question has an uploaded answer.'}
            </p>
          </div>

          {results ? (
            <div className="space-y-3 rounded-[1.5rem] bg-white/80 p-5 ring-1 ring-border/45">
              <div className="flex items-center gap-2 text-foreground">
                <Layers3 className="size-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium">Results summary</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{results.summary}</p>
            </div>
          ) : null}

          {interview.workflow ? (
            <div className="space-y-3 rounded-[1.5rem] bg-white/80 p-5 ring-1 ring-border/45">
              <div className="flex items-center gap-2 text-foreground">
                <Layers3 className="size-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium">Workflow</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Status: <strong>{interview.workflow.status.replace('_', ' ')}</strong>
                {interview.workflow.currentStage
                  ? ` • stage: ${formatWorkflowStage(interview.workflow.currentStage)}`
                  : ''}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Last update {new Date(interview.workflow.lastUpdatedAt).toLocaleString()}
              </p>
              {interview.workflow.errorMessage ? (
                <p className="text-sm leading-6 text-destructive">{interview.workflow.errorMessage}</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </SurfaceCard>
    </InterviewDetailHeroGrid>
  );
}
