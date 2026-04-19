'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchInterviews, type Interview } from '@/lib/api';

function mockQuestion(
  id: string,
  questionText: string,
  expectedConceptLabels: string[],
  redFlagLabels: string[],
  difficulty: 'easy' | 'medium' | 'hard',
  weight: number,
) {
  return {
    id,
    role: 'frontend intern',
    focus: 'fundamentals',
    outputLanguage: 'English',
    category: 'soft_skills',
    subcategory: 'fundamentals',
    questionText,
    followUpQuestions: [],
    expectedConcepts: expectedConceptLabels.map((label, index) => ({
      id: `${id}_concept_${index + 1}`,
      label,
      weight: Number((1 / expectedConceptLabels.length).toFixed(4)),
      description: `${label} should be covered in the answer.`,
    })),
    redFlags: redFlagLabels.map((label, index) => ({
      id: `${id}_flag_${index + 1}`,
      label,
      severity: 'medium' as const,
    })),
    difficulty,
    weight,
    sampleGoodAnswer: '',
    minimumPassScore: difficulty === 'hard' ? 3.5 : difficulty === 'medium' ? 3 : 2.5,
    tags: [],
    metadata: {},
  };
}

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: 'mock-11',
    candidateName: 'Alice Johnson',
    position: 'Senior Frontend Engineer',
    questions: [
      mockQuestion(
        'mock-1-q1',
        'Tell me about yourself',
        ['relevant experience', 'clear structure'],
        ['too generic'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-1-q2',
        'Describe a challenging project',
        ['ownership', 'trade-offs', 'result'],
        ['no measurable outcome'],
        'medium',
        2,
      ),
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
      mockQuestion(
        'mock-2-q1',
        'Why this role?',
        ['motivation', 'role alignment'],
        ['generic motivation'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-2-q2',
        'System design experience?',
        ['scalability', 'trade-offs'],
        ['no constraints discussion'],
        'hard',
        3,
      ),
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
      mockQuestion(
        'mock-3-q1',
        'Strengths?',
        ['self-awareness', 'evidence'],
        ['buzzwords only'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-3-q2',
        'Weaknesses?',
        ['reflection', 'improvement plan'],
        ['fake weakness'],
        'easy',
        1,
      ),
      mockQuestion(
        'mock-3-q3',
        'Where do you see yourself in 5 years?',
        ['career direction', 'role fit'],
        ['no alignment with role'],
        'easy',
        1,
      ),
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
