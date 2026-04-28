import { ChartColumnBig } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { SurfaceCard } from '@/components/app/surface-card';
import { SectionCardTitle } from '@/components/layout/content-presets';
import { CardContent, CardHeader } from '@/components/ui/card';

interface FeedbackCategoryGridProps {
  categoryScores: Record<string, number>;
}

export function FeedbackCategoryGrid({ categoryScores }: FeedbackCategoryGridProps) {
  return (
    <SurfaceCard tone="glassSoft">
      <CardHeader>
        <EyebrowBadge icon={<ChartColumnBig className="size-3.5" />} tone="primary">
          Category scores
        </EyebrowBadge>
        <SectionCardTitle>Breakdown</SectionCardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {Object.entries(categoryScores).map(([category, score]) => (
          <MetricPanel
            key={category}
            tone="surface"
            label={category}
            value={score}
            valueClassName="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[hsl(var(--primary))]"
            description="out of 100"
          />
        ))}
      </CardContent>
    </SurfaceCard>
  );
}
