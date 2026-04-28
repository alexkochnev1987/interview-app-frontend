import Link from 'next/link';
import { ArrowRight, CircleDashed, Layers3, Sparkles, Users } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardHeroProps {
  activeCount: number;
  candidatesCount: number;
  questionVolume: number;
}

export function DashboardHero({ activeCount, candidatesCount, questionVolume }: DashboardHeroProps) {
  return (
    <Card className="overflow-hidden border-white/65 bg-white/86 shadow-float backdrop-blur-xl">
      <CardContent className="flex h-full flex-col gap-8 px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-4">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Recruiter Dashboard</EyebrowBadge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                Run your interview pipeline from one editorial command surface.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Monitor active sessions, spot stalled candidates, and keep scoring flows moving
                without dropping into separate admin tools.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105">
              <Link href="/interviews/new">
                New Interview
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-white/70 backdrop-blur-sm">
              <Link href="/questions">Question Bank</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricPanel
            icon={<CircleDashed className="size-4" />}
            label="Active"
            value={activeCount}
            valueClassName="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground"
            description="Interviews currently waiting on answers, uploads, or scoring."
          />
          <MetricPanel
            icon={<Users className="size-4" />}
            label="Candidates"
            value={candidatesCount}
            valueClassName="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground"
            description="Total candidate records visible in the current workspace."
          />
          <MetricPanel
            icon={<Layers3 className="size-4" />}
            label="Question Load"
            value={questionVolume}
            valueClassName="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground"
            description="Questions currently attached across all visible interviews."
          />
        </div>
      </CardContent>
    </Card>
  );
}
