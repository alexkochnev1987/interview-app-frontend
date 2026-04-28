import { BadgeCheck, Target } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Feedback } from '@/features/feedback/types';

interface FeedbackInsightsProps {
  feedback: Feedback;
}

export function FeedbackInsights({ feedback }: FeedbackInsightsProps) {
  return (
    <div className="space-y-6">
      {feedback.generalFeedback ? (
        <Card className="border-white/65 bg-white/88 shadow-soft">
          <CardHeader>
            <EyebrowBadge icon={<BadgeCheck className="size-3.5" />}>Feedback</EyebrowBadge>
            <CardTitle className="text-2xl tracking-[-0.03em]">What went well</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{feedback.generalFeedback}</p>
          </CardContent>
        </Card>
      ) : null}

      {feedback.improvements ? (
        <Card className="border-white/65 bg-white/88 shadow-soft">
          <CardHeader>
            <EyebrowBadge icon={<Target className="size-3.5" />}>Recommendations</EyebrowBadge>
            <CardTitle className="text-2xl tracking-[-0.03em]">What to improve next</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{feedback.improvements}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
