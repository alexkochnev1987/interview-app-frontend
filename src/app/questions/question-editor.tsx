'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  draftQuestion,
  type QuestionDraft,
  type QuestionDifficulty,
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
} from '@/lib/api';

type AiStatus = 'idle' | 'loading' | 'error';
type DraftFieldKey = keyof QuestionInput;

interface QuestionEditorProps {
  title: string;
  initialValue?: QuestionInput;
  submitLabel: string;
  onSubmit: (value: QuestionInput) => Promise<void>;
}

const DEFAULT_VALUE: QuestionInput = {
  externalId: '',
  role: 'frontend intern',
  focus: 'fundamentals',
  outputLanguage: 'English',
  category: '',
  subcategory: '',
  questionText: '',
  followUpQuestions: [],
  expectedConcepts: [],
  redFlags: [],
  difficulty: 'medium',
  weight: 1,
  sampleGoodAnswer: '',
  minimumPassScore: 2.5,
  tags: [],
  metadata: {},
};

const DRAFT_FIELDS: Array<{ key: DraftFieldKey; label: string }> = [
  { key: 'questionText', label: 'Question Text' },
  { key: 'category', label: 'Category' },
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'weight', label: 'Weight' },
  { key: 'followUpQuestions', label: 'Follow-up Questions' },
  { key: 'expectedConcepts', label: 'Expected Concepts' },
  { key: 'redFlags', label: 'Red Flags' },
  { key: 'sampleGoodAnswer', label: 'Sample Good Answer' },
  { key: 'minimumPassScore', label: 'Minimum Pass Score' },
  { key: 'tags', label: 'Tags' },
];

function parseStringList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinStringList(items: string[]): string {
  return items.join('\n');
}

function formatExpectedConcepts(items: QuestionExpectedConcept[]): string {
  return items
    .map((item) =>
      [item.id, item.label, item.weight.toFixed(4), item.description].join(' | '),
    )
    .join('\n');
}

function parseExpectedConcepts(value: string): QuestionExpectedConcept[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, weight, ...descriptionParts] = line
        .split('|')
        .map((part) => part.trim());
      const safeLabel = label || id || `concept_${index + 1}`;
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const numericWeight = Number(weight);
      return {
        id: safeId,
        label: safeLabel,
        weight: Number.isFinite(numericWeight) && numericWeight > 0 ? numericWeight : 1,
        description:
          descriptionParts.join(' | ') || `${safeLabel} should be covered in the answer.`,
      };
    });
}

function formatRedFlags(items: QuestionRedFlag[]): string {
  return items
    .map((item) => [item.id, item.label, item.severity].join(' | '))
    .join('\n');
}

function parseRedFlags(value: string): QuestionRedFlag[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [id, label, severity] = line.split('|').map((part) => part.trim());
      const safeLabel = label || id || `red_flag_${index + 1}`;
      const safeId = id || safeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      return {
        id: safeId,
        label: safeLabel,
        severity:
          severity === 'low' || severity === 'medium' || severity === 'high'
            ? severity
            : 'medium',
      };
    });
}

function formatMetadata(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}

function parseMetadata(value: string): Record<string, unknown> {
  if (!value.trim()) {
    return {};
  }

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Metadata must be a JSON object');
  }

  return parsed as Record<string, unknown>;
}

function normalizeInitialValue(initialValue?: QuestionInput): QuestionInput {
  return {
    ...DEFAULT_VALUE,
    ...initialValue,
    externalId: initialValue?.externalId ?? '',
    role: initialValue?.role ?? DEFAULT_VALUE.role,
    focus: initialValue?.focus ?? DEFAULT_VALUE.focus,
    outputLanguage: initialValue?.outputLanguage ?? DEFAULT_VALUE.outputLanguage,
    category: initialValue?.category ?? '',
    subcategory: initialValue?.subcategory ?? '',
    sampleGoodAnswer: initialValue?.sampleGoodAnswer ?? '',
    metadata: initialValue?.metadata ?? {},
  };
}

function areEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function previewValue(value: unknown): string {
  if (typeof value === 'string') {
    return value || 'Empty';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Empty';
    }
    return JSON.stringify(value, null, 2);
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return 'Empty';
}

