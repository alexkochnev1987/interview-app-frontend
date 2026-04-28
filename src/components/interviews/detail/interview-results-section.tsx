import { FileVideo2 } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { SurfaceCard } from '@/components/app/surface-card';
import { SectionHeaderRow } from '@/components/layout/grid-layouts';
import { StatusPill } from '@/components/app/status-pill';
import { CardContent } from '@/components/ui/card';
import type { InterviewResult } from '@/lib/api';

interface InterviewResultsSectionProps {
  results: InterviewResult;
}

export function InterviewResultsSection({ results }: InterviewResultsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeaderRow>
        <div className="space-y-2">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Scorecard
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Interview results</h2>
        </div>
        <div className="text-sm leading-6 text-muted-foreground">
          Candidate feedback remains a tokenized route shared separately from the recruiter UI.
        </div>
      </SectionHeaderRow>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <SurfaceCard tone="glassSoft">
          <CardContent className="space-y-5 px-8 py-8">
            <EyebrowBadge icon={<FileVideo2 className="size-3.5" />} tone="primary">
              Overall score
            </EyebrowBadge>
            <div className="text-6xl font-semibold tracking-[-0.06em] text-[hsl(var(--primary))]">
              {results.overallScore}
            </div>
            <p className="text-sm leading-7 text-muted-foreground">{results.summary}</p>
            <div className="flex flex-wrap gap-2">
              {results.decision ? <StatusPill tone="neutral">{results.decision}</StatusPill> : null}
              {results.trustScore !== undefined ? (
                <StatusPill tone="neutral">trust {results.trustScore}</StatusPill>
              ) : null}
              {results.rubricVersion ? <StatusPill tone="neutral">{results.rubricVersion}</StatusPill> : null}
            </div>
            {results.trustFlags?.length ? (
              <p className="text-sm leading-7 text-muted-foreground">Flags: {results.trustFlags.join(', ')}</p>
            ) : null}
          </CardContent>
        </SurfaceCard>

        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(results.categoryScores).map(([category, score]) => (
            <SurfaceCard key={category} tone="glassSoft">
              <CardContent className="space-y-3 px-6 py-6 text-center">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {category}
                </div>
                <div className="text-4xl font-semibold tracking-[-0.05em] text-[hsl(var(--primary))]">
                  {score}
                </div>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </CardContent>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </section>
  );
}
