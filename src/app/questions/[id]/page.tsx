'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, LoaderCircle, PenSquare, RotateCcw, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  deleteQuestion,
  getQuestion,
  QuestionInUseError,
  restoreQuestion,
  updateQuestion,
  type Question,
  type QuestionInput,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { QuestionEditor } from '../question-editor';

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const { user } = useAuth();
  const canDelete = user?.role === 'super_admin';

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

  async function performRestore() {
    if (restoring) return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const restored = await restoreQuestion(id);
      setQuestion(restored);
      setRestoreOpen(false);
      router.refresh();
    } catch (err) {
      setRestoreError(
        err instanceof Error ? err.message : 'Failed to restore question.',
      );
      setRestoreOpen(false);
    } finally {
      setRestoring(false);
    }
  }

  async function performDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteQuestion(id);
      setConfirmOpen(false);
      router.push('/questions');
      router.refresh();
    } catch (err) {
      if (err instanceof QuestionInUseError) {
        setDeleteError(err.message);
      } else {
        setDeleteError(
          err instanceof Error ? err.message : 'Failed to delete question.',
        );
      }
      setConfirmOpen(false);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="container py-10 md:py-12">
        <Card className="border-white/65 bg-white/88 shadow-float">
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
        </Card>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="container py-10 md:py-12">
        <Card className="border-white/65 bg-white/88 shadow-float">
          <CardHeader className="space-y-4">
            <div className="flex size-14 items-center justify-center rounded-[1.6rem] bg-rose-50 text-rose-600 ring-1 ring-rose-200">
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
            <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
              <AlertTitle>Load failed</AlertTitle>
              <AlertDescription>{error ?? 'Question not found.'}</AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-primary-gradient shadow-soft hover:brightness-105">
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
        </Card>
      </main>
    );
  }

  return (
    <>
      {question.deleted && (
        <section className="container space-y-3 pt-6">
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-rose-200/70 bg-rose-50/85 px-4 py-3 text-sm text-rose-900 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <div className="font-medium">This question is deleted</div>
              <div className="text-rose-900/80">
                Only super admins can see deleted questions. It is hidden from the
                library for everyone else and excluded from new interviews and
                similarity search. Restore it to make it visible again.
              </div>
            </div>
            <Button
              type="button"
              className="rounded-full bg-rose-600 text-white shadow-soft hover:bg-rose-700 md:shrink-0"
              disabled={restoring}
              onClick={() => {
                setRestoreError(null);
                setRestoreOpen(true);
              }}
            >
              {restoring ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              {restoring ? 'Restoring...' : 'Restore question'}
            </Button>
          </div>
          {restoreError && (
            <Alert variant="destructive" className="border-rose-200/70 bg-white/85">
              <AlertTitle>Cannot restore</AlertTitle>
              <AlertDescription>{restoreError}</AlertDescription>
            </Alert>
          )}
        </section>
      )}
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
      {!question.deleted && canDelete && (
        <section className="container pb-12">
          <Card className="border-rose-200/70 bg-rose-50/70 shadow-soft">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl tracking-[-0.03em] text-rose-900">
                Danger zone
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-rose-900/80">
                Deleting hides this question from the library and from new interviews.
                Past interviews keep their snapshot. Active interviews block deletion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deleteError && (
                <Alert variant="destructive" className="border-rose-200/70 bg-white/85">
                  <AlertTitle>Cannot delete</AlertTitle>
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                variant="destructive"
                className="rounded-full"
                disabled={deleting}
                onClick={() => {
                  setDeleteError(null);
                  setConfirmOpen(true);
                }}
              >
                {deleting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {deleting ? 'Deleting...' : 'Delete question'}
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
      <ConfirmDialog
        open={confirmOpen}
        destructive
        title="Delete this question?"
        description="It will be hidden from the library and from new interviews. Past interviews keep their snapshot. Active interviews block deletion."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={performDelete}
        onCancel={() => {
          if (!deleting) setConfirmOpen(false);
        }}
      />
      <ConfirmDialog
        open={restoreOpen}
        title="Restore this question?"
        description="It will become visible in the library again and available for new interviews."
        confirmLabel={restoring ? 'Restoring...' : 'Restore'}
        cancelLabel="Cancel"
        loading={restoring}
        onConfirm={performRestore}
        onCancel={() => {
          if (!restoring) setRestoreOpen(false);
        }}
      />
    </>
  );
}