export function QuestionEditor({
  title,
  initialValue,
  submitLabel,
  onSubmit,
}: QuestionEditorProps) {
  const [value, setValue] = useState<QuestionInput>(
    normalizeInitialValue(initialValue),
  );
  const [metadataText, setMetadataText] = useState(
    formatMetadata(initialValue?.metadata ?? {}),
  );
  const [submitting, setSubmitting] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiDraft, setAiDraft] = useState<QuestionDraft | null>(null);
  const [dismissedDraftFields, setDismissedDraftFields] = useState<DraftFieldKey[]>([]);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<QuestionInput>) {
    setValue((current) => ({ ...current, ...patch }));
  }

  async function handleGenerate() {
    if (!value.questionText.trim()) {
      setError('Question text is required before AI generation.');
      return;
    }

    setError(null);
    setAiStatus('loading');

    try {
      const draft = await draftQuestion(value);
      setAiDraft(draft);
      setDismissedDraftFields([]);
      setAiStatus('idle');
    } catch (err) {
      setAiStatus('error');
      setError(
        err instanceof Error ? err.message : 'Failed to generate question draft.',
      );
    }
  }

  function applyDraftField(field: DraftFieldKey) {
    if (!aiDraft) {
      return;
    }

    update({ [field]: aiDraft[field] } as Partial<QuestionInput>);
    setDismissedDraftFields((current) => current.filter((item) => item !== field));
  }

  function keepCurrentField(field: DraftFieldKey) {
    setDismissedDraftFields((current) =>
      current.includes(field) ? current : [...current, field],
    );
  }

  function applyAllAiFields() {
    if (!aiDraft) {
      return;
    }

    setValue((current) => ({
      ...current,
      ...aiDraft,
      externalId: current.externalId,
      role: current.role,
      focus: current.focus,
      outputLanguage: current.outputLanguage,
    }));
    setDismissedDraftFields([]);
  }

  const pendingDraftFields = useMemo(() => {
    if (!aiDraft) {
      return [];
    }

    return DRAFT_FIELDS.filter(
      ({ key }) =>
        !dismissedDraftFields.includes(key) &&
        !areEqual(value[key], aiDraft[key]),
    );
  }, [aiDraft, dismissedDraftFields, value]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    let metadata: Record<string, unknown>;
    try {
      metadata = parseMetadata(metadataText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid metadata JSON.');
      return;
    }

    const payload: QuestionInput = {
      externalId: value.externalId?.trim() || undefined,
      role: value.role?.trim() || undefined,
      focus: value.focus?.trim() || undefined,
      outputLanguage: value.outputLanguage.trim() || 'English',
      category: value.category?.trim() || undefined,
      subcategory: value.subcategory?.trim() || undefined,
      questionText: value.questionText.trim(),
      followUpQuestions: value.followUpQuestions.map((item) => item.trim()).filter(Boolean),
      expectedConcepts: value.expectedConcepts,
      redFlags: value.redFlags,
      difficulty: value.difficulty,
      weight: Math.max(0.1, Number(value.weight) || 1),
      sampleGoodAnswer: value.sampleGoodAnswer?.trim() || undefined,
      minimumPassScore: Math.max(0, Math.min(5, Number(value.minimumPassScore) || 0)),
      tags: value.tags.map((item) => item.trim()).filter(Boolean),
      metadata,
    };

    if (!payload.questionText) {
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

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 980 }}>
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
            AI uses the current form state and returns a structured draft you can merge field by field.
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

        {aiDraft && (
          <div
            className="card"
            style={{
              marginBottom: '1rem',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="card-title" style={{ marginBottom: '0.25rem' }}>
                  AI Draft
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Mocked structured response. Apply all fields or merge only the ones you want.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={applyAllAiFields}
                disabled={pendingDraftFields.length === 0}
              >
                Apply All AI Fields
              </button>
            </div>

            {pendingDraftFields.length === 0 ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                No unapplied AI differences remain.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {pendingDraftFields.map(({ key, label }) => (
                  <div
                    key={key}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{label}</div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Current
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            fontSize: '0.85rem',
                          }}
                        >
                          {previewValue(value[key])}
                        </pre>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          AI
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            fontSize: '0.85rem',
                          }}
                        >
                          {previewValue(aiDraft[key])}
                        </pre>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => applyDraftField(key)}
                      >
                        Use AI Value
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => keepCurrentField(key)}
                      >
                        Keep Current
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="externalId">
              External ID
            </label>
            <input
              id="externalId"
              className="form-input"
              type="text"
              value={value.externalId ?? ''}
              onChange={(event) => update({ externalId: event.target.value })}
              placeholder="Optional stable ID for imports"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role
            </label>
            <input
              id="role"
              className="form-input"
              type="text"
              value={value.role ?? ''}
              onChange={(event) => update({ role: event.target.value })}
              placeholder="e.g. frontend intern"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="focus">
              Focus
            </label>
            <input
              id="focus"
              className="form-input"
              type="text"
              value={value.focus ?? ''}
              onChange={(event) => update({ focus: event.target.value })}
              placeholder="e.g. fundamentals"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="outputLanguage">
              Output Language
            </label>
            <input
              id="outputLanguage"
              className="form-input"
              type="text"
              value={value.outputLanguage}
              onChange={(event) => update({ outputLanguage: event.target.value })}
              placeholder="English"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="questionText">
            Question Text
          </label>
          <textarea
            id="questionText"
            className="form-input"
            rows={4}
            value={value.questionText}
            onChange={(event) => update({ questionText: event.target.value })}
            placeholder="e.g. What is a closure in JavaScript?"
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
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              className="form-input"
              type="text"
              value={value.category ?? ''}
              onChange={(event) => update({ category: event.target.value })}
              placeholder="react | javascript | soft_skills"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="subcategory">
              Subcategory
            </label>
            <input
              id="subcategory"
              className="form-input"
              type="text"
              value={value.subcategory ?? ''}
              onChange={(event) => update({ subcategory: event.target.value })}
              placeholder="core | hooks | communication"
              disabled={submitting}
            />
          </div>

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
              min={0.1}
              max={10}
              step={0.1}
              value={value.weight}
              onChange={(event) =>
                update({ weight: Math.max(0.1, Number(event.target.value) || 1) })
              }
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="minimumPassScore">
              Minimum Pass Score
            </label>
            <input
              id="minimumPassScore"
              className="form-input"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={value.minimumPassScore}
              onChange={(event) =>
                update({
                  minimumPassScore: Math.max(
                    0,
                    Math.min(5, Number(event.target.value) || 0),
                  ),
                })
              }
              disabled={submitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="followUpQuestions">
            Follow-up Questions
          </label>
          <textarea
            id="followUpQuestions"
            className="form-input"
            rows={3}
            value={joinStringList(value.followUpQuestions)}
            onChange={(event) =>
              update({ followUpQuestions: parseStringList(event.target.value) })
            }
            placeholder="One question per line"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expectedConcepts">
            Expected Concepts
          </label>
          <textarea
            id="expectedConcepts"
            className="form-input"
            rows={6}
            value={formatExpectedConcepts(value.expectedConcepts)}
            onChange={(event) =>
              update({ expectedConcepts: parseExpectedConcepts(event.target.value) })
            }
            placeholder="id | label | weight | description"
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
            rows={5}
            value={formatRedFlags(value.redFlags)}
            onChange={(event) =>
              update({ redFlags: parseRedFlags(event.target.value) })
            }
            placeholder="id | label | severity"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sampleGoodAnswer">
            Sample Good Answer
          </label>
          <textarea
            id="sampleGoodAnswer"
            className="form-input"
            rows={4}
            value={value.sampleGoodAnswer ?? ''}
            onChange={(event) => update({ sampleGoodAnswer: event.target.value })}
            placeholder="Target depth reference for evaluation"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tags">
            Tags
          </label>
          <textarea
            id="tags"
            className="form-input"
            rows={2}
            value={joinStringList(value.tags)}
            onChange={(event) => update({ tags: parseStringList(event.target.value) })}
            placeholder="Comma or newline separated"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="metadata">
            Additional Metadata
          </label>
          <textarea
            id="metadata"
            className="form-input"
            rows={6}
            value={metadataText}
            onChange={(event) => {
              setMetadataText(event.target.value);
            }}
            placeholder='{"rubricVersion":"v1"}'
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
