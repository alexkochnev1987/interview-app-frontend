'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchQuestions, type Question } from '@/lib/api';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchQuestions();
        if (!cancelled) {
          setQuestions(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load questions.',
          );
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Question Bank
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Create reusable interview questions and enrich them with AI.
          </p>
        </div>
        <Link href="/questions/new" className="btn btn-primary">
          + New Question
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <p>No saved questions yet.</p>
          <Link href="/questions/new" className="btn btn-primary">
            Create your first question
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
                <div className="card" style={{ height: '100%' }}>
                <div className="card-title">{question.questionText}</div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.75rem',
                  }}
                >
                  {question.category && (
                    <span className="badge badge-processing">{question.category}</span>
                  )}
                  <span className="badge badge-pending">{question.difficulty}</span>
                  <span className="badge badge-processing">weight {question.weight}</span>
                </div>
                <div className="card-meta">
                  Concepts: {question.expectedConcepts.length}
                </div>
                <div className="card-meta">
                  Red flags: {question.redFlags.length}
                </div>
                {question.role && (
                  <div className="card-meta">Role: {question.role}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
