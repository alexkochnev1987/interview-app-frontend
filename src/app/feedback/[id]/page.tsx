'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { FeedbackCategoryGrid } from '@/components/feedback/feedback-category-grid';
import { FeedbackHero } from '@/components/feedback/feedback-hero';
import { FeedbackInsights } from '@/components/feedback/feedback-insights';
import { FeedbackSnapshot } from '@/components/feedback/feedback-snapshot';
import { FeedbackBottomGrid, FeedbackTopGrid } from '@/components/layout/grid-layouts';
import { MaxWidth4xl, PageMain, PageMainCompact } from '@/components/layout/page-shell';
import { LoadingStateCard } from '@/components/app/state-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFeedback } from '@/features/feedback/use-feedback';

export default function FeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get('token') || '';
  const { feedback, error } = useFeedback(id, token);

  if (error) {
    return (
      <PageMainCompact>
        <MaxWidth4xl>
          <Alert variant="destructive">
            <AlertTitle>Feedback unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </MaxWidth4xl>
      </PageMainCompact>
    );
  }

  if (!feedback) {
    return (
      <PageMainCompact>
        <MaxWidth4xl>
          <LoadingStateCard label="Loading feedback..." />
        </MaxWidth4xl>
      </PageMainCompact>
    );
  }

  return (
    <PageMain>
      <FeedbackTopGrid>
        <FeedbackHero feedback={feedback} />
        <FeedbackSnapshot feedback={feedback} />
      </FeedbackTopGrid>

      <FeedbackBottomGrid>
        {feedback.categoryScores ? <FeedbackCategoryGrid categoryScores={feedback.categoryScores} /> : null}
        <FeedbackInsights feedback={feedback} />
      </FeedbackBottomGrid>
    </PageMain>
  );
}
