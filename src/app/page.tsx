'use client';
import { Sparkles } from 'lucide-react';

import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DashboardSnapshot } from '@/components/dashboard/dashboard-snapshot';
import { InterviewsGrid } from '@/components/dashboard/interviews-grid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDashboardMetrics } from '@/features/dashboard/dashboard-metrics';
import { useDashboardInterviews } from '@/features/dashboard/use-dashboard-interviews';

export default function DashboardPage() {
  const { interviews, loading, error, usingMock } = useDashboardInterviews();
  const { activeCount, completedCount, questionVolume } = getDashboardMetrics(interviews);

  return (
    <main className="container space-y-8 py-10 md:space-y-10 md:py-12">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <DashboardHero
          activeCount={activeCount}
          candidatesCount={interviews.length}
          questionVolume={questionVolume}
        />
        <DashboardSnapshot completedCount={completedCount} loading={loading} usingMock={usingMock} />
      </section>

      {usingMock && (
        <Alert className="border-amber-200/70 bg-amber-50/80 text-amber-950">
          <Sparkles className="size-4" />
          <AlertTitle>Demo data enabled</AlertTitle>
          <AlertDescription>
            {error ?? 'The API did not respond, so the dashboard is showing fallback interviews.'}
          </AlertDescription>
        </Alert>
      )}

      <InterviewsGrid interviews={interviews} loading={loading} />
    </main>
  );
}
