'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, LoaderCircle, PenSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SurfaceCard } from '@/components/app/surface-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getQuestion,
  updateQuestion,
  type Question,
  type QuestionInput,
} from '@/lib/api';
import { QuestionEditor } from '../question-editor';

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getQuestion(id);
        if (!cancelled) {
          setQuestion(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load question.',
          );
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(value: QuestionInput) {
    const updated = await updateQuestion(id, value);
    setQuestion(updated);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="container py-10 md:py-12">
        <SurfaceCard tone="glassFloat">
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-5 px-8 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-[1.6rem] bg-[hsl(var(--surface-low)/0.95)] text-[hsl(var(--primary))] ring-1 ring-border/45">
              <LoaderCircle className="size-5 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                Loading question
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Pulling the saved prompt, rubric, and metadata into the unified editor.
              </p>
            </div>
          </CardContent>
        </SurfaceCard>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="container py-10 md:py-12">
        <SurfaceCard tone="glassFloat">
          <CardHeader className="space-y-4">
            <div className="flex size-14 items-center justify-center rounded-[1.6rem] bg-destructive/10 text-destructive ring-1 ring-destructive/30">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl tracking-[-0.04em]">Question unavailable</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6">
                The editor could not load this question, so the route stops here instead of
                rendering a partially broken form.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert variant="destructive">
              <AlertTitle>Load failed</AlertTitle>
              <AlertDescription>{error ?? 'Question not found.'}</AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gradient">
                <Link href="/questions">
                  <ArrowLeft className="size-4" />
                  Back to Question Library
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-white/80">
                <Link href="/questions/new">
                  <PenSquare className="size-4" />
                  Create New Question
                </Link>
              </Button>
            </div>
          </CardContent>
        </SurfaceCard>
      </main>
    );
  }

  return (
    <QuestionEditor
      questionId={id}
      title="Edit Question"
      initialValue={{
        externalId: question.externalId,
        role: question.role,
        focus: question.focus,
        outputLanguage: question.outputLanguage,
        category: question.category,
        subcategory: question.subcategory,
        questionText: question.questionText,
        followUpQuestions: question.followUpQuestions,
        expectedConcepts: question.expectedConcepts,
        redFlags: question.redFlags,
        difficulty: question.difficulty,
        weight: question.weight,
        sampleGoodAnswer: question.sampleGoodAnswer,
        minimumPassScore: question.minimumPassScore,
        tags: question.tags,
        metadata: question.metadata,
      }}
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
    />
  );
}
