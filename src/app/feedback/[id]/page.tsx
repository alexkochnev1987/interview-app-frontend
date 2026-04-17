'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface Feedback {
  overallResult?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  generalFeedback?: string;
  improvements?: string;
  position: string;
  date: string;
  expiresAt: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get('token') || '';

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/feedback/${id}?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invalid or expired feedback link');
        return res.json();
      })
      .then((data) => setFeedback(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [id, token]);

  if (error) {
    return (
      <div className="take-container">
        <div className="card error-card">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return <div className="take-container"><p>Loading feedback...</p></div>;
  }

  return (
    <div className="take-container">
      <div className="card">
        <h2>Interview Feedback</h2>
        <p><strong>Position:</strong> {feedback.position}</p>
        <p><strong>Date:</strong> {new Date(feedback.date).toLocaleDateString()}</p>

        {feedback.overallResult && (
          <div className="feedback-section">
            <h3>Result</h3>
            <span className={`status-badge status-${feedback.overallResult}`}>
              {feedback.overallResult}
            </span>
          </div>
        )}

        {feedback.overallScore !== undefined && (
          <div className="feedback-section">
            <h3>Overall Score</h3>
            <div className="score-display">{feedback.overallScore}/100</div>
          </div>
        )}

        {feedback.categoryScores && (
          <div className="feedback-section">
            <h3>Category Scores</h3>
            <div className="category-grid">
              {Object.entries(feedback.categoryScores).map(([cat, score]) => (
                <div key={cat} className="category-card">
                  <span className="category-name">{cat}</span>
                  <span className="category-score">{score}/100</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {feedback.generalFeedback && (
          <div className="feedback-section">
            <h3>Feedback</h3>
            <p>{feedback.generalFeedback}</p>
          </div>
        )}

        {feedback.improvements && (
          <div className="feedback-section">
            <h3>Recommendations</h3>
            <p>{feedback.improvements}</p>
          </div>
        )}

        <p className="feedback-expiry">
          This link is valid until {new Date(feedback.expiresAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
