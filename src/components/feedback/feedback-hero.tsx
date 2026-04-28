import { Sparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { StatusPill } from '@/components/app/status-pill';
import { Card, CardContent } from '@/components/ui/card';
import { resultTone } from '@/features/feedback/result-tone';
import type { Feedback } from '@/features/feedback/types';

interface FeedbackHeroProps {
  feedback: Feedback;
}

export function FeedbackHero({ feedback }: FeedbackHeroProps) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-float">
      <CardContent className="space-y-6 px-8 py-8">
        <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Interview feedback</EyebrowBadge>

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
            Your interview summary
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            This page shares the reviewed outcome for the <strong>{feedback.position}</strong>{' '}
            interview and highlights both strengths and next areas to improve.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {feedback.overallResult ? (
            <StatusPill tone={resultTone(feedback.overallResult)}>
              {feedback.overallResult.replace('_', ' ')}
            </StatusPill>
          ) : null}
          <StatusPill tone="neutral">Reviewed {new Date(feedback.date).toLocaleDateString()}</StatusPill>
        </div>
      </CardContent>
    </Card>
  );
}
