'use client';

import { useState, type FormEvent } from 'react';
import {
  draftQuestion,
  type QuestionDraft,
  type QuestionDifficulty,
  type QuestionInput,
} from '@/lib/api';

type AiStatus = 'idle' | 'loading' | 'error';

interface QuestionEditorProps {
  title: string;
  positionHint?: string;
  initialValue?: QuestionInput;
  submitLabel: string;
  onSubmit: (value: QuestionInput) => Promise<void>;
}

const DEFAULT_VALUE: QuestionInput = {
  text: '',
  expectedConcepts: [],
  redFlags: [],
  difficulty: 'medium',
  weight: 1,
};

function parseList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(items: string[]): string {
  return items.join(', ');
}

function applyDraft(
  current: QuestionInput,
  draft: QuestionDraft,
): QuestionInput {
  return {
    ...current,
    expectedConcepts: draft.expectedConcepts,
    redFlags: draft.redFlags,
    difficulty: draft.difficulty,
    weight: draft.weight,
  };
}

export function QuestionEditor({
  title,
  positionHint = '',
  initialValue,
  submitLabel,
  onSubmit,
}: QuestionEditorProps) {
  const [value, setValue] = useState<QuestionInput>(initialValue ?? DEFAULT_VALUE);
  const [position, setPosition] = useState(positionHint);
  const [submitting, setSubmitting] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<QuestionInput>) {
    setValue((current) => ({ ...current, ...patch }));
  }

  async function handleGenerate() {
    if (!value.text.trim()) {
      setError('Question text is required before AI generation.');
      return;
    }

    setError(null);
    setAiStatus('loading');

    try {
      const draft = await draftQuestion(value.text.trim(), position.trim());
      setValue((current) => applyDraft(current, draft));
      setAiStatus('idle');
    } catch (err) {
      setAiStatus('error');
      setError(
        err instanceof Error ? err.message : 'Failed to generate question draft.',
      );
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: QuestionInput = {
      text: value.text.trim(),
      expectedConcepts: value.expectedConcepts.map((item) => item.trim()).filter(Boolean),
      redFlags: value.redFlags.map((item) => item.trim()).filter(Boolean),
      difficulty: value.difficulty,
      weight: Math.max(1, Number(value.weight) || 1),
    };

    if (!payload.text) {
      setError('Question text is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question.');
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 860 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            AI can prefill concepts, red flags, difficulty and weight.
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleGenerate}
            disabled={submitting || aiStatus === 'loading'}
          >
            {aiStatus === 'loading' ? 'AI...' : 'AI'}
          </button>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="questionText">
            Question Text
          </label>
          <input
            id="questionText"
            className="form-input"
            type="text"
            value={value.text}
            onChange={(event) => update({ text: event.target.value })}
            placeholder="e.g. Describe a time you improved system reliability"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="positionHint">
            Position Context For AI
          </label>
          <input
            id="positionHint"
            className="form-input"
            type="text"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="e.g. Senior Backend Engineer"
            disabled={submitting}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="difficulty">
              Difficulty
            </label>
            <select
              id="difficulty"
              className="form-input"
              value={value.difficulty}
              onChange={(event) =>
                update({
                  difficulty: event.target.value as QuestionDifficulty,
                })
              }
              disabled={submitting}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="weight">
              Weight
            </label>
            <input
              id="weight"
              className="form-input"
              type="number"
              min={1}
              max={10}
              value={value.weight}
              onChange={(event) =>
                update({ weight: Math.max(1, Number(event.target.value) || 1) })
              }
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expectedConcepts">
            Expected Concepts
          </label>
          <textarea
            id="expectedConcepts"
            className="form-input"
            rows={4}
            value={joinList(value.expectedConcepts)}
            onChange={(event) =>
              update({ expectedConcepts: parseList(event.target.value) })
            }
            placeholder="Comma or newline separated"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="redFlags">
            Red Flags
          </label>
          <textarea
            id="redFlags"
            className="form-input"
            rows={4}
            value={joinList(value.redFlags)}
            onChange={(event) =>
              update({ redFlags: parseList(event.target.value) })
            }
            placeholder="Comma or newline separated"
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </form>
    </div>
  );
}
