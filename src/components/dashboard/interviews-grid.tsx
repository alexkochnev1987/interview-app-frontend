import Link from 'next/link';
import { Users } from 'lucide-react';

import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card';
import { SectionHeaderRow, ThreeColumnCardsGrid } from '@/components/layout/grid-layouts';
import { Button } from '@/components/ui/button';
import type { Interview } from '@/lib/api';

import { InterviewCard } from './interview-card';

interface InterviewsGridProps {
  interviews: Interview[];
  loading: boolean;
}

export function InterviewsGrid({ interviews, loading }: InterviewsGridProps) {
  if (loading) {
    return <LoadingStateCard label="Loading interviews..." />;
  }

  if (interviews.length === 0) {
    return (
      <EmptyStateCard
        icon={<Users className="size-5" />}
        title="No interviews yet"
        description="Start with a candidate, attach questions from the bank, and this dashboard becomes your operating surface."
        action={
          <Button asChild variant="gradient">
            <Link href="/interviews/new">Create your first interview</Link>
          </Button>
        }
      />
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeaderRow>
        <div className="space-y-2">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Active records
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Recent interviews</h2>
        </div>
        <Button asChild variant="outline" className="rounded-full bg-white/70 backdrop-blur-sm">
          <Link href="/questions/new">Create a new question</Link>
        </Button>
      </SectionHeaderRow>

      <ThreeColumnCardsGrid>
        {interviews.map((interview) => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </ThreeColumnCardsGrid>
    </section>
  );
}
