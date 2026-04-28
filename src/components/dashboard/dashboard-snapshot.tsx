import { BriefcaseBusiness, Clock3 } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardSnapshotProps {
  completedCount: number;
  loading: boolean;
  usingMock: boolean;
}

export function DashboardSnapshot({ completedCount, loading, usingMock }: DashboardSnapshotProps) {
  return (
    <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
      <CardHeader className="space-y-3">
        <EyebrowBadge icon={<BriefcaseBusiness className="size-3.5" />} tone="muted">
          Snapshot
        </EyebrowBadge>
        <CardTitle className="text-2xl tracking-[-0.03em]">Today&apos;s pipeline</CardTitle>
        <CardDescription className="max-w-sm text-sm leading-6">
          The redesigned shell uses tonal layers instead of hard separators, so activity stays
          readable even when the data density grows.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <MetricPanel
          tone="elevated"
          label={
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">Completed interviews</span>
              <StatusPill tone="completed">{completedCount}</StatusPill>
            </div>
          }
          unstyledLabel
          unstyledValue
          value={null}
          valueClassName="mt-0"
          description="Finished sessions with scorecards ready for review and handoff."
        />
        <MetricPanel
          tone="elevated"
          label={
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">Last sync</span>
              <StatusPill tone="neutral">
                <Clock3 className="size-3" />
                {loading ? 'Loading' : 'Live'}
              </StatusPill>
            </div>
          }
          unstyledLabel
          unstyledValue
          value={null}
          valueClassName="mt-0"
          description={
            loading
              ? 'Waiting for the interview feed.'
              : `Updated against ${usingMock ? 'fallback demo data' : 'the live backend'} just now.`
          }
        />
      </CardContent>
    </Card>
  );
}
