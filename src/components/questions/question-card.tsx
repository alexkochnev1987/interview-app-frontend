import Link from 'next/link';

import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Question } from '@/lib/api';
import { truncateText } from '@/lib/text';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link href={`/questions/${question.id}`} className="group no-underline">
      <Card className="h-full border-white/65 bg-white/88 transition-transform duration-200 hover:-translate-y-1 hover:shadow-float">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
            {question.category ? (
              <StatusPill tone="neutral" className="normal-case tracking-[0.08em]">
                {question.category}
              </StatusPill>
            ) : null}
          </div>
          <div className="space-y-2">
            <CardTitle className="line-clamp-3 text-lg leading-7 tracking-[-0.03em]">
              {truncateText(question.questionText)}
            </CardTitle>
            <CardDescription>
              {question.role ? `${question.role} · ` : ''}
              weight {question.weight}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MetricPanel
              tone="compact"
              label="Concepts"
              value={question.expectedConcepts.length}
              valueClassName="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground"
            />
            <MetricPanel
              tone="compact"
              label="Red flags"
              value={question.redFlags.length}
              valueClassName="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground"
            />
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Expected concepts
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {question.expectedConcepts.length > 0
                  ? question.expectedConcepts
                      .slice(0, 3)
                      .map((item) => item.label)
                      .join(', ')
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Red flag signals
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {question.redFlags.length > 0
                  ? question.redFlags
                      .slice(0, 2)
                      .map((item) => item.label)
                      .join(', ')
                  : 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
