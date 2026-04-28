import { BadgeCheck, Target } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { SurfaceCard } from '@/components/app/surface-card';
import { SectionCardTitle } from '@/components/layout/content-presets';
import { CardContent, CardHeader } from '@/components/ui/card';
import type { Feedback } from '@/features/feedback/types';

interface FeedbackInsightsProps {
  feedback: Feedback;
}

export function FeedbackInsights({ feedback }: FeedbackInsightsProps) {
  return (
    <div className="space-y-6">
      {feedback.generalFeedback ? (
        <SurfaceCard tone="glassSoft">
          <CardHeader>
            <EyebrowBadge icon={<BadgeCheck className="size-3.5" />}>Feedback</EyebrowBadge>
            <SectionCardTitle>What went well</SectionCardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{feedback.generalFeedback}</p>
          </CardContent>
        </SurfaceCard>
      ) : null}

      {feedback.improvements ? (
        <SurfaceCard tone="glassSoft">
          <CardHeader>
            <EyebrowBadge icon={<Target className="size-3.5" />}>Recommendations</EyebrowBadge>
            <SectionCardTitle>What to improve next</SectionCardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{feedback.improvements}</p>
          </CardContent>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
