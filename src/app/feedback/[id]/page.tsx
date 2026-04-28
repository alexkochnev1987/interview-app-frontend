'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { FeedbackCategoryGrid } from '@/components/feedback/feedback-category-grid';
import { FeedbackHero } from '@/components/feedback/feedback-hero';
import { FeedbackInsights } from '@/components/feedback/feedback-insights';
import { FeedbackSnapshot } from '@/components/feedback/feedback-snapshot';
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
      <main className="container py-12">
        <Alert variant="destructive" className="mx-auto max-w-4xl border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Feedback unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!feedback) {
    return (
      <main className="container py-12">
        <LoadingStateCard className="mx-auto max-w-4xl" label="Loading feedback..." />
      </main>
    );
  }

  return (
    <main className="container space-y-8 py-10 md:py-12">
      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <FeedbackHero feedback={feedback} />
        <FeedbackSnapshot feedback={feedback} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {feedback.categoryScores ? <FeedbackCategoryGrid categoryScores={feedback.categoryScores} /> : null}
        <FeedbackInsights feedback={feedback} />
      </section>
    </main>
  );
}
