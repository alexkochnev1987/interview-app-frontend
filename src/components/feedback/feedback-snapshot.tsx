import { BadgeCheck, Clock3 } from 'lucide-react';

import { MetricPanel } from '@/components/app/metric-panel';
import { SurfaceCard } from '@/components/app/surface-card';
import { SectionCardTitle } from '@/components/layout/content-presets';
import { TwoUpSmGrid } from '@/components/layout/grid-layouts';
import { CardDescription, CardHeader } from '@/components/ui/card';
import type { Feedback } from '@/features/feedback/types';

interface FeedbackSnapshotProps {
  feedback: Feedback;
}

export function FeedbackSnapshot({ feedback }: FeedbackSnapshotProps) {
  return (
    <SurfaceCard tone="mutedSoft">
      <CardHeader>
        <SectionCardTitle>Snapshot</SectionCardTitle>
        <CardDescription className="text-sm leading-6">
          A compact overview of your current outcome and when this shared link expires.
        </CardDescription>
      </CardHeader>
      <TwoUpSmGrid>
        <MetricPanel
          tone="elevated"
          icon={<BadgeCheck className="size-4" />}
          label="Overall score"
          value={feedback.overallScore ?? '--'}
          valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--primary))]"
        />
        <MetricPanel
          tone="elevated"
          icon={<Clock3 className="size-4" />}
          label="Link expiry"
          value={new Date(feedback.expiresAt).toLocaleDateString()}
          valueClassName="mt-3 text-sm leading-6 text-foreground"
        />
      </TwoUpSmGrid>
    </SurfaceCard>
  );
}
