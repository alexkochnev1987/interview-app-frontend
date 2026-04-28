import { ChartColumnBig } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeedbackCategoryGridProps {
  categoryScores: Record<string, number>;
}

export function FeedbackCategoryGrid({ categoryScores }: FeedbackCategoryGridProps) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardHeader>
        <EyebrowBadge icon={<ChartColumnBig className="size-3.5" />} tone="primary">
          Category scores
        </EyebrowBadge>
        <CardTitle className="text-2xl tracking-[-0.03em]">Breakdown</CardTitle>
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
    </Card>
  );
}
