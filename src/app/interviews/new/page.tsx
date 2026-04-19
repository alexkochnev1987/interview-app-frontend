'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { createInterview, fetchQuestions, type Question } from '@/lib/api';

export default function NewInterviewPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        const data = await fetchQuestions();
        if (!cancelled) {
          setQuestions(data);
          setLoadingQuestions(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load questions.',
          );
          setLoadingQuestions(false);
        }
      }
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((current) =>
      current.includes(id)
        ? current.filter((questionId) => questionId !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!candidateName.trim()) {
      setError('Candidate name is required.');
      return;
    }
    if (!position.trim()) {
      setError('Position is required.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setError('Select at least one question.');
      return;
    }

    setSubmitting(true);
    try {
      const interview = await createInterview({
        candidateName: candidateName.trim(),
        position: position.trim(),
        questionIds: selectedQuestionIds,
      });
      router.push(`/interviews/${interview.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create interview.',
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">New Interview</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 960 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="candidateName">
            Candidate Name
          </label>
          <input
            id="candidateName"
            className="form-input"
            type="text"
            value={candidateName}
            onChange={(event) => setCandidateName(event.target.value)}
            placeholder="e.g. Jane Doe"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="position">
            Position
          </label>
          <input
            id="position"
            className="form-input"
            type="text"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '0.75rem',
            }}
          >
            <label className="form-label" style={{ marginBottom: 0 }}>
              Select Questions
            </label>
            <Link href="/questions/new" className="btn btn-outline btn-sm">
              + Create Question
            </Link>
          </div>

          {loadingQuestions ? (
            <div className="loading">Loading question bank...</div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <p>No saved questions yet.</p>
              <Link href="/questions/new" className="btn btn-primary">
                Create your first question
              </Link>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.75rem',
                }}
              >
                Selected: {selectedQuestionIds.length}
              </p>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {questions.map((question) => {
                  const selected = selectedQuestionIds.includes(question.id);

                  return (
                    <label
                      key={question.id}
                      className="card"
                      style={{
                        display: 'block',
                        cursor: 'pointer',
                        border: selected
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleQuestion(question.id)}
                          disabled={submitting}
                          style={{ marginTop: '0.25rem' }}
                        />

                        <div style={{ flex: 1 }}>
                          <div className="card-title">{question.questionText}</div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                              marginBottom: '0.5rem',
                            }}
                          >
                            {question.category && (
                              <span className="badge badge-processing">
                                {question.category}
                              </span>
                            )}
                            <span className="badge badge-pending">
                              {question.difficulty}
                            </span>
                            <span className="badge badge-processing">
                              weight {question.weight}
                            </span>
                          </div>
                          <div className="card-meta">
                            Concepts: {question.expectedConcepts.map((item) => item.label).join(', ') || 'Not specified'}
                          </div>
                          <div className="card-meta">
                            Red flags: {question.redFlags.map((item) => item.label).join(', ') || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || loadingQuestions || questions.length === 0}
        >
          {submitting ? 'Creating...' : 'Create Interview'}
        </button>
      </form>
    </div>
  );
}
