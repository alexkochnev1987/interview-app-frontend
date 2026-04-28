import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { StatusPill } from '@/components/app/status-pill';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Interview } from '@/lib/api';
import {
  formatInterviewDate,
  formatInterviewStatusLabel,
  getCandidateInitials,
} from '@/lib/interview-formatters';

interface InterviewCardProps {
  interview: Interview;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  return (
    <Link href={`/interviews/${interview.id}`} className="group no-underline">
      <Card className="h-full border-white/65 bg-white/88 transition-transform duration-200 hover:-translate-y-1 hover:shadow-float">
        <CardHeader className="gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-[1.2rem] bg-[hsl(var(--primary-fixed)/0.9)] text-sm font-semibold text-[hsl(var(--primary))]">
                {getCandidateInitials(interview.candidateName)}
              </div>
              <div>
                <CardTitle className="text-lg tracking-[-0.03em]">{interview.candidateName}</CardTitle>
                <CardDescription>{interview.position}</CardDescription>
              </div>
            </div>
            <StatusPill tone={interview.status}>{formatInterviewStatusLabel(interview.status)}</StatusPill>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[1rem] bg-[hsl(var(--surface-low)/0.85)] p-3 ring-1 ring-border/45">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Questions
              </div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
                {interview.questions.length}
              </div>
            </div>
            <div className="rounded-[1rem] bg-[hsl(var(--surface-low)/0.85)] p-3 ring-1 ring-border/45">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Uploaded
              </div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
                {interview.answers.filter((answer) => answer.status === 'submitted').length}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Updated {formatInterviewDate(interview.updatedAt)}</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground transition-transform group-hover:translate-x-0.5">
              Open
              <ArrowRight className="size-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
