'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DeletedQuestionBanner } from '@/components/questions/detail/deleted-question-banner';
import {
  QuestionLoadingCard,
  QuestionUnavailableCard,
} from '@/components/questions/detail/question-load-states';
import { QuestionDangerZone } from '@/components/questions/detail/question-danger-zone';
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
import { runMutation } from '@/lib/run-mutation';
import { TOAST_MESSAGES } from '@/lib/toast-messages';
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
    return updated;
  }

  async function performRestore() {
    if (restoring) return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const restored = await runMutation(() => restoreQuestion(id), {
        successMessage: TOAST_MESSAGES.question.restoreSuccess,
        errorMessage: TOAST_MESSAGES.question.restoreError,
      });
      setQuestion(restored);
      setRestoreOpen(false);
      router.refresh();
    } catch (err) {
      setRestoreError(null);
    } finally {
      setRestoring(false);
    }
  }

  async function performDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await runMutation(() => deleteQuestion(id), {
        successMessage: TOAST_MESSAGES.question.deleteSuccess,
        errorMessage: TOAST_MESSAGES.question.deleteError,
      });
      setConfirmOpen(false);
      router.push('/questions');
      router.refresh();
    } catch (err) {
      if (err instanceof QuestionInUseError) {
        setDeleteError(err.message);
      } else {
        setDeleteError(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <QuestionLoadingCard />;
  }

  if (error || !question) {
    return <QuestionUnavailableCard message={error ?? 'Question not found.'} />;
  }

  return (
    <>
      {question.deleted && (
        <DeletedQuestionBanner
          restoring={restoring}
          restoreError={restoreError}
          onRestore={() => {
            setRestoreError(null);
            setRestoreOpen(true);
          }}
        />
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
        <QuestionDangerZone
          deleting={deleting}
          deleteError={deleteError}
          onRequestDelete={() => {
            setDeleteError(null);
            setConfirmOpen(true);
          }}
        />
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
