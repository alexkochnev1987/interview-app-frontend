'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createInterview } from '@/lib/api';

export default function NewInterviewPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuestion() {
    setQuestions((prev) => [...prev, '']);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, value: string) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedQuestions = questions.map((q) => q.trim()).filter(Boolean);
    if (!candidateName.trim()) {
      setError('Candidate name is required.');
      return;
    }
    if (!position.trim()) {
      setError('Position is required.');
      return;
    }
    if (trimmedQuestions.length === 0) {
      setError('At least one question is required.');
      return;
    }

    setSubmitting(true);
    try {
      const interview = await createInterview({
        candidateName: candidateName.trim(),
        position: position.trim(),
        questions: trimmedQuestions,
      });
      router.push(`/interviews/${interview.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">New Interview</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="candidateName">
            Candidate Name
          </label>
          <input
            id="candidateName"
            className="form-input"
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
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
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Questions</label>
          {questions.map((q, i) => (
            <div key={i} className="question-row">
              <input
                className="form-input"
                type="text"
                value={q}
                onChange={(e) => updateQuestion(i, e.target.value)}
                placeholder={`Question ${i + 1}`}
                disabled={submitting}
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeQuestion(i)}
                  disabled={submitting}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addQuestion}
            disabled={submitting}
            style={{ marginTop: '0.25rem' }}
          >
            + Add Question
          </button>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Interview'}
        </button>
      </form>
    </div>
  );
}
