import Link from 'next/link';
import { ArrowRight, CircleDashed, Layers3, Sparkles, Users } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { ActionRow, HeroDescription, HeroTitle } from '@/components/layout/content-presets';
import { HeaderSplitRow, MetricsThreeUpGrid } from '@/components/layout/grid-layouts';
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
        <HeaderSplitRow>
          <div className="max-w-2xl space-y-4">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Recruiter Dashboard</EyebrowBadge>
            <div className="space-y-3">
              <HeroTitle>Run your interview pipeline from one editorial command surface.</HeroTitle>
              <HeroDescription>
                Monitor active sessions, spot stalled candidates, and keep scoring flows moving
                without dropping into separate admin tools.
              </HeroDescription>
            </div>
          </div>

          <ActionRow>
            <Button asChild variant="gradient">
              <Link href="/interviews/new">
                New Interview
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline-soft">
              <Link href="/questions">Question Bank</Link>
            </Button>
          </ActionRow>
        </HeaderSplitRow>

        <MetricsThreeUpGrid>
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
        </MetricsThreeUpGrid>
      </CardContent>
    </Card>
  );
}
