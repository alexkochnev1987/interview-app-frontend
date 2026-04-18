'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
      <div className="page-container">
        <div className="loading">Loading question...</div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="page-container">
        <div className="error-message">{error ?? 'Question not found.'}</div>
        <Link href="/questions" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <QuestionEditor
      title="Edit Question"
      positionHint=""
      initialValue={{
        text: question.text,
        expectedConcepts: question.expectedConcepts,
        redFlags: question.redFlags,
        difficulty: question.difficulty,
        weight: question.weight,
      }}
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
    />
  );
}
