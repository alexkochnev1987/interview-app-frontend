'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  completeInterview,
  completeUpload,
  getInterview,
  getPresignedUrl,
  getResults,
  type Interview,
  type InterviewResult,
} from '@/lib/api';

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

interface QuestionUploadState {
  status: UploadStatus;
  errorMessage?: string;
}

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [results, setResults] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [uploadStates, setUploadStates] = useState<QuestionUploadState[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadInterview = useCallback(async () => {
    try {
      const data = await getInterview(id);
      setInterview(data);
      setUploadStates(
        data.questions.map((_, qi) => {
          const hasAnswer = data.answers.some((a) => a.questionIndex === qi);
          return { status: hasAnswer ? 'uploaded' : 'idle' } as QuestionUploadState;
        }),
      );

      if (data.status === 'completed') {
        try {
          const r = await getResults(id);
          setResults(r);
        } catch {
          // results may not be ready yet
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  function setFileInputRef(index: number, el: HTMLInputElement | null) {
    fileInputRefs.current[index] = el;
  }

  async function handleUpload(questionIndex: number) {
    const fileInput = fileInputRefs.current[questionIndex];
    if (!fileInput?.files?.length || !interview) return;

    const file = fileInput.files[0];

    setUploadStates((prev) =>
      prev.map((s, i) => (i === questionIndex ? { status: 'uploading' } : s)),
    );

    try {
      const { uploadUrl, mediaKey } = await getPresignedUrl(
        interview.id,
        questionIndex,
        file.type,
      );

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload to storage failed');
      }

      const updated = await completeUpload(interview.id, questionIndex, mediaKey);
      setInterview(updated);
      setUploadStates((prev) =>
        prev.map((s, i) => (i === questionIndex ? { status: 'uploaded' } : s)),
      );
    } catch (err) {
      setUploadStates((prev) =>
        prev.map((s, i) =>
          i === questionIndex
            ? { status: 'error', errorMessage: err instanceof Error ? err.message : 'Upload failed' }
            : s,
        ),
      );
    }
  }

  async function handleComplete() {
    if (!interview) return;
    setCompleting(true);
    setError(null);

    try {
      const updated = await completeInterview(interview.id);
      setInterview(updated);

      if (updated.status === 'completed' || updated.status === 'processing') {
        // Poll for results if processing
        if (updated.status === 'processing') {
          const pollInterval = setInterval(async () => {
            try {
              const refreshed = await getInterview(interview.id);
              setInterview(refreshed);
              if (refreshed.status === 'completed') {
                clearInterval(pollInterval);
                const r = await getResults(interview.id);
                setResults(r);
              } else if (refreshed.status === 'failed') {
                clearInterval(pollInterval);
              }
            } catch {
              clearInterval(pollInterval);
            }
          }, 2000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview.');
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading interview...</div>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <Link href="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!interview) return null;

  const allAnswered = interview.questions.every((_, qi) =>
    interview.answers.some((a) => a.questionIndex === qi),
  );
  const isTerminal = interview.status === 'completed' || interview.status === 'failed';
  const canComplete = allAnswered && !isTerminal && interview.status !== 'processing';

  return (
    <div className="page-container">
      <Link href="/" style={{ fontSize: '0.85rem', marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            {interview.candidateName}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            {interview.position}
          </p>
          <span className={`badge badge-${interview.status}`}>
            {interview.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>
        Questions &amp; Answers
      </h2>

      {interview.questions.map((question, qi) => {
        const hasAnswer = interview.answers.some((a) => a.questionIndex === qi);
        const uploadState = uploadStates[qi] ?? { status: 'idle' };

        return (
          <div key={qi} className="answer-item">
            <div className="answer-item-question">
              <span style={{ color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>
                Q{qi + 1}.
              </span>
              {question}
            </div>

            <div className="answer-item-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {hasAnswer || uploadState.status === 'uploaded' ? (
                <span className="badge badge-completed">Uploaded</span>
              ) : uploadState.status === 'uploading' ? (
                <span className="badge badge-processing">Uploading...</span>
              ) : uploadState.status === 'error' ? (
                <>
                  <span className="badge badge-failed">Error</span>
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    ref={(el) => setFileInputRef(qi, el)}
                    style={{ display: 'none' }}
                    onChange={() => handleUpload(qi)}
                  />
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fileInputRefs.current[qi]?.click()}
                    disabled={isTerminal}
                  >
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <span className="badge badge-pending">Pending</span>
                  {!isTerminal && interview.status !== 'processing' && (
                    <>
                      <input
                        type="file"
                        accept="video/*,audio/*"
                        ref={(el) => setFileInputRef(qi, el)}
                        style={{ display: 'none' }}
                        onChange={() => handleUpload(qi)}
                      />
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => fileInputRefs.current[qi]?.click()}
                      >
                        Upload
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {!isTerminal && (
        <div style={{ marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={!canComplete || completing}
          >
            {completing
              ? 'Completing...'
              : interview.status === 'processing'
                ? 'Processing...'
                : 'Complete Interview'}
          </button>
          {!allAnswered && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Upload answers to all questions before completing.
            </p>
          )}
        </div>
      )}

      {(interview.status === 'completed' && results) && (
        <div className="results-section">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Results
          </h2>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className="score-value">{results.overallScore}</div>
              <div>
                <div style={{ fontWeight: 600 }}>Overall Score</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  out of 100
                </div>
              </div>
            </div>
            <p>{results.summary}</p>
          </div>

          <div className="score-grid">
            {Object.entries(results.categoryScores).map(([category, score]) => (
              <div key={category} className="score-card">
                <div className="score-value">{score}</div>
                <div className="score-label">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
