'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchInterviews, type Interview } from '@/lib/api';

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'mock-1',
    candidateName: 'Alice Johnson',
    position: 'Senior Frontend Engineer',
    questions: ['Tell me about yourself', 'Describe a challenging project'],
    answers: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    candidateName: 'Bob Smith',
    position: 'Backend Developer',
    questions: ['Why this role?', 'System design experience?'],
    answers: [{ questionIndex: 0, mediaKey: 's3://mock', uploadedAt: new Date().toISOString() }],
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    candidateName: 'Carol Lee',
    position: 'Full Stack Engineer',
    questions: ['Strengths?', 'Weaknesses?', 'Where do you see yourself in 5 years?'],
    answers: [],
    status: 'completed',
    result: {
      overallScore: 82,
      summary: 'Strong candidate with good communication skills.',
      categoryScores: { technical: 85, communication: 80, problemSolving: 81 },
      completedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchInterviews();
        if (!cancelled) {
          setInterviews(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setInterviews(MOCK_INTERVIEWS);
          setUsingMock(true);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <Link href="/interviews/new" className="btn btn-primary">
          + New Interview
        </Link>
      </div>

      {usingMock && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Showing mock data (API unavailable)
        </p>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="empty-state">
          <p>No interviews yet.</p>
          <Link href="/interviews/new" className="btn btn-primary">
            Create your first interview
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {interviews.map((interview) => (
            <Link
              key={interview.id}
              href={`/interviews/${interview.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <div className="card-title">{interview.candidateName}</div>
                <div className="card-meta">{interview.position}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${interview.status}`}>
                    {interview.status.replace('_', ' ')}
                  </span>
                  <span className="card-meta">{formatDate(interview.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
