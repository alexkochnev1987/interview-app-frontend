import Link from 'next/link';

import { StatusPill } from '@/components/app/status-pill';
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card';
import { SurfaceCard } from '@/components/app/surface-card';
import { SectionCardTitle } from '@/components/layout/content-presets';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Question } from '@/lib/api';
import { cn } from '@/lib/utils';

import { SelectedPacketPreview } from './selected-packet-preview';

interface QuestionSelectorProps {
  questions: Question[];
  selectedQuestionIds: string[];
  loadingQuestions: boolean;
  submitting: boolean;
  onToggleQuestion: (id: string) => void;
}

export function QuestionSelector({
  questions,
  selectedQuestionIds,
  loadingQuestions,
  submitting,
  onToggleQuestion,
}: QuestionSelectorProps) {
  const selectedQuestions = questions.filter((question) => selectedQuestionIds.includes(question.id));

  return (
    <SurfaceCard tone="glassSoft">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <SectionCardTitle>Question selection</SectionCardTitle>
          <CardDescription className="text-sm leading-6">
            Pick the prompts that actually differentiate the candidate.
          </CardDescription>
        </div>
        <StatusPill tone="neutral">{selectedQuestionIds.length} selected</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingQuestions ? (
          <LoadingStateCard
            className="border-none bg-transparent shadow-none"
            label="Loading question bank..."
          />
        ) : questions.length === 0 ? (
          <EmptyStateCard
            className="border-none bg-transparent shadow-none"
            title="No saved questions yet"
            description="Create the first reusable prompt before you assemble an interview packet."
            action={
              <Button asChild variant="gradient">
                <Link href="/questions/new">Create your first question</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {questions.map((question) => {
              const selected = selectedQuestionIds.includes(question.id);

              return (
                <label
                  key={question.id}
                  className={cn(
                    'flex cursor-pointer gap-4 rounded-[1.5rem] p-4 transition-all ring-1',
                    selected
                      ? 'bg-[hsl(var(--primary-fixed)/0.86)] ring-[hsl(var(--primary)/0.24)] shadow-soft'
                      : 'bg-[hsl(var(--surface-low)/0.75)] ring-border/45 hover:bg-[hsl(var(--surface-low))]',
                  )}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleQuestion(question.id)}
                    disabled={submitting}
                    className="mt-1"
                  />

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                      {question.category ? (
                        <StatusPill tone="neutral_meta">
                          {question.category}
                        </StatusPill>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-base font-semibold tracking-[-0.02em] text-foreground">
                        {question.questionText}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {question.role ? `${question.role} · ` : ''}
                        weight {question.weight}
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm md:grid-cols-2">
                      <div>
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Concepts
                        </div>
                        <p className="mt-2 leading-6 text-muted-foreground">
                          {question.expectedConcepts.length > 0
                            ? question.expectedConcepts.map((item) => item.label).join(', ')
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Red flags
                        </div>
                        <p className="mt-2 leading-6 text-muted-foreground">
                          {question.redFlags.length > 0
                            ? question.redFlags.map((item) => item.label).join(', ')
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <SelectedPacketPreview selectedQuestions={selectedQuestions} />
      </CardContent>
    </SurfaceCard>
  );
}
