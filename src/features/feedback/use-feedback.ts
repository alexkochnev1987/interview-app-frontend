import { useEffect, useState } from 'react';

import type { Feedback } from './types';

interface UseFeedbackResult {
  feedback: Feedback | null;
  error: string;
}

export function useFeedback(id: string, token: string): UseFeedbackResult {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/feedback/${id}?token=${token}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Invalid or expired feedback link');
        }
        return res.json();
      })
      .then((data) => setFeedback(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [id, token]);

  return { feedback, error };
}
