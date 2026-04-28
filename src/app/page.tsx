'use client';
import { Sparkles } from 'lucide-react';

import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DashboardSnapshot } from '@/components/dashboard/dashboard-snapshot';
import { InterviewsGrid } from '@/components/dashboard/interviews-grid';
import { DashboardHeroGrid } from '@/components/layout/grid-layouts';
import { PageMainWideGap } from '@/components/layout/page-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDashboardMetrics } from '@/features/dashboard/dashboard-metrics';
import { useDashboardInterviews } from '@/features/dashboard/use-dashboard-interviews';

export default function DashboardPage() {
  const { interviews, loading, error, usingMock } = useDashboardInterviews();
  const { activeCount, completedCount, questionVolume } = getDashboardMetrics(interviews);

  return (
    <PageMainWideGap>
      <DashboardHeroGrid>
        <DashboardHero
          activeCount={activeCount}
          candidatesCount={interviews.length}
          questionVolume={questionVolume}
        />
        <DashboardSnapshot completedCount={completedCount} loading={loading} usingMock={usingMock} />
      </DashboardHeroGrid>

      {usingMock && (
        <Alert variant="warning">
          <Sparkles className="size-4" />
          <AlertTitle>Demo data enabled</AlertTitle>
          <AlertDescription>
            {error ?? 'The API did not respond, so the dashboard is showing fallback interviews.'}
          </AlertDescription>
        </Alert>
      )}

      <InterviewsGrid interviews={interviews} loading={loading} />
    </PageMainWideGap>
  );
}
