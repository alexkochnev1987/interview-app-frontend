'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchInterviews, type Interview } from '@/lib/api';

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'mock-1',
    candidateName: 'Alice Johnson',
    position: 'Senior Frontend Engineer',
    questions: [
      {
        id: 'mock-1-q1',
        text: 'Tell me about yourself',
        expectedConcepts: ['relevant experience', 'clear structure'],
        redFlags: ['too generic'],
        difficulty: 'easy',
        weight: 1,
      },
      {
        id: 'mock-1-q2',
        text: 'Describe a challenging project',
        expectedConcepts: ['ownership', 'trade-offs', 'result'],
        redFlags: ['no measurable outcome'],
        difficulty: 'medium',
        weight: 2,
      },
    ],
    answers: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    candidateName: 'Bob Smith',
    position: 'Backend Developer',
    questions: [
      {
        id: 'mock-2-q1',
        text: 'Why this role?',
        expectedConcepts: ['motivation', 'role alignment'],
        redFlags: ['generic motivation'],
        difficulty: 'easy',
        weight: 1,
      },
      {
        id: 'mock-2-q2',
        text: 'System design experience?',
        expectedConcepts: ['scalability', 'trade-offs'],
        redFlags: ['no constraints discussion'],
        difficulty: 'hard',
        weight: 3,
      },
    ],
    answers: [{ questionIndex: 0, mediaKey: 's3://mock', uploadedAt: new Date().toISOString() }],
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    candidateName: 'Carol Lee',
    position: 'Full Stack Engineer',
    questions: [
      {
        id: 'mock-3-q1',
        text: 'Strengths?',
        expectedConcepts: ['self-awareness', 'evidence'],
        redFlags: ['buzzwords only'],
        difficulty: 'easy',
        weight: 1,
      },
      {
        id: 'mock-3-q2',
        text: 'Weaknesses?',
        expectedConcepts: ['reflection', 'improvement plan'],
        redFlags: ['fake weakness'],
        difficulty: 'easy',
        weight: 1,
      },
      {
        id: 'mock-3-q3',
        text: 'Where do you see yourself in 5 years?',
        expectedConcepts: ['career direction', 'role fit'],
        redFlags: ['no alignment with role'],
        difficulty: 'easy',
        weight: 1,
      },
    ],
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
